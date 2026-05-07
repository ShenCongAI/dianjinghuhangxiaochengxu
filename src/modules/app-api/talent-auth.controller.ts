import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ok } from '../../common/response';
import { PrismaDataService } from '../mock-data/prisma-data.service';

@Controller('api/v1/app/talent-auth')
export class TalentAuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataService: PrismaDataService,
  ) {}

  @Post('login')
  async login(@Body() body: { mobile?: string; password?: string }) {
    if (!body.mobile || !body.password) {
      throw new UnauthorizedException('手机号和密码不能为空');
    }
    const talent = await this.dataService.talentLogin(body.mobile, body.password);

    const secret = this.configService.get<string>('APP_JWT_SECRET');
    if (!secret) throw new Error('JWT secret not configured');
    const token = await this.jwtService.signAsync(
      { sub: talent.talentId, type: 'talent', name: talent.name },
      { secret, expiresIn: '7d' },
    );

    return ok({ token, profile: talent });
  }
}
