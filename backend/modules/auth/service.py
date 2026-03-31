from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .schemas import (
    SignupRequest,
    SigninRequest,
    JWTTokens,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SigninResponse,
)
from database import User, Profile, get_db
from utils import APIException, EmailService, UserDetails
from .utils import AuthUtilService
import logging
import os
from datetime import datetime, timedelta
from fastapi import Request, Depends
import jwt
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class AuthService:

    # constructor
    def __init__(self):
        self.util_service = AuthUtilService()
        self.email_service = EmailService()

    # user signup
    async def signup(
        self, request: SignupRequest, db: AsyncSession = Depends(get_db)
    ) -> str:
        query = select(User).where(
            (User.email == request.email) | (User.username == request.username.lower())
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
            username=request.username.lower(),
            password=hashed_password,
            verification_token=verify_token.hashed_token,
        )

        verify_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/verify-email/{verify_token.raw_token}"

        message = f"""<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                <h2 style="color: #4F46E5; margin-bottom: 16px;">Welcome to DevAll!</h2>
                <p style="font-size: 16px; line-height: 1.5;">Thank you for joining us. To get started, please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{verify_url}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="font-size: 12px; color: #999;">If you didn't create an account, we recommend you ignore this email.</p>
            </div>"""
        # <p style="font-size: 14px; color: #666;">This link is valid for <strong>3 hours</strong>. For security reasons, unverified accounts will be automatically deleted after this period.</p>

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
            await db.flush()  # Get the new_user.id

            # Create the initial profile
            new_profile = Profile(
                user_id=new_user.id,
                name=request.full_name,
            )
            db.add(new_profile)

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

    # user signin
    async def signin(
        self, request: SigninRequest, db: AsyncSession = Depends(get_db)
    ) -> SigninResponse:
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

        user_response = UserDetails(
            id=user.id,
            username=user.username,
            role=user.role if isinstance(user.role, str) else user.role.value,
            email=user.email,
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

        return SigninResponse(tokens=tokens, user_details=user_response)

    # signout
    async def signout(
        self,
        user_id: str,
        db: AsyncSession = Depends(get_db),
    ) -> str:

        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                message="User not found", status=404, error_code="USER_NOT_FOUND"
            )
        user.refresh_token = None
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during signout: {e}")
            raise APIException(
                message="An error occurred while logging out",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Signout successful"

    # refresh access token
    async def refresh_access_token(
        self, request: Request, db: AsyncSession = Depends(get_db)
    ) -> JWTTokens:
        token = request.cookies.get("refresh_token")
        if not token:
            raise APIException(
                message="Refresh token not found",
                status=401,
                error_code="REFRESH_TOKEN_NOT_FOUND",
            )
        decoded_token = jwt.decode(
            token,
            os.getenv("JWT_REFRESH_SECRET", "hello"),
            algorithms=["HS256"],
        )
        user_id = decoded_token.get("id")
        if not user_id:
            raise APIException(
                "Unauthorized, id not present",
                status=401,
                error_code="UNAUTHORIZED",
            )
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                "Unauthorized, invalid user id",
                status=401,
                error_code="UNAUTHORIZED",
            )
        hashed_token = self.util_service.hash_token(token)
        if user.refresh_token != hashed_token:
            raise APIException(
                "Unauthorized, invalid refresh token",
                status=401,
                error_code="UNAUTHORIZED",
            )
        user_response = UserDetails(
            id=user.id,
            username=user.username,
            role=user.role if isinstance(user.role, str) else user.role.value,
            email=user.email,
        )
        tokens = self.util_service.generate_access_and_refresh_tokens(user_response)
        user.refresh_token = self.util_service.hash_token(tokens.refresh_token)
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during refresh access token: {e}")
            raise APIException(
                message="An error occurred while refreshing access token",
                status=500,
                error_code="SERVER_ERROR",
            )
        return tokens

    # verify email
    async def verify_email(self, token: str, db: AsyncSession = Depends(get_db)) -> str:
        hashed_verification_token = self.util_service.hash_token(token)
        query = select(User).where(User.verification_token == hashed_verification_token)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                "Invalid verification token",
                status=401,
                error_code="INVALID_VERIFICATION_TOKEN",
            )
        """if user.verify_token_expiry < datetime.utcnow():
            raise APIException(
                "Verification token expired",
                status=401,
                error_code="VERIFICATION_TOKEN_EXPIRED",
            )"""
        user.is_verified = True
        user.verification_token = None
        user.verify_token_expiry = None
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during verify email: {e}")
            raise APIException(
                message="An error occurred while verifying email",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Email verified successfully"

    # forgot password
    async def forgot_password(
        self, request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
    ) -> str:
        query = select(User).where(User.email == request.email)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                "User not found", status=404, error_code="USER_NOT_FOUND"
            )
        if not user.is_verified:
            raise APIException(
                "User not verified. Please verify your email first.",
                status=401,
                error_code="USER_NOT_VERIFIED",
            )
        forgot_password_token_expiry = datetime.utcnow() + timedelta(hours=1)
        forgot_password_token = self.util_service.generate_token()
        user.forgot_password_token = forgot_password_token.hashed_token
        user.forgot_password_token_expiry = forgot_password_token_expiry
        reset_password_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password/{forgot_password_token.raw_token}"
        message = f"""<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #4F46E5;">Reset your password</h2>
            <p>You have requested to reset your password. Click the button below to proceed:</p>
            <a href="{reset_password_url}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 0;">Reset Password</a>
            <p style="font-size: 0.9em; color: #666;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
        </div>"""
        email_sent = await self.email_service.send_email(
            to_email=request.email, subject="Reset Your Password", html_content=message
        )
        if not email_sent:
            raise APIException(
                message="Error sending reset password email",
                status=500,
                error_code="EMAIL_ERROR",
            )
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during forgot password: {e}")
            raise APIException(
                message="An error occurred while forgotting password",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Forgot password token generated and email sent successfully"

    async def reset_password(
        self,
        token: str,
        request: ResetPasswordRequest,
        db: AsyncSession = Depends(get_db),
    ) -> str:
        hashed_password_token = self.util_service.hash_token(token)
        query = select(User).where(User.forgot_password_token == hashed_password_token)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                "Invalid reset password token",
                status=401,
                error_code="INVALID_RESET_PASSWORD_TOKEN",
            )
        if user.forgot_password_token_expiry < datetime.utcnow():
            raise APIException(
                "Reset password token expired",
                status=401,
                error_code="RESET_PASSWORD_TOKEN_EXPIRED",
            )
        user.password = await self.util_service.hash_password(request.new_password)
        user.forgot_password_token = None
        user.forgot_password_token_expiry = None
        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during reset password: {e}")
            raise APIException(
                message="An error occurred while resetting password",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Reset password successful"

    async def delete_account(
        self, user_id: str, db: AsyncSession = Depends(get_db)
    ) -> str:
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalars().first()
        if not user:
            raise APIException(
                "User not found", status=404, error_code="USER_NOT_FOUND"
            )
        try:
            await db.delete(user)
            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.error(f"Database error during delete account: {e}")
            raise APIException(
                message="An error occurred while deleting account",
                status=500,
                error_code="SERVER_ERROR",
            )
        return "Account deleted successfully"
