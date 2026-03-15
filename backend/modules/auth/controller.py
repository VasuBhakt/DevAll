from fastapi import APIRouter, Depends, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .schemas import (
    SignupRequest,
    SigninRequest,
    ForgetPasswordRequest,
    ResetPasswordRequest,
)
from .service import AuthService
from .utils import AuthUtilService
from utils import APIResponse, DependenciesService, APIException


auth_router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service():
    return AuthService()


def get_auth_util_service():
    return AuthUtilService()


def get_dependencies_service():
    return DependenciesService()


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
) -> APIResponse:
    tokens = await auth_service.signin(request, db)
    util_service.set_auth_cookies(response, tokens)
    return APIResponse(message="Signin successful", status=200)


@auth_router.post("/refresh-token")
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    util_service: AuthUtilService = Depends(get_auth_util_service),
) -> APIResponse:
    tokens = await auth_service.refresh_access_token(request, db)
    util_service.set_auth_cookies(response, tokens)
    return APIResponse(message="Refresh token successful", status=200)


@auth_router.get("/verify-email/{token}")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse:
    message = await auth_service.verify_email(token, db)
    return APIResponse(message=message, status=200)


@auth_router.post("/forget-password")
async def forget_password(
    request: ForgetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse:
    message = await auth_service.forget_password(request, db)
    return APIResponse(message=message, status=200)


@auth_router.post("/reset-password/{token}")
async def reset_password(
    request: ResetPasswordRequest,
    token: str,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse:
    message = await auth_service.reset_password(token, request, db)
    return APIResponse(message=message, status=200)


# PRIVATE ROUTES


@auth_router.post("/signout")
async def signout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await auth_service.signout(request.state.user.id, db)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return APIResponse(message=message, status=200)


@auth_router.delete("/delete")
async def delete_account(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            "Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await auth_service.delete_account(request.state.user.id, db)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return APIResponse(message=message, status=200)
