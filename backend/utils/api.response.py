from typing import Optional, TypeVar, Generic
from pydantic import BaseModel

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool
    status: int
    message: str
    data: Optional[T] = None
