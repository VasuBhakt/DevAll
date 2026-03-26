from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .service import PublicService
from utils import APIResponse

public_router = APIRouter(prefix="/public", tags=["Public"])


def get_public_service():
    return PublicService()


@public_router.get("/{username}")
async def get_public_profile(
    username: str,
    public_service: PublicService = Depends(get_public_service),
    db: AsyncSession = Depends(get_db),
) -> APIResponse:
    response = await public_service.get_public_profile(username.lower(), db)
    return APIResponse(data=response, status=200)
