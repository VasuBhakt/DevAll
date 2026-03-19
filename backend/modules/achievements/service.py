from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends, Request
from database import Achievement, get_db
from utils import APIException, get_user_from_username
from .schemas import (
    CreateAchievementRequest,
    UpdateAchievementRequest,
    PaginatedAchievementResponse,
)
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class AchievementService:

    # Create Achievement
    async def create_achievement(
        self,
        user_id: str,
        achievement_request: CreateAchievementRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        new_achievement = Achievement(
            user_id=user_id, **achievement_request.model_dump()
        )
        try:
            db.add(new_achievement)
            await db.commit()
            await db.refresh(new_achievement)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during achievement creation: {e}")
            raise APIException(
                message="An error occurred while creating achievement",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Achievement created successfully"

    # Update Achievement
    async def update_achievement(
        self,
        user_id: str,
        achievement_id: str,
        achievement_request: UpdateAchievementRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Achievement).where(Achievement.id == achievement_id)
        result = await db.execute(query)
        existing_achievement = result.scalars().first()

        if not existing_achievement:
            raise APIException(
                message="Achievement not found",
                status=404,
                error_code="ACHIEVEMENT_NOT_FOUND",
            )

        for field, value in achievement_request.model_dump().items():
            if value is not None:
                setattr(existing_achievement, field, value)

        try:
            # await db.add(achievement)
            await db.commit()
            await db.refresh(existing_achievement)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during achievement update: {e}")
            raise APIException(
                message="An error occurred while updating achievement",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Achievement updated successfully"

    # Get Achievements (Offset Pagination)
    async def get_achievements(
        self,
        username: str,
        page: int = 1,
        limit: int = 10,
        db: AsyncSession = Depends(get_db),
    ) -> PaginatedAchievementResponse:
        try:
            user_id = await get_user_from_username(username, db)
            # Calculate offset
            offset = (page - 1) * limit
            # Get items
            query = (
                select(Achievement)
                .where(Achievement.user_id == user_id)
                .order_by(Achievement.created_at.desc())
                .offset(offset)
                .limit(limit)
            )
            result = await db.execute(query)
            achievements = result.scalars().all()

            return PaginatedAchievementResponse(
                items=achievements,
                page=page,
                limit=limit,
            )
        except Exception as e:
            logger.error(f"Database error during achievement fetch: {e}")
            raise APIException(
                message="An error occurred while fetching achievements",
                status=500,
                error_code="SERVER_ERROR",
            )

    # Delete Achievement
    async def delete_achievement(
        self, user_id: str, achievement_id: str, db: AsyncSession = Depends(get_db)
    ) -> str:
        query = select(Achievement).where(Achievement.id == achievement_id)
        result = await db.execute(query)
        achievement = result.scalars().first()

        if not achievement:
            raise APIException(
                message="Achievement not found",
                status=404,
                error_code="ACHIEVEMENT_NOT_FOUND",
            )

        try:
            await db.delete(achievement)
            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during achievement deletion: {e}")
            raise APIException(
                message="An error occurred while deleting achievement",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Achievement deleted successfully"
