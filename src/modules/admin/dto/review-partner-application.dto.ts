import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ReviewPartnerApplicationDto {
  @IsEnum(['pending', 'interviewing', 'approved', 'rejected'])
  action!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
