import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@dev-all/database';
import { Tokens, MailService } from '@dev-all/helpers';
import { SignInDTO, SignUpDTO } from './entities';
import { UtilsService } from './utils/utils';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private utilService: UtilsService
    ) { }

    async signup(dto: SignUpDTO): Promise<string> {
        // Check if email is provided
        if (!dto.email) {
            throw new HttpException(
                "Email is required",
                HttpStatus.BAD_REQUEST
            )
        }
        // Check if username is provided
        if (!dto.username) {
            throw new HttpException(
                "Username is required",
                HttpStatus.BAD_REQUEST
            )
        }
        // Check if password is provided
        if (!dto.password) {
            throw new HttpException(
                "Password is required",
                HttpStatus.BAD_REQUEST
            )
        }
        // Check if email or username already exists
        const userEmailOrUsernameExists = await this.prisma.client.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { username: dto.username }
                ]
            }
        })
        if (userEmailOrUsernameExists) {
            const existsEmail = userEmailOrUsernameExists.email === dto.email;
            const existsUsername = userEmailOrUsernameExists.username === dto.username;
            if (existsEmail) {
                throw new HttpException(
                    "Email already exists",
                    HttpStatus.BAD_REQUEST
                )
            }
            if (existsUsername) {
                throw new HttpException(
                    "Username already exists",
                    HttpStatus.BAD_REQUEST
                )
            }
        }
        // hash password
        const hashedPassword = await this.utilService.hashPassword(dto.password);
        // generate verification token
        const ttl = 3 * 60 * 60 * 1000
        const verificationToken = await this.utilService.generateToken(ttl);
        // create user in db with verification details
        const newUser = await this.prisma.client.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hashedPassword,
                verification_token: verificationToken.hashedToken,
                verify_token_expiry: verificationToken.expiresAt,
            },
        });
        // generate verification url
        const verifyUrl = `${process.env['CORS_ORIGIN']}/verify-email/${verificationToken.token}`;
        // generate email message
        const message = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
        <h2 style="color: #4F46E5; margin-bottom: 16px;">Welcome to DevAll!</h2>
        <p style="font-size: 16px; line-height: 1.5;">Thank you for joining our community. To get started, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #666;">This link is valid for <strong>3 hours</strong>. For security reasons, unverified accounts will be automatically deleted after this period.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">If you didn't create an account, we recommend you to not click the link and ignore this email.</p>
        </div>`
        // send verification email
        try {
            await this.mailService.sendEmail({
                email: newUser.email,
                subject: 'Verify your DevAll account',
                message
            })
        } catch (error) {
            throw new HttpException(
                `Email could not be sent :: ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
        // return
        return "User created successfully!";
    }

    async signin(dto: SignInDTO): Promise<Tokens> {
        // check if user exists
        const user = await this.prisma.client.user.findFirst({
            where: {
                OR: [
                    { email: dto.identifier },
                    { username: dto.identifier }
                ]
            }
        })
        // If user is not found, throw error
        if (!user) {
            throw new HttpException(
                "User Not Found",
                HttpStatus.BAD_REQUEST
            )
        }
        // check if password is correct
        const isPasswordCorrect = await this.utilService.isPasswordCorrect(dto.password, user.password);
        if (!isPasswordCorrect) {
            throw new HttpException(
                "Invalid Password",
                HttpStatus.BAD_REQUEST
            )
        }
        // check if user is verified
        if (!user.is_verified) {
            throw new HttpException(
                "User Not Verified",
                HttpStatus.BAD_REQUEST
            )
        }
        // generate tokens
        const tokens = await this.utilService.generateAccessAndRefreshTokens(user.id, user.username, user.role);

        // hash refresh token for storage
        const hashedRefreshToken = await this.utilService.hashPassword(tokens.refresh_token);
        // update refresh token in db
        await this.prisma.client.user.update({
            where: {
                id: user.id,
            },
            data: {
                refresh_token: hashedRefreshToken,
            },
        })
        // return tokens
        return tokens;
    }

    async signout(userId: string): Promise<string> {
        await this.prisma.client.user.update({
            where: {
                id: userId,
                refresh_token: {
                    not: null,
                }
            },
            data: {
                refresh_token: null
            }
        })
        return "User signed out successfully!";
    }

    async refreshTokens(refreshToken: string): Promise<Tokens> {
        const hashedRefreshToken = await this.utilService.hashToken(refreshToken)
        const user = await this.prisma.client.user.findFirst({
            where: {
                refresh_token: hashedRefreshToken
            }
        })
        if (!user) {
            throw new HttpException(
                "Invalid Refresh Token",
                HttpStatus.BAD_REQUEST
            )
        }
        const tokens = await this.utilService.generateAccessAndRefreshTokens(user.id, user.username, user.role);
        const newHashedRefreshToken = await this.utilService.hashToken(tokens.refresh_token);
        await this.prisma.client.user.update({
            where: {
                id: user.id
            },
            data: {
                refresh_token: newHashedRefreshToken
            }
        })
        return tokens;
    }

    async verifyEmail(verificationToken: string): Promise<boolean> {
        const hashedToken = await this.utilService.hashToken(verificationToken);
        const user = await this.prisma.client.user.findFirst({
            where: {
                verification_token: hashedToken
            }
        })
        if (!user) {
            throw new HttpException(
                "Invalid verification token",
                HttpStatus.BAD_REQUEST
            )
        }
        if (user.verify_token_expiry && user.verify_token_expiry < new Date()) {
            throw new HttpException(
                "Verification token has expired",
                HttpStatus.BAD_REQUEST
            )
        }
        await this.prisma.client.user.update({
            where: {
                id: user.id
            },
            data: {
                is_verified: true,
                verification_token: null,
                verify_token_expiry: null
            }
        })
        return true;
    }

    async forgotPassword(email: string): Promise<string> {
        const user = await this.prisma.client.user.findFirst({
            where: {
                email: email
            }
        })
        if (!user) {
            throw new HttpException(
                "Invalid email address",
                HttpStatus.BAD_REQUEST
            )
        }
        const ttl = 30 * 60 * 1000;
        const forgotPasswordToken = await this.utilService.generateToken(ttl);
        await this.prisma.client.user.update({
            where: {
                id: user.id,
            },
            data: {
                forgot_password_token: forgotPasswordToken.hashedToken,
                forgot_password_token_expiry: forgotPasswordToken.expiresAt,
            },
        })
        const generateForgotPasswordUrl = `${process.env['CORS_ORIGIN']}/forgot-password/${forgotPasswordToken.token}`;
        const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #4F46E5;">Reset your password</h2>
            <p>You have requested to reset your password. Click the button below to proceed:</p>
            <a href="${generateForgotPasswordUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 0;">Reset Password</a>
            <p style="font-size: 0.9em; color: #666;">This link is valid for 30 minutes. If you did not request this, please ignore this email.</p>
        </div>
        `;
        try {
            await this.mailService.sendEmail({
                email: user.email,
                subject: 'Reset your password',
                message
            })
        } catch (error) {
            throw new HttpException(
                `Email could not be sent :: ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
        return "Email sent successfully!";
    }

    async resetPassword(password: string, resetToken: string): Promise<boolean> {
        const hashedResetToken = await this.utilService.hashToken(resetToken);
        const user = await this.prisma.client.user.findFirst({
            where: {
                forgot_password_token: hashedResetToken
            }
        })
        if (!user) {
            throw new HttpException(
                "Invalid reset password token",
                HttpStatus.BAD_REQUEST
            )
        }
        if (user.forgot_password_token_expiry && user.forgot_password_token_expiry < new Date()) {
            throw new HttpException(
                "Reset password token has expired",
                HttpStatus.BAD_REQUEST
            )
        }
        const hashedPassword = await this.utilService.hashPassword(password);
        await this.prisma.client.user.update({
            where: {
                id: user.id
            },
            data: {
                forgot_password_token: null,
                password: hashedPassword
            }
        })
        return true;
    }

    async deleteAccount(userId: string): Promise<boolean> {
        await this.prisma.client.user.delete({
            where: {
                id: userId
            }
        })
        return true;
    }
}