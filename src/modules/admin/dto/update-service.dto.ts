import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(['escort', 'playmate', 'gear'])
  type?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  priceSuffix?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  intro?: string[];

  @IsOptional()
  notice?: string[];
}
