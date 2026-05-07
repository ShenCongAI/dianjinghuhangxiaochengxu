import { writeFile } from 'fs/promises';
import { join } from 'path';

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { RequestWithAuth } from '../../common/auth.types';
import { AppJwtGuard } from '../../common/guards/app-jwt.guard';
import { ok } from '../../common/response';
import { PrismaDataService } from '../mock-data/prisma-data.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PartnerApplicationDto } from './dto/partner-application.dto';
import { PayOrderDto } from './dto/pay-order.dto';

@Controller('api/v1/app')
export class AppApiController {
  constructor(private readonly dataService: PrismaDataService) {}

  // Auth
  @Post('auth/register')
  async register(@Body() body: { nickname?: string; mobile?: string; password?: string }) {
    return ok(await this.dataService.registerUser(body));
  }

  @Post('auth/login')
  async login(@Body() body: { mobile?: string; password?: string }) {
    return ok(await this.dataService.loginUser(body.mobile ?? '', body.password ?? ''));
  }

  @Post('upload')
  async uploadFile(@Body() body: { file: string; filename: string }) {
    if (!body.file || !body.filename) throw new Error('缺少文件数据');
    const base64Data = body.file.replace(/^data:image\/\w+;base64,/, '').replace(/^data:audio\/\w+;base64,/, '');
    const ext = body.filename.includes('.') ? body.filename.substring(body.filename.lastIndexOf('.')) : '.png';
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    const filePath = join(process.cwd(), 'uploads', uniqueName);
    await writeFile(filePath, Buffer.from(base64Data, 'base64'));
    return ok({ url: '/uploads/' + uniqueName });
  }

  // Bootstrap
  @Get('bootstrap')
  async getBootstrap() {
    return ok(await this.dataService.getBootstrap());
  }

  // Search
  @Get('search/hot-keywords')
  async getHotKeywords() {
    return ok(await this.dataService.getHotKeywords());
  }

  @Get('search')
  async search(@Query('keyword') keyword = '') {
    return ok(await this.dataService.search(keyword || '地铁'));
  }

  // Sections
  @Get('sections/:sectionKey')
  async getSection(@Param('sectionKey') sectionKey: string) {
    return ok(await this.dataService.getSection(sectionKey));
  }

  // Products
  @Get('products')
  async listProducts(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listProducts({
      category,
      type,
      keyword,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Get('products/:productId')
  async getProduct(@Param('productId') productId: string) {
    return ok(await this.dataService.getProduct(productId));
  }

  // Talents
  @Get('talents')
  async listTalents(
    @Query('genderTag') genderTag?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listTalents({
      genderTag,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Get('talents/:talentId')
  async getTalent(@Param('talentId') talentId: string) {
    return ok(await this.dataService.getTalent(talentId));
  }

  // Clubs
  @Get('clubs')
  async listClubs() {
    return ok(await this.dataService.listClubs());
  }

  // Me
  @UseGuards(AppJwtGuard)
  @Get('me')
  async getMe(@Req() req: RequestWithAuth) {
    return ok(await this.dataService.getCurrentUser(Number(req.user!.sub)));
  }

  // Orders
  @UseGuards(AppJwtGuard)
  @Post('orders')
  async createOrder(
    @Req() req: RequestWithAuth,
    @Body() body: CreateOrderDto,
  ) {
    return ok(await this.dataService.createOrder(Number(req.user!.sub), body));
  }

  @UseGuards(AppJwtGuard)
  @Post('orders/:orderNo/pay')
  async payOrder(
    @Req() req: RequestWithAuth,
    @Param('orderNo') orderNo: string,
    @Body() body: PayOrderDto,
  ) {
    return ok(await this.dataService.payOrder(
      Number(req.user!.sub),
      orderNo,
      body.paymentMethod,
    ));
  }

  @UseGuards(AppJwtGuard)
  @Get('orders')
  async listOrders(
    @Req() req: RequestWithAuth,
    @Query('orderType') orderType?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listUserOrders(Number(req.user!.sub), {
      orderType,
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @UseGuards(AppJwtGuard)
  @Get('orders/:orderNo')
  async getOrder(@Req() req: RequestWithAuth, @Param('orderNo') orderNo: string) {
    return ok(await this.dataService.getOrderForUser(Number(req.user!.sub), orderNo));
  }

  @UseGuards(AppJwtGuard)
  @Post('orders/:orderNo/cancel')
  async cancelOrder(
    @Req() req: RequestWithAuth,
    @Param('orderNo') orderNo: string,
  ) {
    return ok(await this.dataService.cancelOrderByUser(Number(req.user!.sub), orderNo));
  }

  @UseGuards(AppJwtGuard)
  @Post('orders/:orderNo/complete')
  async confirmComplete(
    @Req() req: RequestWithAuth,
    @Param('orderNo') orderNo: string,
  ) {
    return ok(await this.dataService.confirmOrderComplete(Number(req.user!.sub), orderNo));
  }

  @UseGuards(AppJwtGuard)
  @Post('orders/:orderNo/refund')
  async requestRefund(
    @Req() req: RequestWithAuth,
    @Param('orderNo') orderNo: string,
    @Body() body: { reason: string },
  ) {
    return ok(await this.dataService.requestRefundByUser(Number(req.user!.sub), orderNo, body.reason));
  }

  // Order Pool (抢单模式)
  @UseGuards(AppJwtGuard)
  @Get('order-pool')
  async getOrderPool(
    @Query('orderType') orderType?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.getOrderPool({
      orderType,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @UseGuards(AppJwtGuard)
  @Post('order-pool/:orderNo/grab')
  async grabOrder(
    @Req() req: RequestWithAuth,
    @Param('orderNo') orderNo: string,
  ) {
    const talentId = req.user!.type === 'talent' ? String(req.user!.sub) : null;
    if (!talentId) throw new UnauthorizedException('只有打手可以抢单');
    return ok(await this.dataService.grabOrder(talentId, orderNo));
  }

  // Talent Orders (JWT-protected: talent must match talentId)
  @UseGuards(AppJwtGuard)
  @Get('talents/:talentId/orders')
  async listTalentOrders(
    @Req() req: RequestWithAuth,
    @Param('talentId') talentId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    this.verifyTalentAccess(req, talentId);
    return ok(await this.dataService.listTalentOrders(talentId, {
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @UseGuards(AppJwtGuard)
  @Get('talents/:talentId/orders/:orderNo')
  async getTalentOrderDetail(
    @Req() req: RequestWithAuth,
    @Param('talentId') talentId: string,
    @Param('orderNo') orderNo: string,
  ) {
    this.verifyTalentAccess(req, talentId);
    return ok(await this.dataService.getTalentOrderDetail(talentId, orderNo));
  }

  @UseGuards(AppJwtGuard)
  @Post('talents/:talentId/orders/:orderNo/complete')
  async completeTalentOrder(
    @Req() req: RequestWithAuth,
    @Param('talentId') talentId: string,
    @Param('orderNo') orderNo: string,
  ) {
    this.verifyTalentAccess(req, talentId);
    return ok(await this.dataService.completeTalentOrder(talentId, orderNo));
  }

  // Talent profile (JWT-protected)
  @UseGuards(AppJwtGuard)
  @Get('talents/:talentId/profile')
  async getTalentProfile(
    @Req() req: RequestWithAuth,
    @Param('talentId') talentId: string,
  ) {
    this.verifyTalentAccess(req, talentId);
    return ok(await this.dataService.getTalentProfile(talentId));
  }

  private verifyTalentAccess(req: RequestWithAuth, talentId: string) {
    if (req.user?.type === 'talent' && String(req.user.sub) !== talentId) {
      throw new UnauthorizedException('无权访问其他大神的数据');
    }
  }

  // Support
  @Get('support/faqs')
  async getSupportFaqs() {
    return ok(await this.dataService.listSupportFaqs());
  }

  @UseGuards(AppJwtGuard)
  @Post('support/tickets')
  async createTicket(
    @Req() req: RequestWithAuth,
    @Body() body: CreateTicketDto,
  ) {
    return ok(await this.dataService.createTicket(Number(req.user!.sub), body));
  }

  // Partner Applications
  @UseGuards(AppJwtGuard)
  @Post('partner-applications')
  async createPartnerApplication(
    @Req() req: RequestWithAuth,
    @Body() body: PartnerApplicationDto,
  ) {
    return ok(await this.dataService.createPartnerApplication(Number(req.user!.sub), body));
  }

  // Business Leads
  @Post('business-leads')
  async createBusinessLead(@Body() body: any) {
    return ok(await this.dataService.createBusinessLead(body));
  }
}
