from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import asyncio
from database import Repo_Profile, User, get_db
from fastapi import Depends
import logging
from sqlalchemy.dialects.postgresql import insert
from .fetchers import (
    fetch_github_profile,
    GithubProfile,
    fetch_hugging_face_profile,
    HuggingFaceProfile,
)
from utils import APIException
from .schemas import RepoProfileResponse
import json
from tenacity import retry, stop_after_attempt, wait_exponential
from database.database import AsyncSessionLocal
from fastapi import BackgroundTasks

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class RepoProfileService:
    def __init__(self):
        self._db_lock = asyncio.Lock()

    async def fetch_repo_profile(
        self,
        user_id: str,
        handle: str,
        platform: str,
        db: AsyncSession,
        redis_client=None,
        force: bool = False,
    ):

        # 1. Determine which model to use
        if platform == "github":
            platform_model = GithubProfile
        elif platform == "hugging_face":
            platform_model = HuggingFaceProfile
        else:
            raise APIException(
                status=400, message="Invalid platform", error_code="INVALID_PLATFORM"
            )

        cache_key = f"{platform}:{user_id}"
        if redis_client and await redis_client.exists(cache_key):
            query = select(Repo_Profile).where(
                Repo_Profile.user_id == user_id, Repo_Profile.platform == platform
            )
            result = await db.execute(query)
            existing_profile = result.scalars().first()
            if existing_profile:
                logger.info(f"Cache hit for {cache_key}")
                return platform_model.model_validate(existing_profile)

        # 3. Fetch if not in cache
        profile = None
        if platform == "github":
            profile = await fetch_github_profile(handle, redis_client)
        elif platform == "hugging_face":
            profile = await fetch_hugging_face_profile(handle, redis_client)

        if not profile:
            raise APIException(
                status=404, message="Profile not found", error_code="NOT_FOUND"
            )

        # 4. Update DB (Background sync) - Use lock to avoid concurrent session access
        async with self._db_lock:
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
            await redis_client.set(cache_key, "true", ex=3600 * 6)
            logger.info(f"Cached data for {cache_key}")

        return profile

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def fetch_repo_profile_with_retry(self, user_id, handle, platform, db, redis_client):
        return await self.fetch_repo_profile(user_id, handle, platform, db, redis_client, force=True)

    async def background_refresh_all(self, user_id, profiles_to_fetch, redis_client, username):
        async with AsyncSessionLocal() as db:
            tasks = [
                self.fetch_repo_profile_with_retry(user_id, handle, platform, db, redis_client)
                for platform, handle in profiles_to_fetch.items()
            ]
            if tasks:
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for i, res in enumerate(results):
                    platform = list(profiles_to_fetch.keys())[i]
                    if isinstance(res, Exception):
                        logger.error(f"Background refresh failed for {platform}: {str(res)}")
            
            fresh_key = f"repo_profiles:fresh:{username}"
            if redis_client:
                await redis_client.set(fresh_key, "true", ex=24 * 3600)

    async def get_repo_profiles(
        self, username: str, db: AsyncSession = Depends(get_db), redis_client=None, background_tasks: BackgroundTasks = None
    ) -> RepoProfileResponse:
        """Fetches all repo profiles for a user. If not refreshed in 24 hours, fetches from API."""
        # 1. Fetch User ID and existing profiles in one query
        query = (
            select(User.id, Repo_Profile)
            .outerjoin(Repo_Profile, User.id == Repo_Profile.user_id)
            .where(User.username == username)
        )
        result = await db.execute(query)
        rows = result.all()

        if not rows:
            raise APIException(
                status=404, message="User not found", error_code="USER_NOT_FOUND"
            )

        user_id = rows[0].id
        # Filter out None values from the outer join if user has no profiles
        db_profiles = {
            row.Repo_Profile.platform: row.Repo_Profile
            for row in rows
            if row.Repo_Profile
        }

        fresh_key = f"repo_profiles:fresh:{username}"

        # 2. Check if data is "fresh" (within 24 hours)
        is_fresh = False
        if redis_client:
            is_fresh = await redis_client.get(fresh_key)

        # 3. If NOT fresh, enqueue background refresh
        if not is_fresh:
            logger.info(f"Queueing background refresh for repo profiles of user {username}")
            profiles_to_fetch = {p: db_profiles[p].handle for p in db_profiles}
            if background_tasks and profiles_to_fetch:
                background_tasks.add_task(
                    self.background_refresh_all,
                    user_id,
                    profiles_to_fetch,
                    redis_client,
                    username
                )
        # 4. Map to RepoProfileResponse
        response = RepoProfileResponse()
        for platform, profile in db_profiles.items():
            # The profile in DB has the same structure as the Pydantic models (JSONB)
            # We wrap them in their respective Pydantic models for validation
            if platform == "github":
                response.github = GithubProfile.model_validate(profile)
            elif platform == "hugging_face":
                response.hugging_face = HuggingFaceProfile.model_validate(profile)

        return response

    async def delete_repo_profile(
        self, user_id: str, platform: str, db: AsyncSession, redis_client=None
    ):
        query = select(Repo_Profile).where(
            Repo_Profile.user_id == user_id, Repo_Profile.platform == platform
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
            await redis_client.delete(f"{platform}:{user_id}")
        return "Profile deleted successfully"
