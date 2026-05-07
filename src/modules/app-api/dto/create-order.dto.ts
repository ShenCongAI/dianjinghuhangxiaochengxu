import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsEnum(['escort', 'playmate', 'gear'])
  orderType!: 'escort' | 'playmate' | 'gear';

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  talentId?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  scheduleAt?: string;

  @IsOptional()
  quantity?: number;
}
