import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AtStrategy, RtStrategy } from './strategies/index.js';
import { UtilsService } from '../utils/utils.service.js';

@Module({
    imports: [JwtModule.register({}), PassportModule],
    controllers: [AuthController],
    providers: [AuthService, AtStrategy, RtStrategy, UtilsService],
})
export class AuthModule { }
