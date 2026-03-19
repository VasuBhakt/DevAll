import httpx
from utils import APIException
from pydantic import BaseModel, Field, ConfigDict
import asyncio
import logging
import time

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class CodeforcesContest(BaseModel):
    contest_id: int = Field(alias="contestId")
    contest_name: str = Field(alias="contestName")
    rank: int
    old_rating: int = Field(alias="oldRating")
    new_rating: int = Field(alias="newRating")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class CodeforcesProfile(BaseModel):
    handle: str
    profile_link: str
    rating: int
    max_rating: int
    rank: str
    max_rank: str
    contests: list[CodeforcesContest]

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


BASE_URL = "https://codeforces.com/api/"


async def _throttle_cf_request(redis_client, cooldown=2.5):
    """Distributed throttle using Redis to space out requests globally."""
    if not redis_client:
        return

    key = "cf_global_last_request"
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


async def fetch_codeforces_profile(handle: str, redis_client=None):
    # If no redis, we just fallback to raw fetch (not recommended in production)
    if not redis_client:
        return await _fetch_raw(handle)

    # Distributed Lock: Ensures ONLY ONE handle is being fetched from CF at any moment
    # across your entire backend server cluster.
    async with redis_client.lock("cf_global_fetch_lock", timeout=15):
        try:
            # 1. Wait for global CF cooldown (2 seconds)
            await _throttle_cf_request(redis_client)
            return await _fetch_cf_raw(handle)
        except Exception as e:
            logger.error(f"Failed to fetch CF profile: {str(e)}")
            raise APIException(400, f"Failed to fetch CF profile: {str(e)}")


async def _fetch_cf_raw(handle: str):
    """Internal helper to do the actual network IO concurrently."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        user_url = f"{BASE_URL}user.info?handles={handle}"
        contest_url = f"{BASE_URL}user.rating?handle={handle}"

        # THE OPTIMIZATION: Fire both requests at once (parallel)
        user_task = client.get(user_url)
        contest_task = client.get(contest_url)

        user_res, contest_res = await asyncio.gather(user_task, contest_task)

        if user_res.status_code != 200 or contest_res.status_code != 200:
            raise APIException(400, "Failed to fetch codeforces profile")

        user_info = user_res.json()["result"][0]
        contest_info = contest_res.json()["result"]

        contests = [CodeforcesContest(**c) for c in contest_info]

        return CodeforcesProfile(
            handle=user_info["handle"],
            profile_link=f"https://codeforces.com/profile/{user_info['handle']}",
            rating=user_info.get("rating"),
            max_rating=user_info.get("maxRating"),
            rank=user_info.get("rank"),
            max_rank=user_info.get("maxRank"),
            contests=contests,
        )
