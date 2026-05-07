import { IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  permissions!: string[];
}
