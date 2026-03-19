import asyncio
import logging
import time
import httpx
from pydantic import BaseModel, Field, ConfigDict
from utils import APIException
from datetime import date

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class LeetCodeContest(BaseModel):
    contest_name: str
    rank: int
    rating: int
    date: date  # Timestamp

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class LeetCodeProfile(BaseModel):
    handle: str
    profile_link: str
    rating: int = 0
    problems_solved: int = 0
    easy_problems: int = 0
    medium_problems: int = 0
    hard_problems: int = 0
    rank: str = ""
    contests: list[LeetCodeContest] = []

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


async def _throttle_lc_request(redis_client, cooldown=2.5):
    """Distributed throttle using Redis to space out requests globally."""
    if not redis_client:
        return

    key = "lc_global_last_request"
    while True:
        last_request = await redis_client.get(key)
        now = time.time()

        if last_request:
            elapsed = now - float(last_request)
            if elapsed < cooldown:
                wait_time = cooldown - elapsed
                logger.info(f"Throttling: Spacing out requests by {wait_time:.2f}s")
                await asyncio.sleep(wait_time)
                continue

        # Atomic set to update the last request time
        await redis_client.set(key, str(time.time()))
        break


LEETCODE_GQL_URL = "https://leetcode.com/graphql"


async def fetch_leetcode_profile(handle: str, redis_client=None):
    if not redis_client:
        return await _fetch_lc_raw(handle)

    # Distributed Lock: Ensures ONLY ONE handle is being fetched from LC at any moment
    async with redis_client.lock("lc_global_fetch_lock", timeout=15):
        try:
            # 1. Wait for global LC cooldown (2.5 seconds)
            await _throttle_lc_request(redis_client)
            return await _fetch_lc_raw(handle)
        except Exception as e:
            logger.error(f"Failed to fetch LeetCode profile: {str(e)}")
            raise APIException(400, f"Failed to fetch LeetCode profile: {str(e)}")


async def _fetch_lc_raw(handle: str):
    """Internal helper to do the actual GraphQL query."""
    query = """
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userContestRanking(username: $username) {
        rating
        badge {
          name
        }
      }
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
    """

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.post(
                LEETCODE_GQL_URL,
                json={"query": query, "variables": {"username": handle}},
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0",  # LC needs a user agent
                },
            )

            if response.status_code != 200:
                raise APIException(400, "Failed to connect to LeetCode")

            data = response.json().get("data")
            if not data or not data.get("matchedUser"):
                raise APIException(404, "LeetCode user not found")

            # Extract counts
            stats = data["matchedUser"]["submitStats"]["acSubmissionNum"]
            counts = {s["difficulty"]: s["count"] for s in stats}

            # Extract rating and Knight/Guardian rank
            ranking = data.get("userContestRanking")
            rating = int(ranking["rating"]) if ranking else 0
            rank_name = (
                ranking["badge"]["name"] if ranking and ranking.get("badge") else ""
            )

            # Extract contest history (filter for attended=true)
            history = data.get("userContestRankingHistory", [])
            contests = [
                LeetCodeContest(
                    contest_name=c["contest"]["title"],
                    rank=c["ranking"],
                    rating=int(c["rating"]),
                    date=date.fromtimestamp(c["contest"]["startTime"]),
                )
                for c in history
                if c.get("attended")
            ]

            return LeetCodeProfile(
                handle=handle,
                profile_link=f"https://leetcode.com/u/{handle}/",
                rating=rating,
                problems_solved=counts.get("All", 0),
                easy_problems=counts.get("Easy", 0),
                medium_problems=counts.get("Medium", 0),
                hard_problems=counts.get("Hard", 0),
                rank=rank_name,
                contests=contests,
            )
        except Exception as e:
            logger.error(f"LeetCode fetch error: {str(e)}")
            raise APIException(400, f"Failed to fetch LeetCode profile: {str(e)}")
