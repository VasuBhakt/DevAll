from pydantic import BaseModel
from typing import Optional


class CreateProfileRequest(BaseModel):
    name: str
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    institute: Optional[str] = None
    organization: Optional[str] = None
    readme: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    portfolio_website: Optional[str] = None

    # Socials
    linkedin: Optional[str] = None
    github: Optional[str] = None
    xtwitter: Optional[str] = None
    instagram: Optional[str] = None
    reddit: Optional[str] = None
    twitch: Optional[str] = None
    youtube: Optional[str] = None
    discord: Optional[str] = None


class UpdateProfileRequest(CreateProfileRequest):
    name: Optional[str] = None
