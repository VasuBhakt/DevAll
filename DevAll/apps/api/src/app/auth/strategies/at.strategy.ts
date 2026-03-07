import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { JwtPayload } from '@dev-all/helpers';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: (req: Request) => {
                return req?.cookies?.['access_token'] || null;
            },
            secretOrKey: process.env['JWT_ACCESS_SECRET'] || 'at-secret',
        });
    }

    validate(payload: JwtPayload) {
        return payload;
    }
}
