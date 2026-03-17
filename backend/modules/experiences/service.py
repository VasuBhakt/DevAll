from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends, Request
from database import Experience, get_db
from utils import APIException
from .schemas import (
    CreateExperienceRequest,
    UpdateExperienceRequest,
    PaginatedExperienceResponse,
)
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ExperienceService:

    # Create Experience
    async def create_experience(
        self,
        user_id: str,
        experience_request: CreateExperienceRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        new_experience = Experience(user_id=user_id, **experience_request.model_dump())
        try:
            db.add(new_experience)
            await db.commit()
            await db.refresh(new_experience)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during experience creation: {e}")
            raise APIException(
                message="An error occurred while creating experience",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Experience created successfully"

    # Update Experience
    async def update_experience(
        self,
        user_id: str,
        experience_id: str,
        experience_request: UpdateExperienceRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Experience).where(Experience.id == experience_id)
        result = await db.execute(query)
        existing_experience = result.scalars().first()

        if not existing_experience:
            raise APIException(
                message="Experience not found",
                status=404,
                error_code="EXPERIENCE_NOT_FOUND",
            )

        for field, value in experience_request.model_dump().items():
            if value is not None:
                setattr(existing_experience, field, value)

        try:
            # await db.add(experience)
            await db.commit()
            await db.refresh(existing_experience)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during experience update: {e}")
            raise APIException(
                message="An error occurred while updating experience",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Experience updated successfully"

    # Get Experiences (Offset Pagination)
    async def get_experiences(
        self,
        user_id: str,
        page: int = 1,
        limit: int = 10,
        db: AsyncSession = Depends(get_db),
    ) -> PaginatedExperienceResponse:
        try:
            # Calculate offset
            offset = (page - 1) * limit
            # Get items
            query = (
                select(Experience)
                .where(Experience.user_id == user_id)
                .order_by(Experience.created_at.desc())
                .offset(offset)
                .limit(limit)
            )
            result = await db.execute(query)
            experiences = result.scalars().all()

            return PaginatedExperienceResponse(
                items=experiences,
                page=page,
                limit=limit,
            )
        except Exception as e:
            logger.error(f"Database error during experience fetch: {e}")
            raise APIException(
                message="An error occurred while fetching experiences",
                status=500,
                error_code="SERVER_ERROR",
            )

    # Delete Experience
    async def delete_experience(
        self, user_id: str, experience_id: str, db: AsyncSession = Depends(get_db)
    ) -> str:
        query = select(Experience).where(Experience.id == experience_id)
        result = await db.execute(query)
        experience = result.scalars().first()

        if not experience:
            raise APIException(
                message="Experience not found",
                status=404,
                error_code="EXPERIENCE_NOT_FOUND",
            )

        try:
            await db.delete(experience)
            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during experience deletion: {e}")
            raise APIException(
                message="An error occurred while deleting experience",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Experience deleted successfully"
