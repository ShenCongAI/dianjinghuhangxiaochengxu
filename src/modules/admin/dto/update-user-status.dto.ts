import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsEnum(['normal', 'banned', 'observing'])
  status!: 'normal' | 'banned' | 'observing';

  @IsOptional()
  @IsString()
  reason?: string;
}
