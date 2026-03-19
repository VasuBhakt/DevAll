from fastapi import APIRouter, Depends, Request
from .service import RepoProfileService
from database import get_db, get_redis
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from utils import DependenciesService, APIResponse
from utils.limiter import limiter

repo_profile_router = APIRouter(prefix="/repo-profile", tags=["Repo Profile"])


def get_repo_profile_service():
    return RepoProfileService()


def get_dependencies_service():
    return DependenciesService()


@repo_profile_router.get("/{username}")
async def get_repo_profiles(
    username: str,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    repo_profile_service: RepoProfileService = Depends(get_repo_profile_service),
):
    response = await repo_profile_service.get_repo_profiles(username, db, redis_client)
    return APIResponse(
        message="Repo profiles fetched successfully", status=200, data=response
    )


# PRIVATE ROUTE


@repo_profile_router.get("/fetch/{platform}/{handle}")
@limiter.limit("20/hour")
async def fetch_repo_profile(
    request: Request,
    platform: str,
    handle: str,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    repo_profile_service: RepoProfileService = Depends(get_repo_profile_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
):
    response = await repo_profile_service.fetch_repo_profile(
        request.state.user.id,
        handle,
        platform,
        db,
        redis_client,
    )
    return APIResponse(
        message="Repo profile fetched successfully", status=200, data=response
    )
