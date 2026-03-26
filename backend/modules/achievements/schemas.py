from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime
from utils import parse_date


class AchievementBase(BaseModel):
    title: str
    description: Optional[str] = None
    certificate_link: Optional[str] = None
    organization: Optional[str] = None
    event: Optional[str] = None
    event_date: Optional[date] = None
    event_link: Optional[str] = None

    @field_validator("event_date", mode="before")
    @classmethod
    def format_date(cls, v):
        return parse_date(cls, v)


class CreateAchievementRequest(AchievementBase):
    pass


class UpdateAchievementRequest(CreateAchievementRequest):
    title: Optional[str] = None


class AchievementResponse(AchievementBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True


class PaginatedAchievementResponse(BaseModel):
    items: list[AchievementResponse]
    page: int
    limit: int
