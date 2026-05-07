import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateTicketDto {
  @IsEnum(['reminder', 'refund', 'complaint', 'consulting'])
  type!: string;

  @IsOptional()
  @IsString()
  orderNo?: string;

  @IsString()
  content!: string;

}
