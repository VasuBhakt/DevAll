from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends, Request
from database import Project, get_db
from utils import APIException, get_user_from_username
from .schemas import (
    CreateProjectRequest,
    UpdateProjectRequest,
    PaginatedProjectResponse,
)
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ProjectService:
    # Create Project
    async def create_project(
        self,
        user_id: str,
        project_request: CreateProjectRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        new_project = Project(user_id=user_id, **project_request.model_dump())
        try:
            db.add(new_project)
            await db.commit()
            await db.refresh(new_project)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during project creation: {e}")
            raise APIException(
                message="An error occurred while creating project",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Project created successfully"

    # Update Project
    async def update_project(
        self,
        user_id: str,
        project_id: str,
        project_request: UpdateProjectRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        query = select(Project).where(Project.id == project_id)
        result = await db.execute(query)
        existing_project = result.scalars().first()

        if not existing_project:
            raise APIException(
                message="Project not found",
                status=404,
                error_code="PROJECT_NOT_FOUND",
            )

        for field, value in project_request.model_dump().items():
            if value is not None:
                setattr(existing_project, field, value)

        try:
            await db.commit()
            await db.refresh(existing_project)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during project update: {e}")
            raise APIException(
                message="An error occurred while updating project",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Project updated successfully"

    # Get Project
    async def get_projects(
        self,
        username: str,
        page: int = 1,
        limit: int = 10,
        db: AsyncSession = Depends(get_db),
    ) -> PaginatedProjectResponse:
        try:
            user_id = await get_user_from_username(username, db)
            offset = (page - 1) * limit

            query = (
                select(Project)
                .where(Project.user_id == user_id)
                .order_by(Project.created_at.desc())
                .offset(offset)
                .limit(limit)
            )

            result = await db.execute(query)
            projects = result.scalars().all()

            return PaginatedProjectResponse(
                items=projects,
                page=page,
                limit=limit,
            )
        except Exception as e:
            logger.error(f"Database error during project fetch: {e}")
            raise APIException(
                message="An error occurred while fetching projects",
                status=500,
                error_code="SERVER_ERROR",
            )

        # Delete Project
        async def delete_project(
            self,
            user_id: str,
            project_id: str,
            db: AsyncSession = Depends(get_db),
        ) -> str:
            query = select(Project).where(Project.id == project_id)
            result = await db.execute(query)
            existing_project = result.scalars().first()

            if not existing_project:
                raise APIException(
                    message="Project not found",
                    status=404,
                    error_code="PROJECT_NOT_FOUND",
                )

            try:
                await db.delete(existing_project)
                await db.commit()
            except Exception as e:
                await db.rollback()
                logger.error(f"Database error during project deletion: {e}")
                raise APIException(
                    message="An error occurred while deleting project",
                    status=500,
                    error_code="SERVER_ERROR",
                )
            return "Project deleted successfully"
