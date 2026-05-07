import { IsOptional, IsString } from 'class-validator';

export class ShipOrderDto {
  @IsString()
  company!: string;

  @IsString()
  trackingNo!: string;

  @IsOptional()
  @IsString()
  operatorNote?: string;
}
