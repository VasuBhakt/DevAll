from pydantic import BaseModel
from typing import Optional
from datetime import date


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

    class Config:
        from_attributes = True


class PaginatedProjectResponse(BaseModel):
    items: list[ProjectResponse]
    page: int
    limit: int
