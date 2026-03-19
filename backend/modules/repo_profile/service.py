from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import Repo_Profile, get_db
import logging
from sqlalchemy.dialects.postgresql import insert
from .fetchers import (
    fetch_github_profile,
    GithubProfile,
)
from utils import APIException
import json

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class RepoProfileService:

    async def fetch_repo_profile(
        self,
        user_id: str,
        handle: str,
        platform: str,
        db: AsyncSession,
        redis_client=None,
    ):
        cache_key = f"repo_profile:{platform}:{handle}"

        # 1. Determine which model to use
        if platform == "github":
            platform_model = GithubProfile
        else:
            raise APIException(
                status=400, message="Invalid platform", error_code="INVALID_PLATFORM"
            )

        # 2. Check Cache
        if redis_client:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                logger.info(f"Cache hit for {cache_key}")
                return platform_model.model_validate_json(cached_data)

        # 3. Fetch if not in cache
        profile = None
        if platform == "github":
            profile = await fetch_github_profile(handle, redis_client)

        if not profile:
            raise APIException(
                status=404, message="Profile not found", error_code="NOT_FOUND"
            )

        # 4. Update DB (Background sync)
        profile_data = profile.model_dump(mode="json", by_alias=False)
        stmt = insert(Repo_Profile).values(
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
