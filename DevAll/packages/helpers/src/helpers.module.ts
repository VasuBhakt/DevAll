import { Module } from '@nestjs/common';
import { PasswordService } from './password.service.js';

@Module({
  controllers: [],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class DevAllHelpersModule { }
