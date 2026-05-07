import {
  Body,
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RequestWithAuth } from '../../common/auth.types';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { ok } from '../../common/response';
import { PrismaDataService } from '../mock-data/prisma-data.service';

@Controller('api/v1/admin/auth')
export class AdminAuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataService: PrismaDataService,
  ) {}

  @Post('login')
  async login(@Body() body: { account?: string; password?: string }) {
    if (!body.account || !body.password) {
      throw new UnauthorizedException('账号和密码不能为空');
    }

    const admin = await this.dataService.adminLogin(body.account, body.password);

    if (!admin) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const token = await this.jwtService.signAsync(
      {
        sub: admin.adminId,
        type: 'admin',
        name: admin.name,
        roleCode: admin.roleCode,
      },
      {
        secret:
          this.configService.get<string>('ADMIN_JWT_SECRET') || 'fallback',
        expiresIn: '1d',
      },
    );

    return ok({
      token,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      profile: {
        adminId: admin.adminId,
        name: admin.name,
        roleCode: admin.roleCode,
      },
    });
  }

  @UseGuards(AdminJwtGuard)
  @Get('profile')
  profile(@Req() req: RequestWithAuth) {
    return ok({
      adminId: req.user!.sub,
      name: (req.user as { name: string }).name,
      roleCode: (req.user as { roleCode: string }).roleCode,
    });
  }
}
