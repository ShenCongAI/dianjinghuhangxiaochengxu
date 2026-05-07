import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppApiModule } from './modules/app-api/app-api.module';
import { HealthModule } from './modules/health/health.module';
import { MockDataModule } from './modules/mock-data/mock-data.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    MockDataModule,
    HealthModule,
    AppApiModule,
    AdminModule,
    PaymentModule,
  ],
})
export class AppModule {}

