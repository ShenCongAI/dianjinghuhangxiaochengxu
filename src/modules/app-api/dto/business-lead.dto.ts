import { IsString } from 'class-validator';

export class BusinessLeadDto {
  @IsString()
  companyName!: string;

  @IsString()
  contact!: string;

  @IsString()
  note!: string;
}
