import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { Public, GetCurrentUser, GetCurrentUserId, APIResponse } from '@dev-all/helpers';
import { RtGuard } from './guards/index.js';
import { SignUpDTO } from './entities/signup.dto.js';
import { SignInDTO } from './entities/signin.dto.js';
import { UtilsService } from './utils/utils.js';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private utilsService: UtilsService
    ) { }

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(
        @Body() dto: SignUpDTO,
        @Res({ passthrough: true }) res: Response
    ): Promise<APIResponse> {
        const response = await this.authService.signup(dto);
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }

    @Public()
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signin(
        @Body() dto: SignInDTO,
        @Res({ passthrough: true }) res: Response
    ): Promise<APIResponse> {
        const tokens = await this.authService.signin(dto);
        await this.utilsService.setCookies(res, tokens);
        return new APIResponse(
            HttpStatus.OK,
            "Signed in successfully",
            {}
        );
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async signout(
        @GetCurrentUserId() userId: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<APIResponse> {
        const response = await this.authService.signout(userId)
        res.clearCookie('access_token')
        res.clearCookie('refresh_token')
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }

    @Public()
    @UseGuards(RtGuard)
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(
        @GetCurrentUser('refreshToken') refreshToken: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<APIResponse> {
        const tokens = await this.authService.refreshTokens(refreshToken);
        await this.utilsService.setCookies(res, tokens);

        return new APIResponse(
            HttpStatus.OK,
            "Tokens refreshed successfully",
            {}
        );
    }

    @Public()
    @Get('verify-email/:token')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(
        @Param('token') token: string
    ): Promise<APIResponse> {
        await this.authService.verifyEmail(token);
        return new APIResponse(
            HttpStatus.OK,
            "Email verified successfully",
            {}
        )
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(
        @Body() {email}:{email:string}
    ): Promise<APIResponse> {
        const response = await this.authService.forgotPassword(email);
        return new APIResponse(
            HttpStatus.OK,
            response,
            {}
        )
    }

    @Public()
    @Post('reset-password/:token')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body() {password}: {password: string},
        @Param('token') token: string
    ): Promise<APIResponse> {
        await this.authService.resetPassword(password, token)
        return new APIResponse(
            HttpStatus.OK,
            "Password has been reset successfully",
            {}
        )
    }

    @Delete('delete-account')
    @HttpCode(HttpStatus.OK)
    async deleteAccount(
        @GetCurrentUserId() userId: string
    ): Promise<APIResponse> {
        await this.authService.deleteAccount(userId)
        return new APIResponse(
            HttpStatus.OK,
            "Account deleted successfully",
            {}
        )
    }

}
