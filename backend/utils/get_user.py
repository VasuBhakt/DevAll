from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import User, get_db
from .api_exception import APIException
from fastapi import Depends


async def get_user_from_username(username: str, db: AsyncSession = Depends(get_db)):
    user_query = select(User).where(User.username == username)
    result = await db.execute(user_query)
    user = result.scalars().first()
    if not user:
        raise APIException(
            message="User not found",
            status=404,
            error_code="USER_NOT_FOUND",
        )
    return user.id
