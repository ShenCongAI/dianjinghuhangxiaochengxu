import { IsOptional, IsString } from 'class-validator';

export class PaySettlementDto {
  @IsString()
  paidAmount!: string;

  @IsOptional()
  @IsString()
  paidAt?: string;
}
