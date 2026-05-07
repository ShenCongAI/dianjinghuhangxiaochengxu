import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppJwtGuard } from '../../common/guards/app-jwt.guard';
import { PrismaDataService } from '../mock-data/prisma-data.service';
import { AppAuthController } from './app-auth.controller';
import { AppApiController } from './app-api.controller';
import { TalentAuthController } from './talent-auth.controller';

@Module({
  imports: [JwtModule.register({ secret: process.env.APP_JWT_SECRET || 'app-api-jwt-fallback' })],
  controllers: [AppAuthController, AppApiController, TalentAuthController],
  providers: [AppJwtGuard, PrismaDataService],
  exports: [AppJwtGuard],
})
export class AppApiModule {}
