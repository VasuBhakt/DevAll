from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends
from database import CP_Profile, get_db
import logging
from sqlalchemy.dialects.postgresql import insert
from .fetchers import (
    fetch_codeforces_profile,
    CodeforcesProfile,
    fetch_leetcode_profile,
    LeetCodeProfile,
    fetch_codechef_profile,
    CodeChefProfile,
    fetch_atcoder_profile,
    AtCoderProfile,
)
import json
from utils import APIException

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
    ):
        cache_key = f"cp_profile:{platform}:{handle}"

        # 1. Determine which model to use
        if platform == "codeforces":
            platform_model = CodeforcesProfile
        elif platform == "leetcode":
            platform_model = LeetCodeProfile
        elif platform == "codechef":
            platform_model = CodeChefProfile
        elif platform == "atcoder":
            platform_model = AtCoderProfile
        else:
            raise APIException(400, "Invalid platform")

        # 2. Check Cache
        if redis_client:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Cache hit for {cache_key}")
                return platform_model.model_validate_json(cached_data)

        # 3. Fetch if not in cache
        profile = None
        if platform == "codeforces":
            profile = await fetch_codeforces_profile(handle, redis_client)
        elif platform == "leetcode":
            profile = await fetch_leetcode_profile(handle, redis_client)
        elif platform == "codechef":
            profile = await fetch_codechef_profile(handle, redis_client)
        elif platform == "atcoder":
            profile = await fetch_atcoder_profile(handle, redis_client)
        else:
            raise APIException(
                status=400, message="Invalid platform", status_code="INVALID"
            )

        if not profile:
            raise APIException(
                status=404, message="Profile not found", status_code="NOT_FOUND"
            )

        # 4. Update DB (Background sync)
        profile_data = profile.model_dump(mode="json", by_alias=False)
        stmt = insert(CP_Profile).values(
            user_id=user_id, platform=platform, **profile_data
        )

        # Build update set dynamically from profile data
        update_set = {k: v for k, v in profile_data.items() if k != "user_id"}

        stmt = stmt.on_conflict_do_update(
            index_elements=["user_id", "platform"],
            set_=update_set,
        )
        await db.execute(stmt)
        await db.commit()

        # 5. Save to Cache
        if redis_client:
            # Cache for 6 hours
            await redis_client.set(
                cache_key, profile.model_dump_json(by_alias=False), ex=3600 * 6
            )
            logger.info(f"Cached data for {cache_key}")

        return profile
