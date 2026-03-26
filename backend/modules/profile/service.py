from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends, Request
from database import Profile, User, get_db
from utils import APIException
from .schemas import CreateProfileRequest, UpdateProfileRequest, ProfileResponse
import logging
from sqlalchemy.orm import joinedload


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ProfileService:

    # Create Profile
    async def create_profile(
        self,
        user_id: str,
        profile_request: CreateProfileRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Profile).where(Profile.user_id == user_id)
        result = await db.execute(query)
        existing_profile = result.scalars().first()

        if existing_profile:
            raise APIException(
                message="Profile already exists",
                status=400,
                error_code="PROFILE_EXISTS",
            )

        new_profile = Profile(user_id=user_id, **profile_request.model_dump())

        try:
            db.add(new_profile)
            await db.commit()
            await db.refresh(new_profile)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during profile creation: {e}")
            raise APIException(
                message="An error occurred while creating profile",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Profile created successfully"

    # Update profile
    async def update_profile(
        self,
        user_id: str,
        profile_request: UpdateProfileRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Profile).where(Profile.user_id == user_id)
        result = await db.execute(query)
        existing_profile = result.scalars().first()

        if not existing_profile:
            raise APIException(
                message="Profile not found",
                status=404,
                error_code="PROFILE_NOT_FOUND",
            )

        for field, value in profile_request.model_dump().items():
            if value is not None:
                setattr(existing_profile, field, value)

        try:
            # await db.add(existing_profile)
            await db.commit()
            await db.refresh(existing_profile)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during profile update: {e}")
            raise APIException(
                message="An error occurred while updating profile",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Profile updated successfully"

    # get profile
    async def get_profile(
        self,
        username: str,
        db: AsyncSession = Depends(get_db),
    ) -> ProfileResponse:
        user_query = (
            select(User)
            .options(joinedload(User.profile))
            .where(User.username == username)
        )
        result = await db.execute(user_query)
        user = result.scalars().first()

        if not user:
            raise APIException(
                message="User not found",
                status=404,
                error_code="USER_NOT_FOUND",
            )

        if not user.profile:
            raise APIException(
                message="Profile details not found",
                status=404,
                error_code="PROFILE_NOT_FOUND",
            )

        profile_dict = {
            c.name: getattr(user.profile, c.name)
            for c in user.profile.__table__.columns
        }
        profile_dict.update({"email": user.email, "username": user.username})

        return ProfileResponse.model_validate(profile_dict)
