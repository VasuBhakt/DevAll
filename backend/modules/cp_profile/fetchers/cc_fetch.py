import asyncio
import logging
import time
import re
import json
import httpx
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field, ConfigDict
from utils import APIException
from datetime import date, datetime

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class CodeChefContest(BaseModel):
    contest_name: str
    rank: int
    rating: int
    date: date

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class CodeChefProfile(BaseModel):
    handle: str
    profile_link: str
    rating: int = 0
    max_rating: int = 0
    rank: str = ""  # Stars
    max_rank: str = ""
    contests: list[CodeChefContest] = []

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


async def _throttle_cc_request(redis_client, cooldown=2.5):
    """Distributed throttle using Redis to space out requests globally."""
    if not redis_client:
        return

    key = "cc_global_last_request"
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


async def fetch_codechef_profile(handle: str, redis_client=None):
    if not redis_client:
        return await _fetch_cc_raw(handle)

    async with redis_client.lock("cc_global_fetch_lock", timeout=15):
        try:
            await _throttle_cc_request(redis_client)
            return await _fetch_cc_raw(handle)
        except Exception as e:
            logger.error(f"Failed to fetch CodeChef profile: {str(e)}")
            raise APIException(400, f"Failed to fetch CodeChef profile: {str(e)}")


async def _fetch_cc_raw(handle: str):
    profile_url = f"https://www.codechef.com/users/{handle}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.get(
                profile_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                },
            )

            if response.status_code != 200:
                raise APIException(404, "CodeChef user not found")

            soup = BeautifulSoup(response.text, "lxml")

            # 1. Current Rating
            rating_div = soup.select_one(".rating-number")
            rating = int(rating_div.text) if rating_div else 0

            # 2. Max Rating (e.g., "Highest Rating 1600")
            max_rating = 0
            header_small = soup.select_one(".rating-header small")
            if header_small:
                match = re.search(r"Highest Rating\s+(\d+)", header_small.text)
                if match:
                    max_rating = int(match.group(1))

            # 3. Stars / Rank (e.g., "5★")
            stars = _calculate_stars(rating)
            max_stars = _calculate_stars(max_rating)

            # 4. Contest History (Hidden in a script tag as JSON)
            contests = []
            scripts = soup.find_all("script")
            for script in scripts:
                if script.string and "var all_rating =" in script.string:
                    # Regex to extract the list inside all_rating = [...]
                    json_match = re.search(r"var all_rating\s*=\s*(.*);", script.string)
                    if json_match:
                        try:
                            history_data = json.loads(json_match.group(1))
                            for c in history_data:
                                # date format: "2023-07-15 15:00:00"
                                try:
                                    cdate = datetime.strptime(
                                        c["end_date"], "%Y-%m-%d %H:%M:%S"
                                    ).date()
                                except:
                                    cdate = date.today()

                                contests.append(
                                    CodeChefContest(
                                        contest_name=c["name"],
                                        rank=int(c.get("rank", 0)),
                                        rating=int(c.get("rating", 0)),
                                        date=cdate,
                                    )
                                )
                        except Exception as je:
                            logger.error(f"Failed to parse CodeChef history JSON: {je}")
                    break

            return CodeChefProfile(
                handle=handle,
                profile_link=profile_url,
                rating=rating,
                max_rating=max_rating,
                rank=stars,
                max_rank=max_stars,
                contests=contests,
            )

        except Exception as e:
            logger.error(f"CodeChef scrape error: {str(e)}")
            raise APIException(400, f"Failed to fetch CodeChef profile: {str(e)}")


def _calculate_stars(rating: int) -> str:
    if rating <= 1399:
        return "1"
    elif rating <= 1599:
        return "2"
    elif rating <= 1799:
        return "3"
    elif rating <= 1999:
        return "4"
    elif rating <= 2199:
        return "5"
    elif rating <= 2499:
        return "6"
    else:
        return "7"
