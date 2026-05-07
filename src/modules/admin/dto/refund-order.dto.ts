import { IsString } from 'class-validator';

export class RefundOrderDto {
  @IsString()
  refundAmount!: string;

  @IsString()
  reason!: string;
}
