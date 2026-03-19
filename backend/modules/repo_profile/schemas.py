from pydantic import BaseModel
from typing import Optional
from .fetchers import GithubProfile, HuggingFaceProfile


class RepoProfileResponse(BaseModel):
    github: Optional[GithubProfile] = None
    hugging_face: Optional[HuggingFaceProfile] = None
