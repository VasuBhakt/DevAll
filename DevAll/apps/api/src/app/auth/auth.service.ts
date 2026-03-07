import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@dev-all/database';
import { Tokens, JwtPayload } from '@dev-all/helpers';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async signupLocal(dto: any): Promise<Tokens> {
        const hash = await this.hashPassword(dto.password);

        const newUser = await this.prisma.client.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hash,
            },
        });

        const tokens = await this.getTokens(newUser.id, newUser.email, newUser.role);
        await this.updateRtHash(newUser.id, tokens.refresh_token);

        return tokens;
    }

    async signinLocal(dto: any): Promise<Tokens> {
        const user = await this.prisma.client.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) throw new ForbiddenException('Access Denied');

        const passwordMatches = await this.isPasswordCorrect(dto.password, user.password);
        if (!passwordMatches) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRtHash(user.id, tokens.refresh_token);

        return tokens;
    }

    async logout(userId: string): Promise<boolean> {
        await this.prisma.client.user.updateMany({
            where: {
                id: userId,
                refresh_token: {
                    not: null,
                },
            },
            data: {
                refresh_token: null,
            },
        });
        return true;
    }

    async hashPassword(password: string, salt_rounds: number = 10) {
        const hashedPassword = await bcrypt.hash(password, salt_rounds);
        return hashedPassword;
    }

    async isPasswordCorrect(password: string, hashedPassword: string) {
        const isCorrect = await bcrypt.compare(password, hashedPassword);
        return isCorrect;
    }

    async refreshTokens(userId: string, rt: string): Promise<Tokens> {
        const user = await this.prisma.client.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user || !user.refresh_token) throw new ForbiddenException('Access Denied');

        const rtMatches = await this.isPasswordCorrect(rt, user.refresh_token);
        if (!rtMatches) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user.id, user.email, user.role);
        await this.updateRtHash(user.id, tokens.refresh_token);

        return tokens;
    }

    async updateRtHash(userId: string, rt: string): Promise<void> {
        const hash = await this.hashPassword(rt);
        await this.prisma.client.user.update({
            where: {
                id: userId,
            },
            data: {
                refresh_token: hash,
            },
        });
    }

    async getTokens(userId: string, username: string, role: string): Promise<Tokens> {
        const jwtPayload: JwtPayload = {
            id: userId,
            username: username,
            role: role,
        };

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: process.env['JWT_ACCESS_SECRET'] || 'at-secret',
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: process.env['JWT_REFRESH_SECRET'] || 'rt-secret',
                expiresIn: '7d',
            }),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }
}