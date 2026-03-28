from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import asyncio
from fastapi import Depends
from database import CP_Profile, User, get_db
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
from .schemas import CPProfileResponse

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class CPProfileService:
    def __init__(self):
        self._db_lock = asyncio.Lock()

    async def fetch_cp_profile(
        self,
        user_id: str,
        handle: str,
        platform: str,
        db: AsyncSession,
        redis_client=None,
        force: bool = False,
    ):
        cache_key = f"cp_profile:{platform}:{user_id}"

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

        # 2. Check Cache (Skip if force=True)
        if redis_client and not force:
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

        # 4. Update DB (Background sync) - Use lock to avoid concurrent session access
        async with self._db_lock:
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

    async def get_cp_profiles(
        self, username: str, db: AsyncSession, redis_client=None
    ) -> CPProfileResponse:
        """Fetches all CP profiles for a user. If not refreshed in 24 hours, fetches from API."""
        # 1. Fetch User ID and existing profiles in one query
        query = (
            select(User.id, CP_Profile)
            .outerjoin(CP_Profile, User.id == CP_Profile.user_id)
            .where(User.username == username)
        )
        result = await db.execute(query)
        rows = result.all()

        if not rows:
            raise APIException(
                status=404, message="User not found", status_code="USER_NOT_FOUND"
            )

        user_id = rows[0].id
        # Filter out None values from the outer join if user has no profiles
        db_profiles = {
            row.CP_Profile.platform: row.CP_Profile for row in rows if row.CP_Profile
        }

        fresh_key = f"cp_profiles:fresh:{username}"

        # 2. Check if data is "fresh" (within 24 hours)
        is_fresh = False
        if redis_client:
            is_fresh = await redis_client.get(fresh_key)

        # 3. If NOT fresh, refresh all existing platforms in parallel
        if not is_fresh:
            logger.info(f"Refreshing all CP profiles for user {username} (24h stale)")
            platforms = list(db_profiles.keys())
            tasks = [
                self.fetch_cp_profile(
                    user_id, db_profiles[p].handle, p, db, redis_client, force=True
                )
                for p in platforms
            ]

            if tasks:
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for i, res in enumerate(results):
                    if isinstance(res, Exception):
                        logger.error(
                            f"Background refresh failed for {platforms[i]}: {str(res)}"
                        )
                    else:
                        # Update local dict with new data to avoid re-fetching from DB
                        db_profiles[platforms[i]] = res
            # Set fresh flag for 24 hours
            if redis_client:
                await redis_client.set(fresh_key, "true", ex=24 * 3600)

        # 4. Map to CPProfileResponse
        response = CPProfileResponse()
        for platform, profile in db_profiles.items():
            # The profile in DB has the same structure as the Pydantic models (JSONB)
            # We wrap them in their respective Pydantic models for validation
            if platform == "codeforces":
                response.codeforces = CodeforcesProfile.model_validate(profile)
            elif platform == "leetcode":
                response.leetcode = LeetCodeProfile.model_validate(profile)
            elif platform == "codechef":
                response.codechef = CodeChefProfile.model_validate(profile)
            elif platform == "atcoder":
                response.atcoder = AtCoderProfile.model_validate(profile)

        return response

    async def delete_cp_profile(
        self, user_id: str, platform: str, db: AsyncSession, redis_client=None
    ):
        query = select(CP_Profile).where(
            CP_Profile.user_id == user_id, CP_Profile.platform == platform
        )
        result = await db.execute(query)
        existing_profile = result.scalars().first()
        if not existing_profile:
            raise APIException(
                status=404, message="Profile not found", error_code="PROFILE_NOT_FOUND"
            )
        try:
            await db.delete(existing_profile)
            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during profile deletion: {e}")
            raise APIException(
                message="An error occurred while deleting profile",
                status=500,
                error_code="SERVER_ERROR",
            )
        if redis_client:
            await redis_client.delete(f"cp_profile:{platform}:{user_id}")
        return "Profile deleted successfully"
