from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ExperienceBase(BaseModel):
    organization: str
    start_date: date
    end_date: Optional[date] = None
    job_title: str
    description: str
    skills: Optional[list[str]] = None
    location: Optional[str] = None


class CreateExperienceRequest(ExperienceBase):
    pass


class UpdateExperienceRequest(CreateExperienceRequest):
    organization: Optional[str] = None
    start_date: Optional[date] = None
    job_title: Optional[str] = None
    description: Optional[str] = None


class ExperienceResponse(ExperienceBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class PaginatedExperienceResponse(BaseModel):
    items: list[ExperienceResponse]
    page: int
    limit: int
