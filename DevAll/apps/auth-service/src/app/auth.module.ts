import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DevAllDatabaseModule } from '@dev-all/database';

@Module({
  imports: [DevAllDatabaseModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
