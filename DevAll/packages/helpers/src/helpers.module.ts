import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service.js';

@Module({
  controllers: [],
  providers: [MailService],
  exports: [MailService],
})
export class DevAllHelpersModule { }
