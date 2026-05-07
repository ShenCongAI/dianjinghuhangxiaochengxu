import { Controller, Get } from '@nestjs/common';

import { ok } from '../../common/response';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return ok({
      status: 'ok',
      service: '9100-backend',
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }
}

