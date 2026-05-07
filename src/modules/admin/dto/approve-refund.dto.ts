import { IsOptional, IsString } from 'class-validator';

export class ApproveRefundDto {
  @IsString()
  approvedAmount!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
