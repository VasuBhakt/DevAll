from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date
from utils import parse_date


class ProjectBase(BaseModel):
    name: str
    description: str
    tech_stack: Optional[list[str]] = None
    domains: Optional[list[str]] = None
    languages: Optional[list[str]] = None
    github_link: Optional[str] = None
    project_link: Optional[str] = None
    project_date: Optional[date] = None

    @field_validator("project_date", mode="before")
    @classmethod
    def format_date(cls, v):
        return parse_date(cls, v)


class CreateProjectRequest(ProjectBase):
    pass


class UpdateProjectRequest(CreateProjectRequest):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class PaginatedProjectResponse(BaseModel):
    items: list[ProjectResponse]
    page: int
    limit: int
