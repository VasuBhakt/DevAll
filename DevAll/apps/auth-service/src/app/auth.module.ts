import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DevAllDatabaseModule } from '@dev-all/database';
import { DevAllHelpersModule } from '@dev-all/helpers';

@Module({
  imports: [DevAllDatabaseModule, DevAllHelpersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
