import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTicketStatusDto {
  @IsEnum(['open', 'processing', 'resolved', 'closed'])
  status!: string;

  @IsOptional()
  @IsString()
  operatorNote?: string;
}
