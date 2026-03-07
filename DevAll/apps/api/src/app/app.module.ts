import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DevAllDatabaseModule } from '@dev-all/database';
import { AuthModule } from './auth/auth.module.js';
import { AtGuard } from './auth/guards/index.js';

@Module({
  imports: [DevAllDatabaseModule, AuthModule],

  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule { }

