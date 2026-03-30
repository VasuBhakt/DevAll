import asyncio
import logging
import time
import httpx
import re
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field, ConfigDict
from utils import APIException
from datetime import date, datetime
from typing import Optional

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def _throttle_ac_request(redis_client, cooldown=2.5):
    """Distributed throttle using Redis to space out requests globally."""
    if not redis_client:
        return

    key = "ac_global_last_request"
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


class AtCoderContest(BaseModel):
    contest_name: str
    rank: int
    rating: int
    date: date

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AtCoderProfile(BaseModel):
    handle: str
    profile_link: str
    rating: int = 0
    max_rating: int = 0
    rank: str = ""
    max_rank: str = ""
    contests: list[AtCoderContest] = []
    avatar: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


async def fetch_atcoder_profile(handle: str, redis_client=None):
    if not redis_client:
        return await _fetch_ac_raw(handle)

    async with redis_client.lock("ac_global_fetch_lock", timeout=15):
        try:
            await _throttle_ac_request(redis_client)
            return await _fetch_ac_raw(handle)
        except Exception as e:
            logger.error(f"Failed to fetch AtCoder profile: {str(e)}")
            raise APIException(
                status=400,
                message=f"Failed to fetch AtCoder profile: {str(e)}",
                error_code="FAILED_REQUEST",
            )


async def _fetch_ac_raw(handle: str):
    profile_url = f"https://atcoder.jp/users/{handle}"
    history_url = f"https://atcoder.jp/users/{handle}/history/json"

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            # Fire both requests at once
            profile_task = client.get(profile_url)
            history_task = client.get(history_url)

            p_res, h_res = await asyncio.gather(profile_task, history_task)

            if p_res.status_code != 200:
                raise APIException(
                    status=404, message="AtCoder user not found", error_code="NOT_FOUND"
                )

            soup = BeautifulSoup(p_res.text, "lxml")

            # 1. Scrape Current/Max rating from the table
            rating = 0
            max_rating = 0
            rank = ""
            max_rank = ""
            avatar = None
            avatar_tag = soup.select_one("img.avatar")
            if avatar_tag:
                avatar = avatar_tag.get("src")
            # Find the main stats table
            rows = soup.find_all("tr")
            for row in rows:
                header = row.find("th")
                if not header:
                    continue
                text = header.text.strip()
                val_cell = row.find("td")

                if text == "Rating":
                    rating_span = val_cell.find("span")
                    if rating_span:
                        rating = int(re.sub(r"\D", "", rating_span.text))
                        # Current rank (color class)
                        rank_match = re.search(
                            r"user-(\w+)", str(rating_span.get("class", []))
                        )
                        rank = rank_match.group(1) if rank_match else ""

                elif text == "Highest Rating":
                    max_rating_span = val_cell.find("span")
                    if max_rating_span:
                        max_rating = int(re.sub(r"\D", "", max_rating_span.text))
                        # Max rank (color class)
                        max_rank_match = re.search(
                            r"user-(\w+)", str(max_rating_span.get("class", []))
                        )
                        max_rank = max_rank_match.group(1) if max_rank_match else ""

            # 2. Parse History JSON
            contests = []
            if h_res.status_code == 200:
                history_data = h_res.json()
                for c in history_data:
                    # Usually: {"IsRated": true, "Place": 123, "OldRating": 0, "NewRating": 100, "EndTime": "2024-03...}
                    if not c.get("IsRated"):
                        continue

                    try:
                        # Extract date (e.g., "2024-03-18T21:00:00+09:00" -> 2024-03-18)
                        c_date_str = c["EndTime"].split("T")[0]
                        c_date = datetime.strptime(c_date_str, "%Y-%m-%d").date()
                    except:
                        c_date = date.today()

                    contests.append(
                        AtCoderContest(
                            contest_name=c["ContestName"],
                            rank=c["Place"],
                            rating=c["NewRating"],
                            date=c_date,
                        )
                    )

            return AtCoderProfile(
                handle=handle,
                profile_link=profile_url,
                rating=rating,
                max_rating=max_rating,
                rank=rank,
                max_rank=max_rank,
                contests=contests,
                avatar=avatar,
            )

        except Exception as e:
            logger.error(f"AtCoder fetch error: {str(e)}")
            raise APIException(
                status=400,
                message=f"Failed to fetch AtCoder profile: {str(e)}",
                error_code="FAILED_REQUEST",
            )
