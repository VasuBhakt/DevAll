from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .schemas import CreateExperienceRequest, UpdateExperienceRequest
from .service import ExperienceService
from utils import APIResponse, DependenciesService, APIException

experience_router = APIRouter(prefix="/experiences", tags=["Experiences"])


def get_experience_service():
    return ExperienceService()


def get_dependencies_service():
    return DependenciesService()


@experience_router.get("/{user_id}")
async def get_user_experiences(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    experience_service: ExperienceService = Depends(get_experience_service),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
) -> APIResponse:
    experiences = await experience_service.get_experiences(user_id, page, limit, db)
    return APIResponse(data=experiences, status=200)


# PRIVATE ROUTES


@experience_router.post("/create")
async def create_experience(
    request: Request,
    experience_request: CreateExperienceRequest,
    db: AsyncSession = Depends(get_db),
    experience_service: ExperienceService = Depends(get_experience_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await experience_service.create_experience(
        request.state.user.id, experience_request, db
    )
    return APIResponse(message=message, status=201)


@experience_router.patch("/update/{experience_id}")
async def update_experience(
    request: Request,
    experience_id: str,
    experience_request: UpdateExperienceRequest,
    db: AsyncSession = Depends(get_db),
    experience_service: ExperienceService = Depends(get_experience_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await experience_service.update_experience(
        request.state.user.id, experience_id, experience_request, db
    )
    return APIResponse(message=message, status=200)


@experience_router.get("/")
async def get_current_user_experiences(
    request: Request,
    db: AsyncSession = Depends(get_db),
    experience_service: ExperienceService = Depends(get_experience_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    experiences = await experience_service.get_experiences(
        request.state.user.id, page, limit, db
    )
    return APIResponse(data=experiences, status=200)


@experience_router.delete("/delete/{experience_id}")
async def delete_experience(
    request: Request,
    experience_id: str,
    db: AsyncSession = Depends(get_db),
    experience_service: ExperienceService = Depends(get_experience_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await experience_service.delete_experience(
        request.state.user.id, experience_id, db
    )
    return APIResponse(message=message, status=200)
