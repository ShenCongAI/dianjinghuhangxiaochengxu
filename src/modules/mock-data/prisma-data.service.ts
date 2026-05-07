import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
type OrderType = 'escort' | 'playmate' | 'gear';
type OrderStatus =
  | 'pending_payment' | 'pending_assign' | 'assigned' | 'in_service'
  | 'pending_shipment' | 'shipped' | 'completed' | 'cancelled'
  | 'refund_pending' | 'refunded';
type TalentStatus = 'online' | 'busy' | 'offline' | 'reviewing' | 'suspended';
type TicketType = 'reminder' | 'refund' | 'complaint' | 'consulting';
type TicketStatus = 'open' | 'processing' | 'resolved' | 'closed';
type UserStatus = 'normal' | 'banned' | 'observing';
type PartnerApplicationStatus = 'pending' | 'interviewing' | 'approved' | 'rejected';
type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';
type SettlementStatus = 'pending' | 'paid' | 'frozen';
type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid';

@Injectable()
export class PrismaDataService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== AUTH ====================

  async registerUser(payload: {
    nickname?: string;
    mobile?: string;
    password?: string;
  }) {
    if (!payload.mobile || !payload.password) {
      throw new BadRequestException('mobile and password are required');
    }
    const existing = await this.prisma.user.findUnique({
      where: { mobile: payload.mobile },
    });
    if (existing) {
      throw new BadRequestException('mobile already registered');
    }
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        nickname: payload.nickname ?? `9100用户_${Math.floor(Math.random() * 9000 + 1000)}`,
        mobile: payload.mobile,
        password: passwordHash,
        status: 'normal',
      },
    });
    return {
      userId: user.id,
      nickname: user.nickname,
      mobile: user.mobile,
    };
  }

  async loginUser(mobile: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { mobile } });
    if (!user || !user.password) {
      throw new UnauthorizedException('invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('invalid credentials');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    return {
      userId: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      mobile: user.mobile,
      status: user.status,
    };
  }

  async mockLoginGetUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('user not found');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    return {
      userId: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      mobile: user.mobile,
      status: user.status,
    };
  }

  // ==================== APP API ====================

  async getBootstrap() {
    const [products, banners] = await Promise.all([
      this.prisma.product.findMany({
        where: { status: 'online' },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      }),
      this.prisma.banner.findMany({
        where: { status: 'online' },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return {
      banners: banners.map((b) => ({
        bannerId: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        linkType: b.linkType,
        linkValue: b.linkValue,
      })),
      sections: [
        { key: 'subway', title: '地铁护航' },
        { key: 'gear', title: '装备专区' },
        { key: 'boost', title: '极速上分' },
        { key: 'more', title: '更多' },
      ],
      hotProducts: products.map((p) => ({
        productId: p.id,
        title: p.title,
        price: p.price.toFixed(2),
        tag: p.tag,
        cover: p.cover,
      })),
      notice: '平台人员不会主动私信您，谨防被骗！未成年人禁止下单。',
    };
  }

  async getHotKeywords() {
    return {
      keywords: ['地铁护航', '极速上分', '雪隼', '女神陪玩'],
    };
  }

  async search(keyword: string) {
    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { tag: { contains: keyword } },
            { badge: { contains: keyword } },
          ],
        }
      : {};

    const [products, talents] = await Promise.all([
      this.prisma.product.findMany({
        where: { ...where, status: 'online' },
      }),
      this.prisma.talent.findMany({
        where: keyword
          ? {
              OR: [
                { name: { contains: keyword } },
                { typeLabel: { contains: keyword } },
                { voiceStyle: { contains: keyword } },
                { serviceLabel: { contains: keyword } },
              ],
            }
          : {},
      }),
    ]);

    return {
      products: products.map((p) => ({
        productId: p.id,
        title: p.title,
        price: p.price.toFixed(2),
        tag: p.tag,
        cover: p.cover,
      })),
      talents: talents.map((t) => ({
        talentId: t.id,
        name: t.name,
        price: t.price.toFixed(2),
        typeLabel: t.typeLabel,
        serviceLabel: t.serviceLabel,
      })),
    };
  }

  async getSection(sectionKey: string) {
    const themeMap: Record<string, string> = {
      subway: 'linear-gradient(135deg, #1d3557, #457b9d)',
      gear: 'linear-gradient(135deg, #e76f51, #f4a261)',
      boost: 'linear-gradient(135deg, #264653, #2a9d8f)',
      more: 'linear-gradient(135deg, #6d597a, #b56576)',
    };

    const categoryMap: Record<string, string> = {
      subway: 'subway',
      gear: 'gear',
      boost: 'boost',
      more: 'manual',
    };

    const products = await this.prisma.product.findMany({
      where: { category: categoryMap[sectionKey] ?? sectionKey },
    });

    return {
      sectionKey,
      title: `${sectionKey}专区`,
      subtitle: '低门槛上车，优先派单，适合稳定走量。',
      theme: themeMap[sectionKey] ?? themeMap.subway,
      quickLinks: [
        { label: '热卖护航', linkType: 'product', linkValue: products[0]?.id ?? '' },
        { label: '联系客服', linkType: 'support', linkValue: 'support' },
      ],
      products: products.map((p) => ({
        productId: p.id,
        title: p.title,
        price: p.price.toFixed(2),
      })),
    };
  }

  async listProducts(filters: {
    category?: string;
    type?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: any = { status: 'online' };
    if (filters.category) where.category = filters.category;
    if (filters.type) where.orderType = filters.type;
    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword } },
        { tag: { contains: filters.keyword } },
        { badge: { contains: filters.keyword } },
      ];
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      list: list.map((p) => ({
        productId: p.id,
        title: p.title,
        category: p.category,
        orderType: p.orderType,
        price: p.price.toFixed(2),
        priceSuffix: p.priceSuffix,
        tag: p.tag,
        badge: p.badge,
        cover: p.cover,
        status: p.status,
        intro: p.introJson ? JSON.parse(p.introJson) : [],
        notice: p.noticeJson ? JSON.parse(p.noticeJson) : [],
        introJson: p.introJson ? JSON.parse(p.introJson) : [],
        noticeJson: p.noticeJson ? JSON.parse(p.noticeJson) : [],
        sortOrder: p.sortOrder,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('product not found');
    return {
      productId: product.id,
      title: product.title,
      category: product.category,
      orderType: product.orderType,
      type: product.orderType,
      price: product.price.toFixed(2),
      tag: product.tag,
      badge: product.badge,
      cover: product.cover,
      status: product.status,
      intro: product.introJson ? JSON.parse(product.introJson) : [],
      notice: product.noticeJson ? JSON.parse(product.noticeJson) : [],
    };
  }

  async listTalents(filters: { genderTag?: string; status?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.genderTag === 'male') where.typeLabel = '男神';
    if (filters.genderTag === 'female') where.typeLabel = '女神';

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [talents, total] = await Promise.all([
      this.prisma.talent.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { ordersCount: 'desc' },
      }),
      this.prisma.talent.count({ where }),
    ]);

    return {
      list: talents.map((t) => ({
        talentId: t.id,
        name: t.name,
        cover: t.cover ?? `https://cdn.example.com/talent/${t.id}.png`,
        typeLabel: t.typeLabel,
        status: t.status,
        price: t.price.toFixed(2),
        score: t.score.toFixed(1),
        orders: t.ordersCount,
        voiceStyle: t.voiceStyle,
        serviceLabel: t.serviceLabel,
        tags: t.tagsJson ? JSON.parse(t.tagsJson) : [],
        bio: t.bio,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getTalent(talentId: string) {
    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });
    if (!talent) throw new NotFoundException('talent not found');
    return {
      talentId: talent.id,
      name: talent.name,
      cover: talent.cover ?? `https://cdn.example.com/talent/${talent.id}.png`,
      typeLabel: talent.typeLabel,
      status: talent.status,
      price: talent.price.toFixed(2),
      score: talent.score.toFixed(1),
      orders: talent.ordersCount,
      voiceStyle: talent.voiceStyle,
      serviceLabel: talent.serviceLabel,
      tags: talent.tagsJson ? JSON.parse(talent.tagsJson) : [],
      bio: talent.bio,
    };
  }

  async listClubs() {
    const clubs = await this.prisma.club.findMany({
      where: { status: 'online' },
    });
    return {
      list: clubs.map((c) => ({
        clubId: c.id,
        name: c.name,
        members: c.members,
        focus: c.focus,
        incomeText: c.incomeText,
        desc: c.desc,
      })),
    };
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('user not found');
    return {
      userId: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      uid: user.id.toString(),
      mobileMasked: user.mobile?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') ?? '',
    };
  }

  async createOrder(
    userId: number,
    payload: {
      orderType?: string;
      productId?: string;
      talentId?: string;
      quantity?: number;
      remark?: string;
      scheduleAt?: string;
    },
  ) {
    let title = '未命名订单';
    let amount = 0;
    let orderType: OrderType = 'escort';
    let productId: string | null = null;
    let talentId: string | null = null;
    let quantity = payload.quantity ?? 1;

    if (payload.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: payload.productId },
      });
      if (!product) throw new NotFoundException('product not found');
      title = product.title;
      amount = Number(product.price) * quantity;
      orderType = product.orderType as OrderType;
      productId = product.id;
    }

    if (payload.talentId) {
      const talent = await this.prisma.talent.findUnique({
        where: { id: payload.talentId },
      });
      if (!talent) throw new NotFoundException('talent not found');
      title = `${talent.name} 专属陪玩`;
      amount = Number(talent.price) * quantity;
      orderType = 'playmate';
      talentId = talent.id;
    }

    const orderNo = this.generateOrderNo(orderType);
    const now = new Date();

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNo,
          orderType,
          status: 'pending_payment',
          title,
          amount: amount,
          quantity,
          userId,
          productId,
          talentId,
          remark: payload.remark ?? null,
          scheduleAt: payload.scheduleAt ? new Date(payload.scheduleAt) : null,
        },
      });
      await tx.orderStatusLog.create({
        data: { orderId: created.id, status: 'pending_payment', time: now },
      });
      return created;
    });

    return {
      orderNo: order.orderNo,
      status: order.status,
      amount: order.amount.toFixed(2),
    };
  }

  async payOrder(userId: number, orderNo: string, paymentMethod: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNo, userId },
    });
    if (!order) throw new NotFoundException('order not found');
    if (order.status !== 'pending_payment') {
      throw new BadRequestException('order is not pending payment');
    }

    const now = new Date();
    const newStatus: OrderStatus = order.orderType === 'gear' ? 'pending_shipment' : 'pending_assign';

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentMethod, paidAt: now, status: newStatus },
      });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: newStatus, time: now },
      });
    });

    return {
      orderNo: order.orderNo,
      status: newStatus,
      paymentMethod,
      paidAt: now.toISOString(),
    };
  }

  async confirmAlipayPayment(orderNo: string, tradeNo: string, amount: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
    });
    if (!order) throw new NotFoundException('order not found');

    // Idempotency: skip if already processed
    if (order.status !== 'pending_payment') {
      if (order.paymentMethod === 'alipay' && order.paidAt) {
        return { orderNo: order.orderNo, status: order.status, alreadyProcessed: true };
      }
      return { orderNo: order.orderNo, status: order.status };
    }

    const now = new Date();
    const newStatus: OrderStatus = order.orderType === 'gear' ? 'pending_shipment' : 'pending_assign';

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentMethod: 'alipay', paidAt: now, status: newStatus },
      });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: newStatus, time: now },
      });
    });

    return {
      orderNo: order.orderNo,
      status: newStatus,
      tradeNo,
      paidAt: now.toISOString(),
    };
  }

  async cancelOrderByUser(userId: number, orderNo: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNo, userId },
    });
    if (!order) throw new NotFoundException('order not found');
    if (!['pending_payment', 'pending_assign'].includes(order.status)) {
      throw new BadRequestException('order cannot be cancelled at current status');
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' },
      });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: 'cancelled', time: now },
      });
    });

    return {
      orderNo: order.orderNo,
      status: 'cancelled',
    };
  }

  async confirmOrderComplete(userId: number, orderNo: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNo, userId },
    });
    if (!order) throw new NotFoundException('order not found');
    if (!['assigned', 'in_service', 'shipped'].includes(order.status)) {
      throw new BadRequestException('order cannot be completed at current status');
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'completed', completedAt: now },
      });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: 'completed', time: now },
      });
      await tx.user.update({
        where: { id: userId },
        data: { totalSpend: { increment: order.amount } },
      });
    });

    return {
      orderNo: order.orderNo,
      status: 'completed',
    };
  }

  async requestRefundByUser(userId: number, orderNo: string, reason: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNo, userId },
    });
    if (!order) throw new NotFoundException('order not found');
    if (!['pending_assign', 'assigned', 'in_service', 'pending_shipment', 'shipped'].includes(order.status)) {
      throw new BadRequestException('order cannot be refunded at current status');
    }

    const refund = await this.prisma.refund.create({
      data: {
        refundNo: `RF${Date.now()}`,
        orderId: order.id,
        status: 'pending',
        refundAmount: order.amount,
        reason,
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'refund_pending' },
    });
    await this.prisma.orderStatusLog.create({
      data: { orderId: order.id, status: 'refund_pending', time: new Date() },
    });

    return {
      refundId: refund.refundNo,
      status: refund.status,
      refundAmount: refund.refundAmount.toFixed(2),
    };
  }

  async listUserOrders(
    userId: number,
    filters: { orderType?: string; status?: string; page?: number; pageSize?: number },
  ) {
    const where: any = { userId };
    if (filters.orderType) where.orderType = filters.orderType;
    if (filters.status) where.status = filters.status;

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { product: true, talent: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      list: orders.map((o) => ({
        orderNo: o.orderNo,
        orderType: o.orderType,
        status: o.status,
        title: o.title,
        amount: o.amount.toFixed(2),
        paymentMethod: o.paymentMethod,
        remark: o.remark,
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt?.toISOString() ?? null,
        completedAt: o.completedAt?.toISOString() ?? null,
        productId: o.productId,
        talentId: o.talentId,
        talentName: o.talent?.name ?? null,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getOrderForUser(userId: number, orderNo: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNo, userId },
      include: { user: true, talent: true, product: true },
    });
    if (!order) throw new NotFoundException('order not found');

    const logs = await this.prisma.orderStatusLog.findMany({
      where: { orderId: order.id },
      orderBy: { time: 'asc' },
    });

    return {
      orderNo: order.orderNo,
      orderType: order.orderType,
      status: order.status,
      title: order.title,
      amount: order.amount.toFixed(2),
      paymentMethod: order.paymentMethod,
      remark: order.remark,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() ?? null,
      completedAt: order.completedAt?.toISOString() ?? null,
      userId: order.userId,
      productId: order.productId,
      talentId: order.talentId,
      talentName: order.talent?.name ?? null,
      statusTimeline: logs.map((log) => ({
        status: log.status,
        time: log.time.toISOString(),
      })),
    };
  }

  async listSupportFaqs() {
    const faqs = await this.prisma.fAQ.findMany({
      where: { status: 'online' },
      orderBy: { sortOrder: 'asc' },
    });
    return {
      list: faqs.map((f) => ({
        faqId: f.id,
        question: f.question,
        answer: f.answer,
      })),
    };
  }

  async createTicket(
    userId: number,
    payload: {
      type?: string;
      orderNo?: string;
      content?: string;
      attachments?: string[];
    },
  ) {
    let orderId: number | null = null;
    if (payload.orderNo) {
      const order = await this.prisma.order.findFirst({
        where: { orderNo: payload.orderNo },
      });
      if (order) orderId = order.id;
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNo: `CS${Date.now()}`,
        type: (payload.type as TicketType) ?? 'consulting',
        content: payload.content ?? '',
        attachments: JSON.stringify(payload.attachments ?? []),
        userId,
        orderId,
      },
    });

    return {
      ticketId: ticket.ticketNo,
      type: ticket.type,
      status: ticket.status,
      orderNo: payload.orderNo ?? null,
      userId: ticket.userId,
      content: ticket.content,
      createdAt: ticket.createdAt.toISOString(),
    };
  }

  async createPartnerApplication(
    userId: number,
    payload: { name?: string; specialty?: string; note?: string; contact?: string; cover?: string; voiceSample?: string },
  ) {
    const app = await this.prisma.partnerApplication.create({
      data: {
        name: payload.name ?? '',
        specialty: payload.specialty ?? '',
        note: payload.note ?? '',
        contact: payload.contact ?? '',
        cover: payload.cover ?? '',
        voiceSample: payload.voiceSample ?? '',
        userId,
      },
    });

    return {
      applicationId: app.id.toString(),
      status: app.status,
      userId: app.userId,
      name: app.name,
      specialty: app.specialty,
      note: app.note,
      contact: app.contact,
      cover: app.cover,
      voiceSample: app.voiceSample,
      createdAt: app.createdAt.toISOString(),
    };
  }

  async createBusinessLead(payload: {
    companyName?: string;
    contact?: string;
    note?: string;
  }) {
    const lead = await this.prisma.businessLead.create({
      data: {
        companyName: payload.companyName ?? '',
        contact: payload.contact ?? '',
        note: payload.note ?? '',
      },
    });

    return {
      leadId: `BL${lead.id}`,
      companyName: lead.companyName,
      contact: lead.contact,
      note: lead.note,
      createdAt: lead.createdAt.toISOString(),
    };
  }

  // ==================== 抢单模式 (Order Pool) ====================

  async getOrderPool(filters: { orderType?: string; page?: number; pageSize?: number }) {
    const where: any = {
      status: 'pending_assign',
      talentId: null,
    };
    if (filters.orderType) where.orderType = filters.orderType;

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { user: true, product: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      list: orders.map((o) => ({
        orderNo: o.orderNo,
        orderType: o.orderType,
        title: o.title,
        amount: o.amount.toFixed(2),
        remark: o.remark,
        createdAt: o.createdAt.toISOString(),
        userId: o.userId,
        userNickname: o.user?.nickname ?? '',
        productId: o.productId,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async grabOrder(talentId: string, orderNo: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
    });
    if (!order) throw new NotFoundException('order not found');
    if (order.status !== 'pending_assign') {
      throw new BadRequestException('order is not available for grabbing');
    }
    if (order.talentId) {
      throw new BadRequestException('order has already been grabbed');
    }

    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });
    if (!talent) throw new NotFoundException('talent not found');

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { talentId, status: 'assigned' },
      });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: 'assigned', time: now },
      });
      await tx.talent.update({
        where: { id: talentId },
        data: { status: 'busy' },
      });
    });

    return {
      orderNo: order.orderNo,
      status: 'assigned',
      talentId,
      talentName: talent.name,
    };
  }

  async listTalentOrders(
    talentId: string,
    filters: { status?: string; page?: number; pageSize?: number },
  ) {
    const where: any = { talentId };
    if (filters.status) where.status = filters.status;

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { user: true, product: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      list: orders.map((o) => ({
        orderNo: o.orderNo,
        orderType: o.orderType,
        status: o.status,
        title: o.title,
        amount: o.amount.toFixed(2),
        remark: o.remark,
        createdAt: o.createdAt.toISOString(),
        completedAt: o.completedAt?.toISOString() ?? null,
        userNickname: o.user?.nickname ?? '',
        productId: o.productId,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getTalentOrderDetail(talentId: string, orderNo: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNo, talentId },
      include: { user: true, product: true },
    });
    if (!order) throw new NotFoundException('order not found');
    return {
      orderNo: order.orderNo,
      orderType: order.orderType,
      status: order.status,
      title: order.title,
      amount: order.amount.toFixed(2),
      paymentMethod: order.paymentMethod,
      remark: order.remark,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString() ?? null,
      completedAt: order.completedAt?.toISOString() ?? null,
      userNickname: order.user?.nickname ?? '',
      productId: order.productId,
    };
  }

  async completeTalentOrder(talentId: string, orderNo: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNo, talentId },
    });
    if (!order) throw new NotFoundException('order not found');
    if (order.status !== 'assigned' && order.status !== 'in_progress') {
      throw new BadRequestException('order cannot be completed in current status');
    }
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'completed', completedAt: now },
      });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: 'completed', time: now },
      });
      await tx.talent.update({
        where: { id: talentId },
        data: { status: 'online' },
      });
    });
    return { orderNo, status: 'completed' };
  }

  async talentLogin(mobile: string, password: string) {
    const talent = await this.prisma.talent.findFirst({
      where: { mobile },
    });
    if (!talent || !talent.passwordHash) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    const valid = await bcrypt.compare(password, talent.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    return {
      talentId: talent.id,
      name: talent.name,
      typeLabel: talent.typeLabel,
      status: talent.status,
      score: talent.score,
    };
  }

  async getTalentProfile(talentId: string) {
    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });
    if (!talent) throw new NotFoundException('talent not found');
    const [completedCount, totalEarnings] = await Promise.all([
      this.prisma.order.count({ where: { talentId, status: 'completed' } }),
      this.prisma.order.aggregate({
        where: { talentId, status: 'completed' },
        _sum: { amount: true },
      }),
    ]);
    return {
      talentId: talent.id,
      name: talent.name,
      typeLabel: talent.typeLabel,
      status: talent.status,
      score: talent.score,
      ordersCount: talent.ordersCount,
      completedOrders: completedCount,
      totalEarnings: totalEarnings._sum.amount?.toFixed(2) ?? '0.00',
    };
  }

  // ==================== ADMIN API ====================

  async adminLogin(account: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { account },
    });
    if (!admin) return null;
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return null;
    return {
      adminId: admin.id,
      account: admin.account,
      name: admin.name,
      roleCode: admin.roleCode,
    };
  }

  async findAdmin(adminId: number) {
    return this.prisma.adminUser.findUnique({ where: { id: adminId } });
  }

  async getDashboardOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeOrders, onlineTalents, pendingTickets, revenueResult] =
      await Promise.all([
        this.prisma.order.count({
          where: { status: { notIn: ['completed', 'cancelled', 'refunded'] } },
        }),
        this.prisma.talent.count({ where: { status: 'online' } }),
        this.prisma.ticket.count({ where: { status: 'open' } }),
        this.prisma.order.aggregate({
          where: {
            paidAt: { gte: today },
            paymentMethod: { not: null },
          },
          _sum: { amount: true },
        }),
      ]);

    // Get last 7 days revenue
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    const revenueTrend = await Promise.all(
      dates.map(async (date) => {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        const agg = await this.prisma.order.aggregate({
          where: {
            paidAt: { gte: start, lt: end },
            paymentMethod: { not: null },
          },
          _sum: { amount: true },
        });
        return { date, amount: (agg._sum.amount ?? 0).toFixed(2) };
      }),
    );

    return {
      todayRevenue: revenueResult._sum.amount?.toString() ?? '0.00',
      activeOrders,
      onlineTalents,
      pendingTickets,
      revenueTrend,
      alerts: [
        {
          type: 'order_timeout',
          title: '超时未接单',
          content: `护航订单 ${Math.max(1, Math.floor(activeOrders / 10))} 单已超过 8 分钟无人响应`,
        },
      ],
    };
  }

  async listUsers(filters: {
    keyword?: string;
    status?: string;
    tag?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.keyword) {
      where.OR = [
        { nickname: { contains: filters.keyword } },
        { mobile: { contains: filters.keyword } },
      ];
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      list: users.map((u) => ({
        userId: u.id,
        nickname: u.nickname,
        mobileMasked: u.mobile?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') ?? '',
        status: u.status,
        registerAt: u.registerAt.toISOString(),
        tags: [],
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('user not found');

    const [orders, stats, notes] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.aggregate({
        where: { userId, paymentMethod: { not: null } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.userNote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const refundCount = await this.prisma.refund.count({
      where: { order: { userId } },
    });

    return {
      userId: user.id,
      nickname: user.nickname,
      mobileMasked: user.mobile?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') ?? '',
      status: user.status,
      registerAt: user.registerAt.toISOString(),
      totalSpend: (stats._sum.amount ?? 0).toFixed(2),
      orderCount: stats._count ?? 0,
      refundCount,
      notes: notes.map((n) => ({
        operator: n.operator,
        content: n.content,
        createdAt: n.createdAt.toISOString(),
      })),
      recentOrders: orders.map((o) => ({
        orderNo: o.orderNo,
        title: o.title,
        amount: o.amount.toFixed(2),
        status: o.status,
      })),
    };
  }

  async updateUserStatus(
    userId: number,
    status: UserStatus,
    reason?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('user not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    if (reason) {
      await this.prisma.userNote.create({
        data: {
          userId,
          content: `状态更新为 ${status}: ${reason}`,
          operator: '系统管理员',
        },
      });
    }

    return updated;
  }

  async addUserNote(userId: number, content: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('user not found');
    const note = await this.prisma.userNote.create({
      data: { userId, content, operator: '系统管理员' },
    });
    return {
      operator: note.operator,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
    };
  }

  async listOrders(filters: {
    orderType?: string;
    status?: string;
    keyword?: string;
    isUrgent?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: any = {};
    if (filters.orderType) where.orderType = filters.orderType;
    if (filters.status) where.status = filters.status;
    if (filters.keyword) {
      where.OR = [
        { orderNo: { contains: filters.keyword } },
        { title: { contains: filters.keyword } },
      ];
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { user: true, talent: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      list: orders.map((o) => ({
        orderNo: o.orderNo,
        orderType: o.orderType,
        status: o.status,
        title: o.title,
        amount: o.amount.toFixed(2),
        userId: o.userId,
        userNickname: o.user?.nickname ?? '',
        talentId: o.talentId,
        talentName: o.talent?.name ?? null,
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt?.toISOString() ?? null,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getOrderDetail(orderNo: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
      include: { user: true, talent: true, product: true },
    });
    if (!order) throw new NotFoundException('order not found');

    const logs = await this.prisma.orderStatusLog.findMany({
      where: { orderId: order.id },
      orderBy: { time: 'asc' },
    });

    return {
      orderNo: order.orderNo,
      orderType: order.orderType,
      status: order.status,
      title: order.title,
      amount: order.amount.toFixed(2),
      user: order.user
        ? { userId: order.user.id, nickname: order.user.nickname }
        : null,
      talent: order.talent
        ? { talentId: order.talent.id, name: order.talent.name }
        : null,
      remark: order.remark,
      serviceTimeline: logs.map((log) => ({
        status: log.status,
        time: log.time.toISOString(),
      })),
    };
  }

  async assignOrder(
    orderNo: string,
    talentId: string,
    operatorNote?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
    });
    if (!order) throw new NotFoundException('order not found');

    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });
    if (!talent) throw new NotFoundException('talent not found');

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { talentId, status: 'assigned' },
      });
      await tx.orderStatusLog.create({
        data: { orderId: order.id, status: 'assigned', time: now },
      });
      await tx.talent.update({
        where: { id: talentId },
        data: { status: 'busy' },
      });
    });

    return this.getOrderDetail(orderNo);
  }

  async cancelOrder(orderNo: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNo },
    });
    if (!order) throw new NotFoundException('order not found');

    const now = new Date();
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' },
    });
    await this.prisma.orderStatusLog.create({
      data: { orderId: order.id, status: 'cancelled', time: now },
    });

    return this.getOrderDetail(orderNo);
  }

  async refundOrder(orderNo: string, refundAmount: string, reason: string) {
    const order = await this.prisma.order.findUnique({ where: { orderNo } });
    if (!order) throw new NotFoundException('order not found');

    const refund = await this.prisma.refund.create({
      data: {
        refundNo: `RF${Date.now()}`,
        orderId: order.id,
        status: 'pending',
        refundAmount: Number(refundAmount),
        reason,
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'refund_pending' },
    });
    await this.prisma.orderStatusLog.create({
      data: { orderId: order.id, status: 'refund_pending', time: new Date() },
    });

    return {
      refundId: refund.refundNo,
      status: refund.status,
      refundAmount: refund.refundAmount.toFixed(2),
    };
  }

  async shipOrder(orderNo: string, company: string, trackingNo: string, operatorNote?: string) {
    const order = await this.prisma.order.findUnique({ where: { orderNo } });
    if (!order) throw new NotFoundException('order not found');

    const now = new Date();
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'shipped' },
    });
    await this.prisma.orderStatusLog.create({
      data: { orderId: order.id, status: 'shipped', time: now },
    });

    return this.getOrderDetail(orderNo);
  }

  async listServices(filters: { category?: string; status?: string; keyword?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword } },
        { tag: { contains: filters.keyword } },
      ];
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      list: list.map((p) => ({
        serviceId: p.id,
        productId: p.id,
        title: p.title,
        category: p.category,
        orderType: p.orderType,
        price: p.price.toFixed(2),
        tag: p.tag,
        badge: p.badge,
        cover: p.cover,
        status: p.status,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async createService(payload: Record<string, unknown>) {
    const title = (payload.title as string) ?? '';
    if (!title.trim()) throw new BadRequestException('服务标题不能为空');
    const service = await this.prisma.product.create({
      data: {
        id: this.slugify(title),
        title,
        category: (payload.category as string) ?? 'more',
        orderType: ((payload.orderType ?? payload.type) as OrderType) ?? 'escort',
        price: Number((payload.price as string) ?? '0'),
        tag: (payload.tag as string) ?? '',
        badge: (payload.badge as string) ?? '新服务',
        cover: (payload.cover as string) ?? 'https://cdn.example.com/product/default.png',
        status: (payload.status as string) ?? 'draft',
        introJson: JSON.stringify((payload.intro as string[]) ?? []),
        noticeJson: JSON.stringify((payload.notice as string[]) ?? []),
      },
    });
    return service;
  }

  async updateService(serviceId: string, payload: Record<string, unknown>) {
    const service = await this.prisma.product.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('service not found');

    const data: any = {};
    if (payload.title !== undefined) data.title = payload.title;
    if (payload.category !== undefined) data.category = payload.category;
    if (payload.price !== undefined) data.price = Number(payload.price);
    if (payload.orderType !== undefined) data.orderType = payload.orderType;
    if (payload.tag !== undefined) data.tag = payload.tag;
    if (payload.badge !== undefined) data.badge = payload.badge;
    if (payload.cover !== undefined) data.cover = payload.cover;
    if (payload.status !== undefined) data.status = payload.status;
    if (payload.intro !== undefined) data.introJson = JSON.stringify(payload.intro);
    if (payload.notice !== undefined) data.noticeJson = JSON.stringify(payload.notice);

    return this.prisma.product.update({ where: { id: serviceId }, data });
  }

  async updateServiceStatus(serviceId: string, status: string) {
    const service = await this.prisma.product.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException('service not found');
    return this.prisma.product.update({ where: { id: serviceId }, data: { status } });
  }

  async listAdminTalents(filters: { status?: string; keyword?: string; tag?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.keyword) {
      where.OR = [
        { name: { contains: filters.keyword } },
        { id: { contains: filters.keyword } },
      ];
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.talent.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { ordersCount: 'desc' },
      }),
      this.prisma.talent.count({ where }),
    ]);

    return {
      list: list.map((t) => ({
        id: t.id,
        talentId: t.id,
        name: t.name,
        typeLabel: t.typeLabel,
        status: t.status,
        price: t.price.toFixed(2),
        score: t.score.toFixed(1),
        ordersCount: t.ordersCount,
        completionRate: t.completionRate,
        avgResponseMinutes: t.avgResponseMinutes,
        todayOrders: t.todayOrders,
        pendingSettlement: t.pendingSettlement,
        complaints: t.complaints,
        voiceStyle: t.voiceStyle,
        serviceLabel: t.serviceLabel,
        tagsJson: t.tagsJson ? JSON.parse(t.tagsJson) : [],
        bio: t.bio,
        cover: t.cover,
        createdAt: t.createdAt?.toISOString() ?? null,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getAdminTalentDetail(talentId: string) {
    const talent = await this.prisma.talent.findUnique({ where: { id: talentId } });
    if (!talent) throw new NotFoundException('talent not found');
    return {
      talentId: talent.id,
      name: talent.name,
      status: talent.status,
      score: talent.score.toFixed(1),
      completionRate: (talent.completionRate ?? 0).toFixed(1),
      avgResponseMinutes: (talent.avgResponseMinutes ?? 0).toFixed(1),
      todayOrders: talent.todayOrders,
      pendingSettlement: (talent.pendingSettlement ?? 0).toFixed(2),
      complaints: talent.complaints,
      ordersCount: talent.ordersCount,
      bio: talent.bio,
    };
  }

  async updateTalentStatus(talentId: string, status: TalentStatus, reason?: string) {
    const talent = await this.prisma.talent.findUnique({ where: { id: talentId } });
    if (!talent) throw new NotFoundException('talent not found');
    return this.prisma.talent.update({
      where: { id: talentId },
      data: { status },
    });
  }

  async createTalent(payload: Record<string, unknown>) {
    const name = (payload.name as string) ?? '';
    if (!name.trim()) throw new BadRequestException('大神名称不能为空');
    const id = this.slugify(name) + '-' + Date.now();
    return this.prisma.talent.create({
      data: {
        id,
        name,
        typeLabel: (payload.typeLabel as string) ?? '男神',
        status: (payload.status as string) ?? 'offline',
        price: Number(payload.price ?? 0),
        score: Number(payload.score ?? 5),
        voiceStyle: (payload.voiceStyle as string) ?? '',
        serviceLabel: (payload.serviceLabel as string) ?? '',
        tagsJson: JSON.stringify(payload.tags ?? []),
        bio: (payload.bio as string) ?? '',
        cover: (payload.cover as string) ?? '',
        mobile: (payload.mobile as string) ?? null,
      },
    });
  }

  async updateTalent(talentId: string, payload: Record<string, unknown>) {
    const talent = await this.prisma.talent.findUnique({ where: { id: talentId } });
    if (!talent) throw new NotFoundException('talent not found');
    const data: any = {};
    if (payload.name !== undefined) data.name = payload.name;
    if (payload.typeLabel !== undefined) data.typeLabel = payload.typeLabel;
    if (payload.price !== undefined) data.price = Number(payload.price);
    if (payload.score !== undefined) data.score = Number(payload.score);
    if (payload.voiceStyle !== undefined) data.voiceStyle = payload.voiceStyle;
    if (payload.serviceLabel !== undefined) data.serviceLabel = payload.serviceLabel;
    if (payload.tags !== undefined) data.tagsJson = JSON.stringify(payload.tags);
    if (payload.bio !== undefined) data.bio = payload.bio;
    if (payload.cover !== undefined) data.cover = payload.cover;
    if (payload.mobile !== undefined) data.mobile = payload.mobile;
    if (payload.status !== undefined) data.status = payload.status;
    return this.prisma.talent.update({ where: { id: talentId }, data });
  }

  async deleteTalent(talentId: string) {
    const talent = await this.prisma.talent.findUnique({ where: { id: talentId } });
    if (!talent) throw new NotFoundException('talent not found');
    return this.prisma.talent.delete({ where: { id: talentId } });
  }

  async listPartnerApplications(filters: { status?: string; keyword?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.keyword) {
      where.OR = [
        { name: { contains: filters.keyword } },
        { specialty: { contains: filters.keyword } },
      ];
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.partnerApplication.findMany({
        where,
        include: { user: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnerApplication.count({ where }),
    ]);

    return {
      list: list.map((a) => ({
        applicationId: a.id.toString(),
        status: a.status,
        name: a.name,
        specialty: a.specialty,
        note: a.note,
        contact: a.contact,
        userId: a.userId,
        createdAt: a.createdAt.toISOString(),
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async reviewPartnerApplication(applicationId: string, action: PartnerApplicationStatus, comment?: string) {
    const app = await this.prisma.partnerApplication.findUnique({
      where: { id: Number(applicationId) },
    });
    if (!app) throw new NotFoundException('application not found');

    const updated = await this.prisma.partnerApplication.update({
      where: { id: Number(applicationId) },
      data: { status: action },
    });

    // If approved, create a talent record
    if (action === 'approved') {
      await this.prisma.talent.upsert({
        where: { id: `talent-${app.id}` },
        update: { cover: app.cover ?? undefined, voiceStyle: app.voiceSample ?? undefined },
        create: {
          id: `talent-${app.id}`,
          name: app.name,
          typeLabel: '男神',
          status: 'offline',
          price: 29.90,
          score: 5.0,
          ordersCount: 0,
          serviceLabel: app.specialty?.split('、')[0] ?? '陪玩',
          tagsJson: JSON.stringify([]),
          bio: app.note ?? '',
          cover: app.cover ?? '',
          voiceStyle: app.voiceSample ?? '',
        },
      });
    }

    return updated;
  }

  async listTickets(filters: { type?: string; status?: string; keyword?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.keyword) {
      where.OR = [
        { ticketNo: { contains: filters.keyword } },
        { content: { contains: filters.keyword } },
      ];
    }

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: { user: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      list: list.map((t) => ({
        ticketId: t.id.toString(),
        ticketNo: t.ticketNo,
        type: t.type,
        status: t.status,
        content: t.content,
        userId: t.userId,
        userNickname: t.user?.nickname ?? '',
        orderId: t.orderId,
        createdAt: t.createdAt.toISOString(),
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getTicket(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: Number(ticketId) },
      include: { user: true, order: true },
    });
    if (!ticket) throw new NotFoundException('ticket not found');
    return {
      ticketId: ticket.id.toString(),
      ticketNo: ticket.ticketNo,
      type: ticket.type,
      status: ticket.status,
      content: ticket.content,
      userId: ticket.userId,
      orderNo: ticket.order?.orderNo ?? null,
      createdAt: ticket.createdAt.toISOString(),
      operatorNote: ticket.operatorNote,
    };
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, operatorNote?: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: Number(ticketId) },
    });
    if (!ticket) throw new NotFoundException('ticket not found');
    return this.prisma.ticket.update({
      where: { id: Number(ticketId) },
      data: { status, operatorNote },
    });
  }

  async listRefunds(filters: { status?: string; orderType?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        include: { order: { include: { user: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.count({ where }),
    ]);

    return {
      list: list.map((r) => ({
        refundId: r.id.toString(),
        refundNo: r.refundNo,
        orderNo: r.order?.orderNo ?? '',
        orderType: r.order?.orderType ?? '',
        status: r.status,
        refundAmount: r.refundAmount.toFixed(2),
        reason: r.reason,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async approveRefund(refundId: string, approvedAmount: string, comment?: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: Number(refundId) },
    });
    if (!refund) throw new NotFoundException('refund not found');

    await this.prisma.refund.update({
      where: { id: Number(refundId) },
      data: { status: 'approved', refundAmount: Number(approvedAmount), comment },
    });

    if (refund.orderId) {
      await this.prisma.order.update({
        where: { id: refund.orderId },
        data: { status: 'refunded' },
      });
      await this.prisma.orderStatusLog.create({
        data: { orderId: refund.orderId, status: 'refunded', time: new Date() },
      });
    }

    return refund;
  }

  async rejectRefund(refundId: string, reason: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: Number(refundId) },
    });
    if (!refund) throw new NotFoundException('refund not found');

    return this.prisma.refund.update({
      where: { id: Number(refundId) },
      data: { status: 'rejected', comment: reason },
    });
  }

  async getFinanceOverview() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [incomeResult, refundResult, settlementResult] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          paymentMethod: { not: null },
          paidAt: { gte: todayStart },
        },
        _sum: { amount: true },
      }),
      this.prisma.refund.aggregate({
        where: { status: { in: ['pending', 'approved'] } },
        _sum: { refundAmount: true },
      }),
      this.prisma.settlement.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true },
      }),
    ]);

    const todayIncome = Number(incomeResult._sum.amount ?? 0);
    const todayRefund = Number(refundResult._sum.refundAmount ?? 0);
    const pendingSettlement = Number(settlementResult._sum.amount ?? 0);

    return {
      todayIncome: todayIncome.toFixed(2),
      todayRefund: todayRefund.toFixed(2),
      pendingSettlement: pendingSettlement.toFixed(2),
      grossProfit: (todayIncome * 0.301).toFixed(2),
    };
  }

  async listSettlements(filters: { status?: string; talentId?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.talentId) where.talentId = filters.talentId;

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.settlement.findMany({
        where,
        include: { talent: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.settlement.count({ where }),
    ]);

    return {
      list: list.map((s) => ({
        settlementId: s.id.toString(),
        settlementNo: s.settlementNo,
        talentId: s.talentId,
        talentName: s.talent?.name ?? '',
        amount: s.amount.toFixed(2),
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        paidAt: s.paidAt?.toISOString() ?? null,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async paySettlement(settlementId: string, paidAmount: string, paidAt?: string) {
    const settlement = await this.prisma.settlement.findUnique({
      where: { id: Number(settlementId) },
    });
    if (!settlement) throw new NotFoundException('settlement not found');
    return this.prisma.settlement.update({
      where: { id: Number(settlementId) },
      data: {
        status: 'paid',
        amount: Number(paidAmount),
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    });
  }

  async listWithdrawals(filters: { status?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        include: { talent: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.withdrawal.count({ where }),
    ]);

    return {
      list: list.map((w) => ({
        withdrawalId: w.id.toString(),
        withdrawalNo: w.withdrawalNo,
        talentId: w.talentId,
        talentName: w.talent?.name ?? '',
        amount: w.amount.toFixed(2),
        status: w.status,
        comment: w.comment,
        createdAt: w.createdAt.toISOString(),
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async reviewWithdrawal(withdrawalId: string, action: WithdrawalStatus, comment?: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: Number(withdrawalId) },
    });
    if (!withdrawal) throw new NotFoundException('withdrawal not found');
    return this.prisma.withdrawal.update({
      where: { id: Number(withdrawalId) },
      data: { status: action, comment },
    });
  }

  async listRoles() {
    return {
      list: [
        { roleId: 1, roleCode: 'super_admin', roleName: '超级管理员' },
        { roleId: 2, roleCode: 'operator', roleName: '运营' },
        { roleId: 3, roleCode: 'cs', roleName: '客服' },
        { roleId: 4, roleCode: 'finance', roleName: '财务' },
      ],
    };
  }

  async getPermissions() {
    return {
      modules: [
        {
          module: 'orders',
          permissions: ['orders.read', 'orders.assign', 'orders.cancel', 'orders.refund'],
        },
        {
          module: 'tickets',
          permissions: ['tickets.read', 'tickets.update'],
        },
        {
          module: 'services',
          permissions: ['services.read', 'services.write', 'services.publish'],
        },
        {
          module: 'finance',
          permissions: ['finance.read', 'finance.pay', 'finance.withdraw.review'],
        },
      ],
    };
  }

  async updateRolePermissions(roleId: number, permissions: string[]) {
    const role = (await this.listRoles()).list.find((r) => r.roleId === roleId);
    if (!role) throw new NotFoundException('role not found');
    return { roleId, permissions };
  }

  private generateOrderNo(orderType: OrderType): string {
    const prefix = orderType === 'escort' ? 'DH' : orderType === 'playmate' ? 'PW' : 'ZB';
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${ts}${rand}`;
  }

  // ==================== BANNERS ====================

  async listBannersAdmin(filters: { status?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.banner.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { sortOrder: 'asc' } }),
      this.prisma.banner.count({ where }),
    ]);
    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async createBanner(payload: { title: string; subtitle?: string; image: string; linkType?: string; linkValue: string; sortOrder?: number; status?: string }) {
    return this.prisma.banner.create({
      data: {
        title: payload.title,
        subtitle: payload.subtitle ?? '',
        image: payload.image,
        linkType: payload.linkType ?? 'section',
        linkValue: payload.linkValue,
        sortOrder: payload.sortOrder ?? 0,
        status: payload.status ?? 'online',
      },
    });
  }

  async updateBanner(id: number, payload: Record<string, unknown>) {
    const data: any = {};
    if (payload.title !== undefined) data.title = payload.title;
    if (payload.subtitle !== undefined) data.subtitle = payload.subtitle;
    if (payload.image !== undefined) data.image = payload.image;
    if (payload.linkType !== undefined) data.linkType = payload.linkType;
    if (payload.linkValue !== undefined) data.linkValue = payload.linkValue;
    if (payload.sortOrder !== undefined) data.sortOrder = Number(payload.sortOrder);
    if (payload.status !== undefined) data.status = payload.status;
    return this.prisma.banner.update({ where: { id }, data });
  }

  async updateBannerStatus(id: number, status: string) {
    return this.prisma.banner.update({ where: { id }, data: { status } });
  }

  async deleteBanner(id: number) {
    return this.prisma.banner.delete({ where: { id } });
  }

  // ==================== CLUBS (ADMIN) ====================

  async listClubsAdmin(filters: { status?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.club.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.club.count({ where }),
    ]);
    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async createClub(payload: { name: string; members?: number; focus?: string; incomeText?: string; desc?: string; status?: string }) {
    return this.prisma.club.create({
      data: {
        name: payload.name,
        members: payload.members ?? 0,
        focus: payload.focus ?? '',
        incomeText: payload.incomeText ?? '',
        desc: payload.desc ?? '',
        status: payload.status ?? 'online',
      },
    });
  }

  async updateClub(id: number, payload: Record<string, unknown>) {
    const data: any = {};
    if (payload.name !== undefined) data.name = payload.name;
    if (payload.members !== undefined) data.members = Number(payload.members);
    if (payload.focus !== undefined) data.focus = payload.focus;
    if (payload.incomeText !== undefined) data.incomeText = payload.incomeText;
    if (payload.desc !== undefined) data.desc = payload.desc;
    if (payload.status !== undefined) data.status = payload.status;
    return this.prisma.club.update({ where: { id }, data });
  }

  async updateClubStatus(id: number, status: string) {
    return this.prisma.club.update({ where: { id }, data: { status } });
  }

  async deleteClub(id: number) {
    return this.prisma.club.delete({ where: { id } });
  }

  // ==================== FAQS (ADMIN) ====================

  async listFaqsAdmin(filters: { status?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const [list, total] = await Promise.all([
      this.prisma.fAQ.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { sortOrder: 'asc' } }),
      this.prisma.fAQ.count({ where }),
    ]);
    return { list, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async createFaq(payload: { question: string; answer: string; sortOrder?: number; status?: string }) {
    return this.prisma.fAQ.create({
      data: {
        question: payload.question,
        answer: payload.answer,
        sortOrder: payload.sortOrder ?? 0,
        status: payload.status ?? 'online',
      },
    });
  }

  async updateFaq(id: number, payload: Record<string, unknown>) {
    const data: any = {};
    if (payload.question !== undefined) data.question = payload.question;
    if (payload.answer !== undefined) data.answer = payload.answer;
    if (payload.sortOrder !== undefined) data.sortOrder = Number(payload.sortOrder);
    if (payload.status !== undefined) data.status = payload.status;
    return this.prisma.fAQ.update({ where: { id }, data });
  }

  async updateFaqStatus(id: number, status: string) {
    return this.prisma.fAQ.update({ where: { id }, data: { status } });
  }

  async deleteFaq(id: number) {
    return this.prisma.fAQ.delete({ where: { id } });
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
