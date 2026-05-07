export interface AppJwtPayload {
  sub: number;
  type: 'app';
  nickname: string;
}

export interface TalentJwtPayload {
  sub: string;
  type: 'talent';
  name: string;
}

export interface AdminJwtPayload {
  sub: number;
  type: 'admin';
  name: string;
  roleCode: string;
}

export interface RequestWithAuth {
  headers: Record<string, string | string[] | undefined>;
  user?: AppJwtPayload | TalentJwtPayload | AdminJwtPayload;
}

