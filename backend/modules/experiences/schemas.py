from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime
from utils import parse_date


class ExperienceBase(BaseModel):
    organization: str
    start_date: date
    end_date: Optional[date] = None
    job_title: str
    description: str
    skills: Optional[list[str]] = None
    location: Optional[str] = None

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def format_date(cls, v):
        return parse_date(cls, v)

    @field_validator("description")
    @classmethod
    def validate_description_length(cls, v):
        if v is not None:
            words = v.split()
            if len(words) > 2000:
                raise ValueError("Description must not exceed 2000 words")
        return v


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
