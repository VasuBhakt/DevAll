from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .schemas import SignupRequest, SigninRequest, UserResponse
from .service import AuthService
from .utils import AuthUtilService
from utils import APIResponse

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service():
    return AuthService()


def get_auth_util_service():
    return AuthUtilService()


@auth_router.post("/signup")
async def register(
    request: SignupRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse:
    message = await auth_service.signup(request, db)
    return APIResponse(message=message, status=201)


@auth_router.post("/signin")
async def login(
    request: SigninRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    util_service: AuthUtilService = Depends(get_auth_util_service),
):
    tokens = await auth_service.signin(request, db)
    util_service.set_auth_cookies(response, tokens)
    return APIResponse(message="Signin successful", status=200)
