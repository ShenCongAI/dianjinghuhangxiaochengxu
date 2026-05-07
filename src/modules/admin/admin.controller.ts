import { writeFile } from 'fs/promises';
import { join } from 'path';

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { ok } from '../../common/response';
import { PrismaDataService } from '../mock-data/prisma-data.service';

@UseGuards(AdminJwtGuard)
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly dataService: PrismaDataService) {}

  @Post('upload')
  async uploadFile(@Body() body: { file: string; filename: string }) {
    if (!body.file || !body.filename) throw new BadRequestException('缺少文件数据');
    const base64Data = body.file.replace(/^data:image\/\w+;base64,/, '');
    const ext = body.filename.includes('.') ? body.filename.substring(body.filename.lastIndexOf('.')) : '.png';
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    const filePath = join(process.cwd(), 'uploads', uniqueName);
    await writeFile(filePath, Buffer.from(base64Data, 'base64'));
    return ok({ url: '/uploads/' + uniqueName });
  }

  @Get('dashboard/overview')
  async dashboardOverview() {
    return ok(await this.dataService.getDashboardOverview());
  }

  @Get('users')
  async listUsers(
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listUsers({
      keyword,
      status,
      tag,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Get('users/:userId')
  async userDetail(@Param('userId') userId: string) {
    return ok(await this.dataService.getUserDetail(Number(userId)));
  }

  @Patch('users/:userId/status')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return ok(
      await this.dataService.updateUserStatus(
        Number(userId),
        body.status as any,
        body.reason,
      ),
    );
  }

  @Post('users/:userId/notes')
  async addUserNote(
    @Param('userId') userId: string,
    @Body() body: { content: string },
  ) {
    return ok(await this.dataService.addUserNote(Number(userId), body.content));
  }

  @Get('orders')
  async listOrders(
    @Query('orderType') orderType?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('isUrgent') isUrgent?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listOrders({
      orderType,
      status,
      keyword,
      isUrgent,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Get('orders/:orderNo')
  async orderDetail(@Param('orderNo') orderNo: string) {
    return ok(await this.dataService.getOrderDetail(orderNo));
  }

  @Post('orders/:orderNo/assign')
  async assignOrder(
    @Param('orderNo') orderNo: string,
    @Body() body: { talentId: string; operatorNote?: string },
  ) {
    return ok(
      await this.dataService.assignOrder(
        orderNo,
        body.talentId,
        body.operatorNote,
      ),
    );
  }

  @Post('orders/:orderNo/cancel')
  async cancelOrder(
    @Param('orderNo') orderNo: string,
    @Body() body: { reason: string },
  ) {
    return ok(await this.dataService.cancelOrder(orderNo, body.reason));
  }

  @Post('orders/:orderNo/refund')
  async refundOrder(
    @Param('orderNo') orderNo: string,
    @Body() body: { refundAmount: string; reason: string },
  ) {
    return ok(
      await this.dataService.refundOrder(
        orderNo,
        body.refundAmount,
        body.reason,
      ),
    );
  }

  @Post('orders/:orderNo/ship')
  async shipOrder(
    @Param('orderNo') orderNo: string,
    @Body() body: { company: string; trackingNo: string; operatorNote?: string },
  ) {
    return ok(
      await this.dataService.shipOrder(
        orderNo,
        body.company,
        body.trackingNo,
        body.operatorNote,
      ),
    );
  }

  @Get('services')
  async listServices(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listServices({
      category,
      status,
      keyword,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Post('services')
  async createService(@Body() body: Record<string, unknown>) {
    return ok(await this.dataService.createService(body));
  }

  @Put('services/:serviceId')
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return ok(await this.dataService.updateService(serviceId, body));
  }

  @Patch('services/:serviceId/status')
  async updateServiceStatus(
    @Param('serviceId') serviceId: string,
    @Body() body: { status: string },
  ) {
    return ok(
      await this.dataService.updateServiceStatus(serviceId, body.status as any),
    );
  }

  @Get('talents')
  async listTalents(
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listAdminTalents({
      status,
      keyword,
      tag,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Get('talents/:talentId')
  async talentDetail(@Param('talentId') talentId: string) {
    return ok(await this.dataService.getAdminTalentDetail(talentId));
  }

  @Patch('talents/:talentId/status')
  async updateTalentStatus(
    @Param('talentId') talentId: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return ok(
      await this.dataService.updateTalentStatus(
        talentId,
        body.status as any,
        body.reason,
      ),
    );
  }

  @Get('partner-applications')
  async listPartnerApplications(
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listPartnerApplications({
      status,
      keyword,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Post('partner-applications/:applicationId/review')
  async reviewPartnerApplication(
    @Param('applicationId') applicationId: string,
    @Body() body: { action: string; comment?: string },
  ) {
    return ok(
      await this.dataService.reviewPartnerApplication(
        applicationId,
        body.action as any,
        body.comment,
      ),
    );
  }

  @Get('tickets')
  async listTickets(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listTickets({
      type,
      status,
      keyword,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Get('tickets/:ticketId')
  async ticketDetail(@Param('ticketId') ticketId: string) {
    return ok(await this.dataService.getTicket(ticketId));
  }

  @Patch('tickets/:ticketId/status')
  async updateTicketStatus(
    @Param('ticketId') ticketId: string,
    @Body() body: { status: string; operatorNote?: string },
  ) {
    return ok(
      await this.dataService.updateTicketStatus(
        ticketId,
        body.status as any,
        body.operatorNote,
      ),
    );
  }

  @Get('refunds')
  async listRefunds(
    @Query('status') status?: string,
    @Query('orderType') orderType?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listRefunds({
      status,
      orderType,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Post('refunds/:refundId/approve')
  async approveRefund(
    @Param('refundId') refundId: string,
    @Body() body: { approvedAmount: string; comment?: string },
  ) {
    return ok(
      await this.dataService.approveRefund(
        refundId,
        body.approvedAmount,
        body.comment,
      ),
    );
  }

  @Post('refunds/:refundId/reject')
  async rejectRefund(
    @Param('refundId') refundId: string,
    @Body() body: { reason: string },
  ) {
    return ok(await this.dataService.rejectRefund(refundId, body.reason));
  }

  @Get('finance/overview')
  async financeOverview() {
    return ok(await this.dataService.getFinanceOverview());
  }

  @Get('finance/settlements')
  async listSettlements(
    @Query('status') status?: string,
    @Query('talentId') talentId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listSettlements({
      status,
      talentId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Post('finance/settlements/:settlementId/pay')
  async paySettlement(
    @Param('settlementId') settlementId: string,
    @Body() body: { paidAmount: string; paidAt?: string },
  ) {
    return ok(
      await this.dataService.paySettlement(
        settlementId,
        body.paidAmount,
        body.paidAt,
      ),
    );
  }

  @Get('finance/withdrawals')
  async listWithdrawals(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listWithdrawals({
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Post('finance/withdrawals/:withdrawalId/review')
  async reviewWithdrawal(
    @Param('withdrawalId') withdrawalId: string,
    @Body() body: { action: string; comment?: string },
  ) {
    return ok(
      await this.dataService.reviewWithdrawal(
        withdrawalId,
        body.action as any,
        body.comment,
      ),
    );
  }

  @Get('roles')
  async listRoles() {
    return ok(await this.dataService.listRoles());
  }

  // ==================== BANNERS ====================

  @Get('banners')
  async listBanners(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listBannersAdmin({
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Post('banners')
  async createBanner(@Body() body: any) {
    return ok(await this.dataService.createBanner(body));
  }

  @Put('banners/:bannerId')
  async updateBanner(@Param('bannerId') bannerId: string, @Body() body: any) {
    return ok(await this.dataService.updateBanner(Number(bannerId), body));
  }

  @Patch('banners/:bannerId/status')
  async updateBannerStatus(@Param('bannerId') bannerId: string, @Body() body: { status: string }) {
    return ok(await this.dataService.updateBannerStatus(Number(bannerId), body.status));
  }

  @Delete('banners/:bannerId')
  async deleteBanner(@Param('bannerId') bannerId: string) {
    return ok(await this.dataService.deleteBanner(Number(bannerId)));
  }

  // ==================== CLUBS ====================

  @Get('clubs')
  async listClubsAdmin(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listClubsAdmin({
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Post('clubs')
  async createClub(@Body() body: any) {
    return ok(await this.dataService.createClub(body));
  }

  @Put('clubs/:clubId')
  async updateClub(@Param('clubId') clubId: string, @Body() body: any) {
    return ok(await this.dataService.updateClub(Number(clubId), body));
  }

  @Patch('clubs/:clubId/status')
  async updateClubStatus(@Param('clubId') clubId: string, @Body() body: { status: string }) {
    return ok(await this.dataService.updateClubStatus(Number(clubId), body.status));
  }

  @Delete('clubs/:clubId')
  async deleteClub(@Param('clubId') clubId: string) {
    return ok(await this.dataService.deleteClub(Number(clubId)));
  }

  // ==================== FAQS ====================

  @Get('faqs')
  async listFaqsAdmin(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return ok(await this.dataService.listFaqsAdmin({
      status,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    }));
  }

  @Post('faqs')
  async createFaq(@Body() body: any) {
    return ok(await this.dataService.createFaq(body));
  }

  @Put('faqs/:faqId')
  async updateFaq(@Param('faqId') faqId: string, @Body() body: any) {
    return ok(await this.dataService.updateFaq(Number(faqId), body));
  }

  @Patch('faqs/:faqId/status')
  async updateFaqStatus(@Param('faqId') faqId: string, @Body() body: { status: string }) {
    return ok(await this.dataService.updateFaqStatus(Number(faqId), body.status));
  }

  @Delete('faqs/:faqId')
  async deleteFaq(@Param('faqId') faqId: string) {
    return ok(await this.dataService.deleteFaq(Number(faqId)));
  }

  @Get('permissions')
  async getPermissions() {
    return ok(await this.dataService.getPermissions());
  }

  @Put('roles/:roleId/permissions')
  async updateRolePermissions(
    @Param('roleId') roleId: string,
    @Body() body: { permissions: string[] },
  ) {
    return ok(
      await this.dataService.updateRolePermissions(
        Number(roleId),
        body.permissions ?? [],
      ),
    );
  }
}
