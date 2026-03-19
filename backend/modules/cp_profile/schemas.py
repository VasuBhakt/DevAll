from pydantic import BaseModel
from typing import Optional
from .fetchers import (
    CodeChefProfile,
    CodeforcesProfile,
    LeetCodeProfile,
    AtCoderProfile,
)


class CPProfileResponse(BaseModel):
    codeforces: Optional[CodeforcesProfile] = None
    codechef: Optional[CodeChefProfile] = None
    leetcode: Optional[LeetCodeProfile] = None
    atcoder: Optional[AtCoderProfile] = None
