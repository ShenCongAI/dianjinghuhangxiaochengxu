import { IsOptional, IsString } from 'class-validator';

export class PartnerApplicationDto {
  @IsString()
  name!: string;

  @IsString()
  specialty!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  contact?: string;
}
