import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewWithdrawalDto {
  @IsEnum(['approved', 'rejected', 'paid'])
  action!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
