import { Global, Module } from '@nestjs/common';

import { MockDataService } from './mock-data.service';
import { PrismaDataService } from './prisma-data.service';
import { PrismaService } from '../../database/prisma.service';

@Global()
@Module({
  providers: [MockDataService, PrismaDataService, PrismaService],
  exports: [MockDataService, PrismaDataService],
})
export class MockDataModule {}
