import { Body, Controller, Get, Logger, Param, Post, Req, Res, UseGuards } from '@nestjs/common';

import { AlipayService } from '../../common/alipay.service';
import { AppJwtGuard } from '../../common/guards/app-jwt.guard';
import { ok } from '../../common/response';
import { PrismaDataService } from '../mock-data/prisma-data.service';

@Controller('api/v1/app/payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly alipayService: AlipayService,
    private readonly dataService: PrismaDataService,
  ) {}

  /** Create Alipay payment - returns payment URL */
  @UseGuards(AppJwtGuard)
  @Post('alipay/:orderNo')
  async createAlipayPayment(
    @Param('orderNo') orderNo: string,
    @Body() body: { returnUrl?: string },
  ) {
    const order = await this.dataService.getOrderDetail(orderNo);
    if (!order) throw new Error('订单不存在');

    const result = await this.alipayService.createPayment({
      orderNo: order.orderNo,
      amount: order.amount,
      title: order.title,
      returnUrl: body.returnUrl || '',
    });

    return ok(result);
  }

  /** Alipay async notification callback (no auth - called by Alipay server) */
  @Post('alipay-notify')
  async alipayNotify(@Req() req: any, @Res() res: any) {
    const params = req.body;

    // Verify signature
    if (!this.alipayService.verifySign({ ...params })) {
      this.logger.warn('Alipay notify: signature verification failed');
      return res.send('fail');
    }

    const orderNo = params.out_trade_no;
    const tradeStatus = params.trade_status;
    const tradeNo = params.trade_no;
    const totalAmount = params.total_amount;

    this.logger.log(`Alipay notify received: orderNo=${orderNo}, tradeNo=${tradeNo}, status=${tradeStatus}`);

    try {
      if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
        await this.dataService.confirmAlipayPayment(orderNo, tradeNo, totalAmount);
      }
      res.send('success');
    } catch (e) {
      this.logger.error(`Alipay notify error: orderNo=${orderNo}, tradeNo=${tradeNo}`, e);
      res.send('fail');
    }
  }

  /** Check payment status */
  @UseGuards(AppJwtGuard)
  @Get('status/:orderNo')
  async checkPaymentStatus(@Param('orderNo') orderNo: string) {
    try {
      const result = await this.alipayService.queryOrder(orderNo);
      return ok(result);
    } catch (e) {
      this.logger.error(`Payment status query failed for ${orderNo}`, e);
      return ok({ status: 'unknown' });
    }
  }
}
