import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { AtGuard } from './auth/guards/index.js';
import { ProfileModule } from './profile/profile.module.js';
import { ProjectModule } from './project/project.module.js';
import { AchievementModule } from './achievements/achievement.module.js';

@Module({
  imports: [AuthModule, ProfileModule, ProjectModule, AchievementModule],

  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule { }

