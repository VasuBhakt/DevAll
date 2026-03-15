from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends
from .schemas import SignupRequest, SigninRequest, UserResponse, JWTTokens
from database import User, get_db
from utils import APIException, EmailService
from .utils import AuthUtilService
import logging
import os
from datetime import datetime, timedelta

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class AuthService:

    def __init__(self):
        self.util_service = AuthUtilService()
        self.email_service = EmailService()

    async def signup(
        self, request: SignupRequest, db: AsyncSession = Depends(get_db)
    ) -> str:
        query = select(User).where(
            (User.email == request.email) | (User.username == request.username)
        )
        result = await db.execute(query)
        existing_user = result.scalars().first()

        if existing_user:
            if existing_user.email == request.email:
                raise APIException(
                    message="Email already registered",
                    status=400,
                    error_code="EMAIL_EXISTS",
                )
            else:
                raise APIException(
                    message="Username already taken",
                    status=400,
                    error_code="USERNAME_EXISTS",
                )

        hashed_password = await self.util_service.hash_password(request.password)
        verify_token = self.util_service.generate_token()
        expiry_time = datetime.utcnow() + timedelta(hours=3)

        new_user = User(
            email=request.email,
            username=request.username,
            password=hashed_password,
            verification_token=verify_token.hashed_token,
            verify_token_expiry=expiry_time,
        )

        verify_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/verify-email/{verify_token.raw_token}"

        message = f"""<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                <h2 style="color: #4F46E5; margin-bottom: 16px;">Welcome to Streamify!</h2>
                <p style="font-size: 16px; line-height: 1.5;">Thank you for joining our community. To get started, please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{verify_url}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
                </div>
                <p style="font-size: 14px; color: #666;">This link is valid for <strong>3 hours</strong>. For security reasons, unverified accounts will be automatically deleted after this period.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="font-size: 12px; color: #999;">If you didn't create an account, we recommend you ignore this email.</p>
            </div>"""

        email_sent = await self.email_service.send_email(
            to_email=request.email, subject="Verify your email", html_content=message
        )

        if not email_sent:
            raise APIException(
                message="Error sending verification email",
                status=500,
                error_code="EMAIL_ERROR",
            )

        try:
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during signup: {e}")
            raise APIException(
                message="An error occurred while creating your account",
                status=500,
                error_code="SERVER_ERROR",
            )

        return (
            "User created successfully. Please check your email for verification link."
        )

    async def signin(
        self, request: SigninRequest, db: AsyncSession = Depends(get_db)
    ) -> JWTTokens:
        query = select(User).where(
            (User.email == request.identifier) | (User.username == request.identifier)
        )
        result = await db.execute(query)
        user = result.scalars().first()

        if not user:
            raise APIException(
                message="User not found", status=404, error_code="USER_NOT_FOUND"
            )

        is_password_correct = await self.util_service.verify_password(
            request.password, user.password
        )
        if not is_password_correct:
            raise APIException(
                message="Invalid password", status=401, error_code="INVALID_PASSWORD"
            )

        if not user.is_verified:
            raise APIException(
                message="User not verified. Please verify your email first.",
                status=401,
                error_code="USER_NOT_VERIFIED",
            )

        user_response = UserResponse(
            id=user.id,
            username=user.username,
            role=user.role if isinstance(user.role, str) else user.role.value,
        )

        tokens = self.util_service.generate_access_and_refresh_tokens(user_response)
        user.refresh_token = self.util_service.hash_token(tokens.refresh_token)

        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during signin: {e}")
            raise APIException(
                message="An error occurred while logging in",
                status=500,
                error_code="SERVER_ERROR",
            )

        return tokens
