import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PrismaDataService } from '../mock-data/prisma-data.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminController } from './admin.controller';

@Module({
  imports: [JwtModule.register({ secret: 'admin-dev-secret' })],
  controllers: [AdminAuthController, AdminController],
  providers: [AdminJwtGuard, PrismaDataService],
})
export class AdminModule {}

