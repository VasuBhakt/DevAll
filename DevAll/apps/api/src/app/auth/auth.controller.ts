import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { Tokens, Public, GetCurrentUser, GetCurrentUserId } from '@dev-all/helpers';
import { RtGuard } from './guards/index.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('local/signup')
    @HttpCode(HttpStatus.CREATED)
    async signupLocal(
        @Body() dto: any,
        @Res({ passthrough: true }) res: Response,
    ): Promise<Tokens> {
        const tokens = await this.authService.signupLocal(dto);
        this.setCookies(res, tokens);
        return tokens;
    }

    @Public()
    @Post('local/signin')
    @HttpCode(HttpStatus.OK)
    async signinLocal(
        @Body() dto: any,
        @Res({ passthrough: true }) res: Response,
    ): Promise<Tokens> {
        const tokens = await this.authService.signinLocal(dto);
        this.setCookies(res, tokens);
        return tokens;
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @GetCurrentUserId() userId: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<boolean> {
        const result = await this.authService.logout(userId);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return result;
    }

    @Public()
    @UseGuards(RtGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(
        @GetCurrentUserId() userId: string,
        @GetCurrentUser('refreshToken') refreshToken: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<Tokens> {
        const tokens = await this.authService.refreshTokens(userId, refreshToken);
        this.setCookies(res, tokens);
        return tokens;
    }

    private setCookies(res: Response, tokens: Tokens) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'lax' as const,
        };

        res.cookie('access_token', tokens.access_token, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie('refresh_token', tokens.refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}
