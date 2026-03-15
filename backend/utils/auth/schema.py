from pydantic import BaseModel


class UserDetails(BaseModel):
    username: str
    id: str
    role: str
