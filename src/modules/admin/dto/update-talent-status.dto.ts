import { IsEnum } from 'class-validator';

export class UpdateTalentStatusDto {
  @IsEnum(['online', 'busy', 'offline', 'reviewing', 'suspended'])
  status!: 'online' | 'busy' | 'offline' | 'reviewing' | 'suspended';
}
