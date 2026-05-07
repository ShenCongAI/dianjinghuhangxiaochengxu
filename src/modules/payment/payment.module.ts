import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AlipayService } from '../../common/alipay.service';
import { AppJwtGuard } from '../../common/guards/app-jwt.guard';
import { PrismaDataService } from '../mock-data/prisma-data.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [JwtModule.register({ secret: process.env.APP_JWT_SECRET || 'payment-jwt-fallback' })],
  controllers: [PaymentController],
  providers: [AlipayService, PrismaDataService, AppJwtGuard],
  exports: [AlipayService],
})
export class PaymentModule {}
