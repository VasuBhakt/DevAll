from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .schemas import CreateAchievementRequest, UpdateAchievementRequest
from .service import AchievementService
from utils import APIResponse, DependenciesService, APIException


achievement_router = APIRouter(prefix="/achievements", tags=["Achievements"])


def get_achievement_service():
    return AchievementService()


def get_dependencies_service():
    return DependenciesService()


@achievement_router.get("/{username}")
async def get_achievements(
    username: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    achievement_service: AchievementService = Depends(get_achievement_service),
) -> APIResponse:
    achievements = await achievement_service.get_achievements(username, page, limit, db)
    return APIResponse(data=achievements, status=200)


# PRIVATE ROUTES


@achievement_router.post("/create")
async def create_achievement(
    request: Request,
    achievement_request: CreateAchievementRequest,
    db: AsyncSession = Depends(get_db),
    achievement_service: AchievementService = Depends(get_achievement_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await achievement_service.create_achievement(
        request.state.user.id, achievement_request, db
    )
    return APIResponse(message=message, status=201)


@achievement_router.patch("/update/{achievement_id}")
async def update_achievement(
    request: Request,
    achievement_id: str,
    achievement_request: UpdateAchievementRequest,
    db: AsyncSession = Depends(get_db),
    achievement_service: AchievementService = Depends(get_achievement_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await achievement_service.update_achievement(
        request.state.user.id, achievement_id, achievement_request, db
    )
    return APIResponse(message=message, status=200)


@achievement_router.get("/")
async def get_current_user_achievements(
    request: Request,
    db: AsyncSession = Depends(get_db),
    achievement_service: AchievementService = Depends(get_achievement_service),
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
    achievements = await achievement_service.get_achievements(
        request.state.user.username, page, limit, db
    )
    return APIResponse(data=achievements, status=200)


@achievement_router.delete("/delete/{achievement_id}")
async def delete_achievement(
    request: Request,
    achievement_id: str,
    db: AsyncSession = Depends(get_db),
    achievement_service: AchievementService = Depends(get_achievement_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await achievement_service.delete_achievement(
        request.state.user.id, achievement_id, db
    )
    return APIResponse(message=message, status=200)
