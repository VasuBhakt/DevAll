from fastapi import APIRouter, Depends, Request
from .service import CPProfileService
from database import get_db, get_redis
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis
from utils import DependenciesService, APIResponse
from utils.limiter import limiter

cp_profile_router = APIRouter(prefix="/cp-profile", tags=["CP Profile"])


def get_cp_profile_service():
    return CPProfileService()


def get_dependencies_service():
    return DependenciesService()


@cp_profile_router.get("/{username}")
async def get_cp_profiles(
    username: str,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    cp_profile_service: CPProfileService = Depends(get_cp_profile_service),
):
    response = await cp_profile_service.get_cp_profiles(
        username.lower(), db, redis_client
    )
    return APIResponse(
        message="CP profiles fetched successfully", status=200, data=response
    )


# PRIVATE ROUTE


@cp_profile_router.get("/fetch/{platform}/{handle}")
@limiter.limit("20/hour")
async def fetch_cp_profile(
    request: Request,
    platform: str,
    handle: str,
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    cp_profile_service: CPProfileService = Depends(get_cp_profile_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
):
    response = await cp_profile_service.fetch_cp_profile(
        request.state.user.id,
        handle,
        platform,
        db,
        redis_client,
    )
    return APIResponse(
        message="CP profile fetched successfully", status=200, data=response
    )
