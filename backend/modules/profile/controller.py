from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .schemas import CreateProfileRequest, UpdateProfileRequest
from .service import ProfileService
from utils import APIResponse, DependenciesService


profile_router = APIRouter(prefix="/profile", tags=["Profile"])


def get_profile_service():
    return ProfileService()


def get_dependencies_service():
    return DependenciesService()


# PRIVATE ROUTES


@profile_router.post("/create")
async def create_profile(
    request: Request,
    profile_request: CreateProfileRequest,
    db: AsyncSession = Depends(get_db),
    profile_service: ProfileService = Depends(get_profile_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await profile_service.create_profile(
        request.state.user.id, profile_request, db
    )
    return APIResponse(message=message, status=201)


@profile_router.patch("/update")
async def update_profile(
    request: Request,
    profile_request: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    profile_service: ProfileService = Depends(get_profile_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await profile_service.update_profile(
        request.state.user.id, profile_request, db
    )
    return APIResponse(message=message, status=200)


"""@profile_router.get("/current")
async def get_current_profile(
    request: Request,
    db: AsyncSession = Depends(get_db),
    profile_service: ProfileService = Depends(get_profile_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    profile = await profile_service.get_profile(request.state.user.username, db)
    return APIResponse(data=profile, status=200)


@profile_router.get("/{username}")
async def get_profile(
    username: str,
    db: AsyncSession = Depends(get_db),
    profile_service: ProfileService = Depends(get_profile_service),
) -> APIResponse:
    profile = await profile_service.get_profile(username, db)
    return APIResponse(data=profile, status=200)"""
