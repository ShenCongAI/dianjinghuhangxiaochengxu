import { IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  title!: string;

  @IsString()
  category!: string;

  @IsEnum(['escort', 'playmate', 'gear'])
  type!: string;

  @IsString()
  price!: string;

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
