import { IsEnum } from 'class-validator';

export class PayOrderDto {
  @IsEnum(['wechat', 'alipay', 'balance'])
  paymentMethod!: 'wechat' | 'alipay' | 'balance';
}
