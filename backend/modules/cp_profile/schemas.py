from pydantic import BaseModel


class FetchCPProfileSchema(BaseModel):
    handle: str
    platform: str
