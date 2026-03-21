from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime


class PublicProfileData(BaseModel):
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


class PublicProject(BaseModel):
    name: str
    description: str
    tech_stack: Optional[list[str]] = None
    domains: Optional[list[str]] = None
    languages: Optional[list[str]] = None
    github_link: Optional[str] = None
    project_link: Optional[str] = None
    project_date: Optional[date] = None


class PublicCPProfile(BaseModel):
    platform: str
    handle: str
    rating: Optional[int]
    max_rating: Optional[int]
    hard_problems: Optional[int]
    medium_problems: Optional[int]
    easy_problems: Optional[int]
    problems_solved: Optional[int]
    rank: Optional[str]
    max_rank: Optional[str]


class PublicRepoProfile(BaseModel):
    platform: str
    profile_link: str
    followers_count: Optional[int]
    public_repo_count: Optional[int]
    likes_count: Optional[int]


class PublicAchievement(BaseModel):
    title: str
    description: Optional[str] = None
    organization: Optional[str] = None
    event: Optional[str] = None
    event_date: Optional[date] = None


class PublicExperience(BaseModel):
    organization: str
    start_date: date
    end_date: Optional[date] = None
    job_title: str
    description: str
    skills: Optional[list[str]] = None
    location: Optional[str] = None


class PublicProfileResponse(BaseModel):
    username: str
    email: str
    profile: Optional[PublicProfileData] = None
    projects: List[PublicProject] = []
    achievements: List[PublicAchievement] = []
    experience: List[PublicExperience] = []
    cp_profiles: List[PublicCPProfile] = []
    repo_profiles: List[PublicRepoProfile] = []
