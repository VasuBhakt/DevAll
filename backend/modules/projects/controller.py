from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from .service import ProjectService
from .schemas import CreateProjectRequest, UpdateProjectRequest
from utils import APIResponse, DependenciesService, APIException

project_router = APIRouter(prefix="/projects", tags=["Projects"])


def get_project_service():
    return ProjectService()


def get_dependencies_service():
    return DependenciesService()


@project_router.get("/{user_id}")
async def get_user_projects(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    project_service: ProjectService = Depends(get_project_service),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
) -> APIResponse:
    projects = await project_service.get_projects(user_id, page, limit, db)
    return APIResponse(data=projects, status=200)


# PRIVATE ROUTES


@project_router.post("/create")
async def create_project(
    request: Request,
    project_request: CreateProjectRequest,
    db: AsyncSession = Depends(get_db),
    project_service: ProjectService = Depends(get_project_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await project_service.create_project(
        request.state.user.id, project_request, db
    )
    return APIResponse(message=message, status=201)


@project_router.patch("/update/{project_id}")
async def update_project(
    request: Request,
    project_id: str,
    project_request: UpdateProjectRequest,
    db: AsyncSession = Depends(get_db),
    project_service: ProjectService = Depends(get_project_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await project_service.update_project(
        request.state.user.id, project_id, project_request, db
    )
    return APIResponse(message=message, status=200)


@project_router.get("/")
async def get_current_user_projects(
    request: Request,
    db: AsyncSession = Depends(get_db),
    project_service: ProjectService = Depends(get_project_service),
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
    projects = await project_service.get_projects(
        request.state.user.id, page, limit, db
    )
    return APIResponse(data=projects, status=200)


@project_router.delete("/delete/{project_id}")
async def delete_project(
    request: Request,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    project_service: ProjectService = Depends(get_project_service),
    auth_check: str = Depends(get_dependencies_service().verifyJWT),
) -> APIResponse:
    if not request.state.user:
        raise APIException(
            message="Unauthorized",
            status=401,
            error_code="UNAUTHORIZED",
        )
    message = await project_service.delete_project(
        request.state.user.id, project_id, db
    )
    return APIResponse(message=message, status=200)
