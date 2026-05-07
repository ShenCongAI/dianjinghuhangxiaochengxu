import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as https from 'https';
import * as qs from 'querystring';

@Injectable()
export class AlipayService {
  private readonly logger = new Logger(AlipayService.name);
  private readonly appId: string;
  private readonly privateKey: string;
  private readonly alipayPublicKey: string;
  private readonly gateway: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.appId = this.config.get<string>('ALIPAY_APP_ID') || '';
    this.privateKey = this.formatKey(this.config.get<string>('ALIPAY_PRIVATE_KEY') || '', 'PRIVATE');
    this.alipayPublicKey = this.formatKey(this.config.get<string>('ALIPAY_PUBLIC_KEY') || '', 'PUBLIC');
    this.gateway = this.config.get<string>('ALIPAY_GATEWAY') || 'https://openapi.alipay.com/gateway.do';
    this.enabled = !!(this.appId && this.privateKey && this.alipayPublicKey);

    if (this.enabled) {
      this.logger.log('Alipay payment enabled');
    } else {
      this.logger.warn('Alipay config missing - payment disabled. Set ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY in .env');
    }
  }

  private formatKey(raw: string, type: 'PRIVATE' | 'PUBLIC'): string {
    const cleaned = raw.replace(/\\n/g, '\n').replace(/-----(BEGIN|END) (RSA |PRIVATE|PUBLIC) KEY-----/g, '').replace(/[\r\n\s]/g, '');
    if (!cleaned) return '';
    const chunks = cleaned.match(/.{1,64}/g) || [];
    const body = chunks.join('\n');
    return `-----BEGIN ${type === 'PRIVATE' ? 'RSA ' : ''}${type} KEY-----\n${body}\n-----END ${type === 'PRIVATE' ? 'RSA ' : ''}${type} KEY-----`;
  }

  private checkEnabled() {
    if (!this.enabled) throw new Error('支付宝未配置，请联系管理员');
  }

  /** RSA2 sign a string */
  private sign(data: string): string {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data, 'utf8');
    return sign.sign(this.privateKey, 'base64');
  }

  /** Verify RSA2 signature */
  verifySign(params: Record<string, string>): boolean {
    if (!this.enabled) return false;
    const sign = params['sign'];
    const signType = params['sign_type'] || 'RSA2';
    delete params['sign'];
    delete params['sign_type'];

    const sorted = Object.keys(params)
      .filter(k => params[k] !== '' && params[k] !== undefined && params[k] !== null)
      .sort();
    const content = sorted.map(k => `${k}=${params[k]}`).join('&');

    try {
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(content, 'utf8');
      return verify.verify(this.alipayPublicKey, sign, 'base64');
    } catch (e) {
      this.logger.error('Signature verification error', e);
      return false;
    }
  }

  /** Call Alipay API */
  private async callApi(method: string, bizContent: Record<string, any>, notifyUrl?: string): Promise<any> {
    this.checkEnabled();

    const params: Record<string, string> = {
      app_id: this.appId,
      method,
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    };
    if (notifyUrl) params.notify_url = notifyUrl;

    // Build query string for sign
    const sorted = Object.keys(params).sort();
    const content = sorted.map(k => `${k}=${params[k]}`).join('&');
    params.sign = this.sign(content);

    const postData = sorted.concat('sign').map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');

    return new Promise((resolve, reject) => {
      const url = new URL(this.gateway);
      const opts: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(opts, (res) => {
        let body = '';
        res.on('data', (chunk: Buffer) => body += chunk.toString());
        res.on('end', () => {
          const parsed = qs.parse(body) as any;
          const respKey = method.replace(/\./g, '_') + '_response';
          const response = parsed[respKey];
          if (response) {
            try {
              resolve(typeof response === 'string' ? JSON.parse(response) : response);
            } catch {
              resolve(response);
            }
          } else if (parsed.error_response) {
            reject(new Error(parsed.error_response?.sub_msg || parsed.error_response?.msg || 'Alipay API error'));
          } else {
            resolve(parsed);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /** Create WAP payment (mobile browser - opens Alipay app) */
  async createPayment(params: {
    orderNo: string;
    amount: string;
    title: string;
    returnUrl?: string;
  }): Promise<{ paymentUrl: string }> {
    const notifyUrl = this.config.get<string>('PUBLIC_BASE_URL') + '/api/v1/app/payment/alipay-notify';

    const bizContent: Record<string, any> = {
      out_trade_no: params.orderNo,
      product_code: 'QUICK_WAP_WAY',
      total_amount: params.amount,
      subject: params.title,
    };
    if (params.returnUrl) bizContent.quit_url = params.returnUrl;

    // Build request params manually for page redirect
    this.checkEnabled();
    const reqParams: Record<string, string> = {
      app_id: this.appId,
      method: 'alipay.trade.wap.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      version: '1.0',
      notify_url: notifyUrl,
      biz_content: JSON.stringify(bizContent),
      return_url: params.returnUrl || '',
    };

    const sorted = Object.keys(reqParams).sort();
    const content = sorted.map(k => `${k}=${reqParams[k]}`).join('&');
    reqParams['sign'] = this.sign(content);

    const queryStr = sorted.concat('sign').map(k => `${k}=${encodeURIComponent(reqParams[k])}`).join('&');
    const paymentUrl = `${this.gateway}?${queryStr}`;

    return { paymentUrl };
  }

  /** Query order payment status from Alipay */
  async queryOrder(orderNo: string) {
    const result = await this.callApi('alipay.trade.query', {
      out_trade_no: orderNo,
    });

    const tradeStatus = result.trade_status || '';
    return {
      orderNo,
      tradeNo: result.trade_no || '',
      status: tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED' ? 'paid' :
              tradeStatus === 'WAIT_BUYER_PAY' ? 'waiting' :
              tradeStatus === 'TRADE_CLOSED' ? 'closed' : 'unknown',
      rawStatus: tradeStatus,
      amount: result.total_amount || '0',
      buyerLogonId: result.buyer_logon_id || '',
      paidAt: result.send_pay_date || '',
    };
  }
}
