import { JwtPayload, Tokens } from '@dev-all/helpers';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

@Injectable()
export class UtilsService {

    constructor(
        private jwtService: JwtService
    ) { }

    async hashPassword(password: string, saltRounds: number = 10) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }

    async isPasswordCorrect(password: string, hashedPassword: string) {
        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
        return isPasswordCorrect;
    }

    async generateToken(ttl: number) {
        const token = await crypto.randomBytes(20).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + ttl);
        return { token, hashedToken, expiresAt };
    }

    async hashToken(token: string): Promise<string> {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        return hashedToken;
    }

    async generateAccessAndRefreshTokens(userId: string, username: string, role: string): Promise<Tokens> {
        const jwtPayload: JwtPayload = {
            id: userId,
            username: username,
            role: role
        }
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: process.env['JWT_ACCESS_SECRET'] || 'at-secret',
                expiresIn: '3h'
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: process.env['JWT_REFRESH_SECRET'] || 'rt-secret',
                expiresIn: '15d'
            })
        ])
        return {
            access_token: at,
            refresh_token: rt
        }
    }
}