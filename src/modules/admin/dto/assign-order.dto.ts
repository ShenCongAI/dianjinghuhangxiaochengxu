import { IsString } from 'class-validator';

export class AssignOrderDto {
  @IsString()
  talentId!: string;

  @IsString()
  operatorNote?: string;
}
