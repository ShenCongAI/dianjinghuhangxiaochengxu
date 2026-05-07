import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AdminJwtPayload, RequestWithAuth } from '../auth.types';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('missing admin bearer token');
    }

    try {
      const secret = this.configService.get<string>('ADMIN_JWT_SECRET');
      if (!secret) throw new UnauthorizedException('admin jwt not configured');
      const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(token, {
        secret,
      });

      if (payload.type !== 'admin') {
        throw new UnauthorizedException('invalid admin token');
      }

      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
      });
      if (!admin) {
        throw new UnauthorizedException('admin not found');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('invalid or expired admin token');
    }
  }

  private extractToken(request: RequestWithAuth): string | null {
    const raw = request.headers.authorization;
    if (!raw) {
      return null;
    }

    const value = Array.isArray(raw) ? raw[0] : raw;
    return value.startsWith('Bearer ') ? value.slice(7) : null;
  }
}
