import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ok } from '../../common/response';
import { PrismaDataService } from '../mock-data/prisma-data.service';

@Controller('api/v1/app/auth')
export class AppAuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataService: PrismaDataService,
  ) {}

  @Post('mock-login')
  async mockLogin(@Body() body: { userId?: number }) {
    const userId = body.userId ?? 14864083;
    const user = await this.dataService.mockLoginGetUser(userId);

    const token = await this.jwtService.signAsync(
      {
        sub: user.userId,
        type: 'app',
        nickname: user.nickname,
      },
      {
        secret:
          this.configService.get<string>('APP_JWT_SECRET') ??
          'app-dev-secret-change-me',
        expiresIn: '7d',
      },
    );

    return ok({
      token,
      profile: {
        userId: user.userId,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    });
  }
}
