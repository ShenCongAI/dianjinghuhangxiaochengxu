import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AppJwtPayload, RequestWithAuth, TalentJwtPayload } from '../auth.types';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AppJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('missing bearer token');
    }

    const secret = this.configService.get<string>('APP_JWT_SECRET');
    if (!secret) throw new UnauthorizedException('jwt not configured');

    try {
      const payload = await this.jwtService.verifyAsync<
        AppJwtPayload | TalentJwtPayload
      >(token, { secret });

      if (payload.type === 'app') {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });
        if (!user) throw new UnauthorizedException('user not found');
      } else if (payload.type === 'talent') {
        const talent = await this.prisma.talent.findUnique({
          where: { id: payload.sub },
        });
        if (!talent) throw new UnauthorizedException('talent not found');
      } else {
        throw new UnauthorizedException('invalid token type');
      }

      request.user = payload;
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('invalid or expired token');
    }
  }

  private extractToken(request: RequestWithAuth): string | null {
    const raw = request.headers.authorization;
    if (!raw) return null;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value.startsWith('Bearer ') ? value.slice(7) : null;
  }
}
