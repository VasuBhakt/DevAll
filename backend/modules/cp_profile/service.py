from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends
from database import CP_Profile, get_db
import logging
from sqlalchemy.dialects.postgresql import insert
from .fetchers import fetch_codeforces_profile, CodeforcesProfile
import json

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class CPProfileService:

    async def fetch_cp_profile(
        self,
        user_id: str,
        handle: str,
        platform: str,
        db: AsyncSession,
        redis_client=None,
    ) -> CodeforcesProfile:
        cache_key = f"cp_profile:{platform}:{handle}"

        # 1. Check Cache
        if redis_client:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Cache hit for {cache_key}")
                return CodeforcesProfile.model_validate_json(cached_data)

        # 2. Fetch if not in cache
        if platform == "codeforces":
            profile = await fetch_codeforces_profile(handle, redis_client)
            profile_data = profile.model_dump()

            # 3. Update DB (Background sync)
            stmt = insert(CP_Profile).values(
                user_id=user_id, platform=platform, **profile_data
            )
            stmt = stmt.on_conflict_do_update(
                index_elements=["user_id", "platform"],
                set_={
                    "handle": profile_data["handle"],
                    "profile_link": profile_data["profile_link"],
                    "rating": profile_data["rating"],
                    "max_rating": profile_data["max_rating"],
                    "rank": profile_data["rank"],
                    "max_rank": profile_data["max_rank"],
                    "contests": profile_data["contests"],
                },
            )
            await db.execute(stmt)
            await db.commit()

            # 4. Save to Cache
            if redis_client:
                # Cache for 6 hours
                await redis_client.set(
                    cache_key, profile.model_dump_json(), ex=3600 * 6  # 6 hours
                )
                logger.info(f"Cached data for {cache_key}")

            return profile

        return None
