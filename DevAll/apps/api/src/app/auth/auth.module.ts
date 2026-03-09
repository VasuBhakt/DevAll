import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AtStrategy, RtStrategy } from './strategies/index.js';
import { UtilsService } from './utils/utils.js';
import { DevAllDatabaseModule } from '@dev-all/database';
import { MailService } from '@dev-all/helpers';

@Module({
    imports: [JwtModule.register({}), PassportModule, DevAllDatabaseModule],
    controllers: [AuthController],
    providers: [AuthService, AtStrategy, RtStrategy, UtilsService, MailService],
})
export class AuthModule { }
