import { Injectable, NotFoundException } from '@nestjs/common';

type UserStatus = 'normal' | 'banned' | 'observing';
type OrderType = 'escort' | 'playmate' | 'gear';
type OrderStatus =
  | 'pending_payment'
  | 'pending_assign'
  | 'assigned'
  | 'in_service'
  | 'pending_shipment'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refund_pending'
  | 'refunded';
type PaymentMethod = 'wechat' | 'alipay' | 'balance';
type TalentStatus = 'online' | 'busy' | 'offline' | 'reviewing' | 'suspended';
type TicketType = 'reminder' | 'refund' | 'complaint' | 'consulting';
type TicketStatus = 'open' | 'processing' | 'resolved' | 'closed';
type PartnerStatus = 'pending' | 'interviewing' | 'approved' | 'rejected';
type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';
type SettlementStatus = 'pending' | 'paid' | 'frozen';
type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid';

interface AppUser {
  userId: number;
  nickname: string;
  avatar: string;
  uid: string;
  mobileMasked: string;
  status: UserStatus;
  tags: string[];
  registerAt: string;
  lastLoginAt: string;
  totalSpend: string;
  orderCount: number;
  refundCount: number;
  notes: Array<{
    operator: string;
    content: string;
    createdAt: string;
  }>;
}

interface ProductRecord {
  productId: string;
  title: string;
  category: string;
  type: OrderType;
  price: string;
  priceSuffix?: string;
  tag: string;
  badge: string;
  cover: string;
  status: 'online' | 'offline' | 'draft';
  intro: string[];
  notice: string[];
}

interface TalentRecord {
  talentId: string;
  name: string;
  typeLabel: string;
  status: TalentStatus;
  price: string;
  score: string;
  orders: number;
  voiceStyle: string;
  serviceLabel: string;
  tags: string[];
  bio: string;
  completionRate: string;
  avgResponseMinutes: string;
  todayOrders: number;
  pendingSettlementAmount: string;
  complaints: number;
  cover: string;
}

interface OrderRecord {
  orderNo: string;
  orderType: OrderType;
  status: OrderStatus;
  title: string;
  amount: string;
  paymentMethod: PaymentMethod | null;
  userId: number;
  talentId: string | null;
  productId: string | null;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  remark: string | null;
  urgent: boolean;
  csNotes: Array<{
    operator: string;
    content: string;
    createdAt: string;
  }>;
  serviceTimeline: Array<{
    status: OrderStatus;
    time: string;
  }>;
  shipment?: {
    company: string;
    trackingNo: string;
    operatorNote?: string;
  };
}

interface TicketRecord {
  ticketId: string;
  type: TicketType;
  status: TicketStatus;
  orderNo: string | null;
  userId: number;
  content: string;
  attachments: string[];
  createdAt: string;
  operatorNote?: string;
}

interface PartnerApplicationRecord {
  applicationId: string;
  status: PartnerStatus;
  userId: number;
  name: string;
  specialty: string;
  note: string;
  contact: string;
  createdAt: string;
  reviewComment?: string;
}

interface BusinessLeadRecord {
  leadId: string;
  companyName: string;
  contact: string;
  note: string;
  createdAt: string;
}

interface RefundRecord {
  refundId: string;
  refundNo: string;
  orderNo: string;
  orderType: OrderType;
  status: RefundStatus;
  refundAmount: string;
  reason: string;
  createdAt: string;
  comment?: string;
}

interface SettlementRecord {
  settlementId: string;
  settlementNo: string;
  talentId: string;
  talentName: string;
  amount: string;
  status: SettlementStatus;
  createdAt: string;
  paidAt?: string;
}

interface WithdrawalRecord {
  withdrawalId: string;
  withdrawalNo: string;
  talentId: string;
  talentName: string;
  amount: string;
  status: WithdrawalStatus;
  createdAt: string;
  comment?: string;
}

interface RoleRecord {
  roleId: number;
  roleCode: string;
  roleName: string;
}

interface AdminRecord {
  adminId: number;
  account: string;
  password: string;
  name: string;
  roleCode: string;
}

@Injectable()
export class MockDataService {
  private readonly users: AppUser[] = [
    {
      userId: 14864083,
      nickname: '9100用户_8848',
      avatar: 'https://cdn.example.com/avatar/14864083.png',
      uid: '14864083',
      mobileMasked: '138****8811',
      status: 'normal',
      tags: ['high_value', 'escort_preference'],
      registerAt: this.minutesAgo(82000),
      lastLoginAt: this.minutesAgo(34),
      totalSpend: '3820.00',
      orderCount: 24,
      refundCount: 1,
      notes: [
        {
          operator: '客服A',
          content: '接受客服推荐，遇到接单慢会立即催单。',
          createdAt: this.minutesAgo(800),
        },
      ],
    },
    {
      userId: 14864221,
      nickname: '地铁冲榜小周',
      avatar: 'https://cdn.example.com/avatar/14864221.png',
      uid: '14864221',
      mobileMasked: '136****2277',
      status: 'normal',
      tags: ['new_user', 'urgent_orders'],
      registerAt: this.minutesAgo(20000),
      lastLoginAt: this.minutesAgo(12),
      totalSpend: '680.00',
      orderCount: 6,
      refundCount: 0,
      notes: [],
    },
    {
      userId: 14863914,
      nickname: '装备采购小南',
      avatar: 'https://cdn.example.com/avatar/14863914.png',
      uid: '14863914',
      mobileMasked: '139****4400',
      status: 'observing',
      tags: ['gear_focus', 'after_sale_sensitive'],
      registerAt: this.minutesAgo(96000),
      lastLoginAt: this.minutesAgo(200),
      totalSpend: '1560.00',
      orderCount: 9,
      refundCount: 2,
      notes: [
        {
          operator: '客服B',
          content: '售后沟通敏感，需保留完整发货证据。',
          createdAt: this.minutesAgo(1200),
        },
      ],
    },
  ];

  private readonly products: ProductRecord[] = [
    {
      productId: 'subway-escort',
      title: '地铁护航 300W-1000W',
      category: 'subway',
      type: 'escort',
      price: '9.90',
      priceSuffix: '起',
      tag: '人工技术保障 · 纯手工',
      badge: '护航爆款',
      cover: 'https://cdn.example.com/product/subway-escort.png',
      status: 'online',
      intro: ['纯手工护航，效率优先。', '支持全程截图反馈。', '翻车按规则补偿。'],
      notice: ['账号需可正常登录。', '禁止私下转账。'],
    },
    {
      productId: 'crash-challenge',
      title: '进阶翻车挑战单',
      category: 'boost',
      type: 'escort',
      price: '32.00',
      priceSuffix: '起',
      tag: '保底500W · 翻车包赔',
      badge: '极速上分',
      cover: 'https://cdn.example.com/product/crash-challenge.png',
      status: 'online',
      intro: ['适合冲刺期高强度订单。', '支持局后复盘。', '按目标段位拆分执行。'],
      notice: ['高峰期可能排队。', '请先确认目标分段。'],
    },
    {
      productId: 'snowfalcon',
      title: '人工服务-雪隼',
      category: 'manual',
      type: 'escort',
      price: '28.80',
      tag: '王牌段位 · 包满意',
      badge: '人工服务',
      cover: 'https://cdn.example.com/product/snowfalcon.png',
      status: 'online',
      intro: ['专属接单池，主打稳定和响应。', '客服可根据偏好匹配人员。', '开局前可换人。'],
      notice: ['若需指定风格请备注。', '默认安排最快可接单人员。'],
    },
    {
      productId: 'gear-premium',
      title: '高阶电竞装备组合',
      category: 'gear',
      type: 'gear',
      price: '199.00',
      tag: '高阶组合 · 包邮到家',
      badge: '高配专区',
      cover: 'https://cdn.example.com/product/gear-premium.png',
      status: 'online',
      intro: ['精选电竞配件组合。', '发货前支持视频验货。', '适合工作室和重度玩家。'],
      notice: ['发货后不可更改地址。', '定制类商品不支持无理由退换。'],
    },
  ];

  private readonly talents: TalentRecord[] = [
    {
      talentId: 'xiaomu',
      name: '9100小木',
      typeLabel: '男神',
      status: 'online',
      price: '29.90',
      score: '4.9',
      orders: 1200,
      voiceStyle: '低音稳聊',
      serviceLabel: '5分钟响应',
      tags: ['地铁护航', '稳单', '秒回'],
      bio: '偏稳健护航风格，适合低失误陪跑和长时间连单。',
      completionRate: '98.0',
      avgResponseMinutes: '2.3',
      todayOrders: 8,
      pendingSettlementAmount: '920.00',
      complaints: 0,
      cover: 'https://cdn.example.com/talent/xiaomu.png',
    },
    {
      talentId: 'xiaoli',
      name: '优质陪玩小梨',
      typeLabel: '女神',
      status: 'busy',
      price: '39.90',
      score: '5.0',
      orders: 2300,
      voiceStyle: '甜妹音',
      serviceLabel: '语音陪玩',
      tags: ['女神陪玩', '高情绪价值', '会唱歌'],
      bio: '互动型风格，擅长语音陪玩和娱乐局带气氛。',
      completionRate: '97.0',
      avgResponseMinutes: '4.1',
      todayOrders: 5,
      pendingSettlementAmount: '1480.00',
      complaints: 0,
      cover: 'https://cdn.example.com/talent/xiaoli.png',
    },
    {
      talentId: 'baicheng',
      name: '9100白城',
      typeLabel: '男神',
      status: 'reviewing',
      price: '42.00',
      score: '4.9',
      orders: 1600,
      voiceStyle: '高冷指挥',
      serviceLabel: '冲榜保段',
      tags: ['高分段', '指挥型', '保段'],
      bio: '高分段指挥型接单人员，适合冲榜和保段订单。',
      completionRate: '96.4',
      avgResponseMinutes: '3.4',
      todayOrders: 3,
      pendingSettlementAmount: '2360.00',
      complaints: 1,
      cover: 'https://cdn.example.com/talent/baicheng.png',
    },
  ];

  private readonly clubs = [
    {
      clubId: 1,
      name: '9100雷霆分部',
      members: 128,
      focus: '地铁护航 / 车队排位',
      incomeText: '昨日成交 ¥8420',
      desc: '全天在线车队，适合护航走量和车队稳定接单。',
    },
    {
      clubId: 2,
      name: '雪隼精英俱乐部',
      members: 76,
      focus: '人工服务 / 高段位订单',
      incomeText: '昨日成交 ¥5160',
      desc: '主打高段位人工服务，审核标准更严格。',
    },
  ];

  private readonly supportFaqs = [
    {
      faqId: 1,
      question: '下单后多久会有人接单？',
      answer:
        '通常 5 分钟内会由系统分配接单人员。高峰时段若超过 15 分钟仍无人接单，可申请退款。',
    },
    {
      faqId: 2,
      question: '装备类订单什么时候发货？',
      answer: '现货订单一般当日处理，晚间订单次日优先发货。',
    },
  ];

  private readonly adminUsers: AdminRecord[] = [
    {
      adminId: 1,
      account: 'admin',
      password: 'admin123',
      name: '系统管理员',
      roleCode: 'super_admin',
    },
  ];

  private orders: OrderRecord[] = [
    {
      orderNo: 'DH24042718',
      orderType: 'escort',
      status: 'pending_assign',
      title: '地铁护航 300W-1000W',
      amount: '9.90',
      paymentMethod: 'wechat',
      userId: 14864221,
      talentId: null,
      productId: 'subway-escort',
      createdAt: this.minutesAgo(90),
      paidAt: this.minutesAgo(89),
      completedAt: null,
      remark: '希望5分钟内开单',
      urgent: true,
      csNotes: [
        {
          operator: '客服B',
          content: '用户已催单1次',
          createdAt: this.minutesAgo(82),
        },
      ],
      serviceTimeline: [
        {
          status: 'pending_payment',
          time: this.minutesAgo(90),
        },
        {
          status: 'pending_assign',
          time: this.minutesAgo(89),
        },
      ],
    },
    {
      orderNo: 'PW24042709',
      orderType: 'playmate',
      status: 'assigned',
      title: '优质陪玩小梨 专属陪玩',
      amount: '39.90',
      paymentMethod: 'alipay',
      userId: 14864083,
      talentId: 'xiaoli',
      productId: null,
      createdAt: this.minutesAgo(126),
      paidAt: this.minutesAgo(124),
      completedAt: null,
      remark: '21:30上线，需连麦',
      urgent: false,
      csNotes: [],
      serviceTimeline: [
        {
          status: 'pending_payment',
          time: this.minutesAgo(126),
        },
        {
          status: 'pending_assign',
          time: this.minutesAgo(124),
        },
        {
          status: 'assigned',
          time: this.minutesAgo(120),
        },
      ],
    },
    {
      orderNo: 'ZB24042607',
      orderType: 'gear',
      status: 'pending_shipment',
      title: '高阶电竞装备组合',
      amount: '199.00',
      paymentMethod: 'wechat',
      userId: 14863914,
      talentId: null,
      productId: 'gear-premium',
      createdAt: this.minutesAgo(460),
      paidAt: this.minutesAgo(455),
      completedAt: null,
      remark: null,
      urgent: false,
      csNotes: [
        {
          operator: '仓库A',
          content: '仓库已验货，等打印面单。',
          createdAt: this.minutesAgo(230),
        },
      ],
      serviceTimeline: [
        {
          status: 'pending_payment',
          time: this.minutesAgo(460),
        },
        {
          status: 'pending_shipment',
          time: this.minutesAgo(455),
        },
      ],
    },
  ];

  private tickets: TicketRecord[] = [
    {
      ticketId: 'CS1024',
      type: 'reminder',
      status: 'open',
      orderNo: 'DH24042718',
      userId: 14864221,
      content: '护航订单超过9分钟未开单',
      attachments: [],
      createdAt: this.minutesAgo(78),
    },
    {
      ticketId: 'RF2041',
      type: 'refund',
      status: 'processing',
      orderNo: 'ZB24042607',
      userId: 14863914,
      content: '装备订单申请退款，需确认是否已出库',
      attachments: [],
      createdAt: this.minutesAgo(150),
      operatorNote: '已联系仓库确认发货状态',
    },
  ];

  private partnerApplications: PartnerApplicationRecord[] = [
    {
      applicationId: 'PA1001',
      status: 'pending',
      userId: 14864083,
      name: '9100小木',
      specialty: '地铁护航、语音陪玩',
      note: '晚间可接单，段位稳定',
      contact: 'wx9100xiaomu',
      createdAt: this.minutesAgo(320),
    },
  ];

  private readonly businessLeads: BusinessLeadRecord[] = [];

  private refunds: RefundRecord[] = [
    {
      refundId: 'R1001',
      refundNo: 'RF20260428001',
      orderNo: 'ZB24042607',
      orderType: 'gear',
      status: 'pending',
      refundAmount: '199.00',
      reason: '仓库确认未发货',
      createdAt: this.minutesAgo(140),
    },
  ];

  private settlements: SettlementRecord[] = [
    {
      settlementId: 'SET1001',
      settlementNo: 'SET20260428001',
      talentId: 'xiaoli',
      talentName: '优质陪玩小梨',
      amount: '1480.00',
      status: 'pending',
      createdAt: this.minutesAgo(520),
    },
    {
      settlementId: 'SET1002',
      settlementNo: 'SET20260428002',
      talentId: 'xiaomu',
      talentName: '9100小木',
      amount: '920.00',
      status: 'pending',
      createdAt: this.minutesAgo(480),
    },
  ];

  private withdrawals: WithdrawalRecord[] = [
    {
      withdrawalId: 'WD1001',
      withdrawalNo: 'WD20260428001',
      talentId: 'baicheng',
      talentName: '9100白城',
      amount: '2360.00',
      status: 'pending',
      createdAt: this.minutesAgo(400),
      comment: '投诉单未结，需人工确认',
    },
  ];

  private readonly roles: RoleRecord[] = [
    { roleId: 1, roleCode: 'super_admin', roleName: '超级管理员' },
    { roleId: 2, roleCode: 'operator', roleName: '运营' },
    { roleId: 3, roleCode: 'cs', roleName: '客服' },
    { roleId: 4, roleCode: 'finance', roleName: '财务' },
  ];

  private permissions = [
    {
      module: 'orders',
      permissions: [
        'orders.read',
        'orders.assign',
        'orders.cancel',
        'orders.refund',
      ],
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
  ];

  private sequence = 2000;

  findUser(userId: number): AppUser | undefined {
    return this.users.find((item) => item.userId === userId);
  }

  findAdmin(adminId: number): AdminRecord | undefined {
    return this.adminUsers.find((item) => item.adminId === adminId);
  }

  getBootstrap() {
    return {
      banners: [
        {
          bannerId: 1,
          title: '翻车三把 直接退款',
          subtitle: '平台服务保障 · 安全放心',
          image: 'https://cdn.example.com/banner/home-1.png',
          linkType: 'section',
          linkValue: 'subway',
        },
      ],
      sections: [
        { key: 'subway', title: '地铁护航' },
        { key: 'gear', title: '装备专区' },
        { key: 'boost', title: '极速上分' },
        { key: 'more', title: '更多' },
      ],
      hotProducts: this.products.slice(0, 3).map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        tag: item.tag,
        cover: item.cover,
      })),
      notice: '平台人员不会主动私信您，谨防被骗！未成年人禁止下单。',
    };
  }

  getHotKeywords() {
    return {
      keywords: ['地铁护航', '极速上分', '雪隼', '女神陪玩'],
    };
  }

  search(keyword: string) {
    const normalized = keyword.trim();
    const products = this.products.filter((item) =>
      [item.title, item.tag, item.badge].some((text) => text.includes(normalized)),
    );
    const talents = this.talents.filter((item) =>
      [item.name, item.typeLabel, item.voiceStyle, item.serviceLabel, ...item.tags].some(
        (text) => text.includes(normalized),
      ),
    );

    return {
      products: products.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        tag: item.tag,
        cover: item.cover,
      })),
      talents: talents.map((item) => ({
        talentId: item.talentId,
        name: item.name,
        price: item.price,
        typeLabel: item.typeLabel,
        serviceLabel: item.serviceLabel,
      })),
    };
  }

  getSection(sectionKey: string) {
    const sections = {
      subway: {
        sectionKey: 'subway',
        title: '地铁护航专区',
        subtitle: '低门槛上车，优先派单，适合稳定走量。',
        theme: 'linear-gradient(135deg, #1d3557, #457b9d)',
        quickLinks: [
          { label: '热卖护航', linkType: 'product', linkValue: 'subway-escort' },
          { label: '联系客服', linkType: 'support', linkValue: 'support' },
        ],
        products: this.products.filter((item) => item.category === 'subway'),
      },
      gear: {
        sectionKey: 'gear',
        title: '装备专区',
        subtitle: '设备、皮肤、资源类服务集中展示。',
        theme: 'linear-gradient(135deg, #e76f51, #f4a261)',
        quickLinks: [
          { label: '高配套装', linkType: 'product', linkValue: 'gear-premium' },
          { label: '商务合作', linkType: 'business', linkValue: 'business' },
        ],
        products: this.products.filter((item) => item.category === 'gear'),
      },
      boost: {
        sectionKey: 'boost',
        title: '极速上分',
        subtitle: '高效率冲刺方案，适合赛季末和活动期。',
        theme: 'linear-gradient(135deg, #264653, #2a9d8f)',
        quickLinks: [
          { label: '挑战单', linkType: 'product', linkValue: 'crash-challenge' },
        ],
        products: this.products.filter((item) => item.category === 'boost'),
      },
      more: {
        sectionKey: 'more',
        title: '更多服务',
        subtitle: '人工服务、资源代购、陪玩预约都在这里。',
        theme: 'linear-gradient(135deg, #6d597a, #b56576)',
        quickLinks: [
          { label: '人工服务', linkType: 'product', linkValue: 'snowfalcon' },
        ],
        products: this.products.filter((item) => item.category === 'manual'),
      },
    } as const;

    return sections[sectionKey as keyof typeof sections] ?? sections.subway;
  }

  listProducts(filters: { category?: string; type?: string; keyword?: string }) {
    return this.products.filter((item) => {
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      if (filters.type && item.type !== filters.type) {
        return false;
      }
      if (filters.keyword) {
        const keyword = filters.keyword.trim();
        return [item.title, item.tag, item.badge].some((text) => text.includes(keyword));
      }
      return true;
    });
  }

  getProduct(productId: string) {
    const product = this.products.find((item) => item.productId === productId);
    if (!product) {
      throw new NotFoundException('product not found');
    }
    return product;
  }

  listTalents(filters: { genderTag?: string; status?: string }) {
    return this.talents.filter((item) => {
      if (filters.genderTag === 'male' && item.typeLabel !== '男神') {
        return false;
      }
      if (filters.genderTag === 'female' && item.typeLabel !== '女神') {
        return false;
      }
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      return true;
    });
  }

  getTalent(talentId: string) {
    const talent = this.talents.find((item) => item.talentId === talentId);
    if (!talent) {
      throw new NotFoundException('talent not found');
    }
    return talent;
  }

  listClubs() {
    return { list: this.clubs };
  }

  getCurrentUser(userId: number) {
    const user = this.findUser(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return {
      userId: user.userId,
      nickname: user.nickname,
      avatar: user.avatar,
      uid: user.uid,
      mobileMasked: user.mobileMasked,
    };
  }

  createOrder(
    userId: number,
    payload: {
      orderType?: string;
      productId?: string;
      talentId?: string;
      remark?: string;
      scheduleAt?: string;
    },
  ) {
    let title = '未命名订单';
    let amount = '0.00';
    let orderType: OrderType = 'escort';
    let productId: string | null = null;
    let talentId: string | null = null;

    if (payload.productId) {
      const product = this.getProduct(payload.productId);
      title = product.title;
      amount = product.price;
      orderType = product.type;
      productId = product.productId;
    }

    if (payload.talentId) {
      const talent = this.getTalent(payload.talentId);
      title = `${talent.name} 专属陪玩`;
      amount = talent.price;
      orderType = 'playmate';
      talentId = talent.talentId;
    }

    const orderNo = this.generateOrderNo(orderType);
    const createdAt = new Date().toISOString();
    const order: OrderRecord = {
      orderNo,
      orderType,
      status: 'pending_payment',
      title,
      amount,
      paymentMethod: null,
      userId,
      talentId,
      productId,
      createdAt,
      paidAt: null,
      completedAt: null,
      remark: payload.remark ?? payload.scheduleAt ?? null,
      urgent: false,
      csNotes: [],
      serviceTimeline: [
        {
          status: 'pending_payment',
          time: createdAt,
        },
      ],
    };

    this.orders.unshift(order);

    return {
      orderNo: order.orderNo,
      status: order.status,
      amount: order.amount,
    };
  }

  payOrder(userId: number, orderNo: string, paymentMethod: PaymentMethod) {
    const order = this.getOrderForUser(userId, orderNo);
    const paidAt = new Date().toISOString();
    order.paymentMethod = paymentMethod;
    order.paidAt = paidAt;
    order.status = order.orderType === 'gear' ? 'pending_shipment' : 'pending_assign';
    order.serviceTimeline.push({
      status: order.status,
      time: paidAt,
    });

    return {
      orderNo: order.orderNo,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paidAt,
    };
  }

  listUserOrders(userId: number, filters: { orderType?: string; status?: string }) {
    return this.orders.filter((item) => {
      if (item.userId !== userId) {
        return false;
      }
      if (filters.orderType && item.orderType !== filters.orderType) {
        return false;
      }
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      return true;
    });
  }

  getOrderForUser(userId: number, orderNo: string) {
    const order = this.orders.find(
      (item) => item.userId === userId && item.orderNo === orderNo,
    );
    if (!order) {
      throw new NotFoundException('order not found');
    }
    return order;
  }

  listSupportFaqs() {
    return { list: this.supportFaqs };
  }

  createTicket(
    userId: number,
    payload: {
      type?: string;
      orderNo?: string;
      content?: string;
      attachments?: string[];
    },
  ) {
    const record: TicketRecord = {
      ticketId: `CS${this.bumpSequence()}`,
      type: (payload.type as TicketType) ?? 'consulting',
      status: 'open',
      orderNo: payload.orderNo ?? null,
      userId,
      content: payload.content ?? '',
      attachments: payload.attachments ?? [],
      createdAt: new Date().toISOString(),
    };
    this.tickets.unshift(record);
    return record;
  }

  createPartnerApplication(
    userId: number,
    payload: { name?: string; specialty?: string; note?: string; contact?: string },
  ) {
    const record: PartnerApplicationRecord = {
      applicationId: `PA${this.bumpSequence()}`,
      status: 'pending',
      userId,
      name: payload.name ?? '',
      specialty: payload.specialty ?? '',
      note: payload.note ?? '',
      contact: payload.contact ?? '',
      createdAt: new Date().toISOString(),
    };
    this.partnerApplications.unshift(record);
    return record;
  }

  createBusinessLead(payload: {
    companyName?: string;
    contact?: string;
    note?: string;
  }) {
    const lead: BusinessLeadRecord = {
      leadId: `BL${this.bumpSequence()}`,
      companyName: payload.companyName ?? '',
      contact: payload.contact ?? '',
      note: payload.note ?? '',
      createdAt: new Date().toISOString(),
    };
    this.businessLeads.unshift(lead);
    return lead;
  }

  adminLogin(
    account: string,
    password: string,
    fallbackAccount: string,
    fallbackPassword: string,
  ) {
    const admin = this.adminUsers.find((item) => item.account === account);
    if (admin && admin.password === password) {
      return admin;
    }

    if (account === fallbackAccount && password === fallbackPassword) {
      return {
        adminId: 1,
        account,
        password,
        name: '系统管理员',
        roleCode: 'super_admin',
      } as AdminRecord;
    }

    return null;
  }

  getDashboardOverview() {
    return {
      todayRevenue: '82460.00',
      activeOrders: 326,
      onlineTalents: this.talents.filter((item) => item.status === 'online').length,
      pendingTickets: this.tickets.filter((item) => item.status === 'open').length,
      revenueTrend: [
        { date: '2026-04-22', amount: '52000.00' },
        { date: '2026-04-23', amount: '58000.00' },
        { date: '2026-04-24', amount: '65000.00' },
        { date: '2026-04-25', amount: '62000.00' },
        { date: '2026-04-26', amount: '77000.00' },
        { date: '2026-04-27', amount: '85000.00' },
        { date: '2026-04-28', amount: '82460.00' },
      ],
      alerts: [
        {
          type: 'order_timeout',
          title: '超时未接单',
          content: '护航订单 6 单已超过 8 分钟无人响应',
        },
        {
          type: 'refund_review',
          title: '退款审核',
          content: '装备订单 3 单等待人工确认发货状态',
        },
      ],
    };
  }

  listUsers(filters: { keyword?: string; status?: string; tag?: string }) {
    return this.users.filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.tag && !item.tags.includes(filters.tag)) {
        return false;
      }
      if (filters.keyword) {
        const keyword = filters.keyword.trim();
        return [item.nickname, item.uid, item.mobileMasked].some((text) =>
          text.includes(keyword),
        );
      }
      return true;
    });
  }

  getUserDetail(userId: number) {
    const user = this.findUser(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return {
      user: {
        userId: user.userId,
        nickname: user.nickname,
        status: user.status,
        registerAt: user.registerAt,
      },
      stats: {
        orderCount: user.orderCount,
        totalSpend: user.totalSpend,
        refundCount: user.refundCount,
      },
      notes: user.notes,
      recentOrders: this.orders
        .filter((item) => item.userId === userId)
        .slice(0, 5)
        .map((item) => ({
          orderNo: item.orderNo,
          title: item.title,
          amount: item.amount,
          status: item.status,
        })),
    };
  }

  updateUserStatus(userId: number, status: UserStatus, reason?: string) {
    const user = this.findUser(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    user.status = status;
    if (reason) {
      user.notes.unshift({
        operator: '系统管理员',
        content: `状态更新为 ${status}: ${reason}`,
        createdAt: new Date().toISOString(),
      });
    }
    return user;
  }

  addUserNote(userId: number, content: string) {
    const user = this.findUser(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const note = {
      operator: '系统管理员',
      content,
      createdAt: new Date().toISOString(),
    };
    user.notes.unshift(note);
    return note;
  }

  listOrders(filters: {
    orderType?: string;
    status?: string;
    keyword?: string;
    isUrgent?: string;
  }) {
    return this.orders.filter((item) => {
      if (filters.orderType && item.orderType !== filters.orderType) {
        return false;
      }
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.isUrgent && String(item.urgent) !== filters.isUrgent) {
        return false;
      }
      if (filters.keyword) {
        const keyword = filters.keyword.trim();
        const user = this.findUser(item.userId);
        return [item.orderNo, item.title, user?.nickname ?? ''].some((text) =>
          text.includes(keyword),
        );
      }
      return true;
    });
  }

  getOrderDetail(orderNo: string) {
    const order = this.orders.find((item) => item.orderNo === orderNo);
    if (!order) {
      throw new NotFoundException('order not found');
    }
    const user = this.findUser(order.userId);
    const talent = order.talentId ? this.getTalent(order.talentId) : null;
    return {
      ...order,
      user: user
        ? {
            userId: user.userId,
            nickname: user.nickname,
          }
        : null,
      talent: talent
        ? {
            talentId: talent.talentId,
            name: talent.name,
          }
        : null,
    };
  }

  assignOrder(orderNo: string, talentId: string, operatorNote?: string) {
    const order = this.getOrderDetail(orderNo) as OrderRecord;
    order.talentId = talentId;
    order.status = 'assigned';
    order.csNotes.unshift({
      operator: '系统管理员',
      content: operatorNote ?? '人工手动派单',
      createdAt: new Date().toISOString(),
    });
    order.serviceTimeline.push({
      status: 'assigned',
      time: new Date().toISOString(),
    });
    return order;
  }

  cancelOrder(orderNo: string, reason: string) {
    const order = this.getOrderDetail(orderNo) as OrderRecord;
    order.status = 'cancelled';
    order.csNotes.unshift({
      operator: '系统管理员',
      content: `取消订单: ${reason}`,
      createdAt: new Date().toISOString(),
    });
    order.serviceTimeline.push({
      status: 'cancelled',
      time: new Date().toISOString(),
    });
    return order;
  }

  refundOrder(orderNo: string, refundAmount: string, reason: string) {
    const order = this.getOrderDetail(orderNo) as OrderRecord;
    order.status = 'refund_pending';
    order.serviceTimeline.push({
      status: 'refund_pending',
      time: new Date().toISOString(),
    });
    const refund: RefundRecord = {
      refundId: `R${this.bumpSequence()}`,
      refundNo: `RF${Date.now()}`,
      orderNo,
      orderType: order.orderType,
      status: 'pending',
      refundAmount,
      reason,
      createdAt: new Date().toISOString(),
    };
    this.refunds.unshift(refund);
    return refund;
  }

  shipOrder(orderNo: string, company: string, trackingNo: string, operatorNote?: string) {
    const order = this.getOrderDetail(orderNo) as OrderRecord;
    order.status = 'shipped';
    order.shipment = {
      company,
      trackingNo,
      operatorNote,
    };
    order.serviceTimeline.push({
      status: 'shipped',
      time: new Date().toISOString(),
    });
    return order;
  }

  listServices(filters: { category?: string; status?: string; keyword?: string }) {
    return this.listProducts({
      category: filters.category,
      keyword: filters.keyword,
    }).filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      return true;
    });
  }

  createService(payload: Partial<ProductRecord>) {
    const title = payload.title ?? '未命名服务';
    const service: ProductRecord = {
      productId: this.slugify(title),
      title,
      category: payload.category ?? 'more',
      type: payload.type ?? 'escort',
      price: payload.price ?? '0.00',
      priceSuffix: payload.priceSuffix,
      tag: payload.tag ?? '',
      badge: payload.badge ?? '新服务',
      cover: payload.cover ?? 'https://cdn.example.com/product/default.png',
      status: payload.status ?? 'draft',
      intro: payload.intro ?? [],
      notice: payload.notice ?? [],
    };
    this.products.unshift(service);
    return service;
  }

  updateService(serviceId: string, payload: Partial<ProductRecord>) {
    const service = this.getProduct(serviceId);
    Object.assign(service, payload);
    return service;
  }

  updateServiceStatus(serviceId: string, status: ProductRecord['status']) {
    const service = this.getProduct(serviceId);
    service.status = status;
    return service;
  }

  listAdminTalents(filters: { status?: string; keyword?: string; tag?: string }) {
    return this.talents.filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.tag && !item.tags.includes(filters.tag)) {
        return false;
      }
      if (filters.keyword) {
        return [item.name, item.talentId].some((text) => text.includes(filters.keyword!));
      }
      return true;
    });
  }

  getAdminTalentDetail(talentId: string) {
    return this.getTalent(talentId);
  }

  updateTalentStatus(talentId: string, status: TalentStatus) {
    const talent = this.getTalent(talentId);
    talent.status = status;
    return talent;
  }

  listPartnerApplications(filters: { status?: string; keyword?: string }) {
    return this.partnerApplications.filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.keyword) {
        return [item.name, item.specialty].some((text) => text.includes(filters.keyword!));
      }
      return true;
    });
  }

  reviewPartnerApplication(applicationId: string, action: PartnerStatus, comment?: string) {
    const item = this.partnerApplications.find((record) => record.applicationId === applicationId);
    if (!item) {
      throw new NotFoundException('application not found');
    }
    item.status = action;
    item.reviewComment = comment;
    return item;
  }

  listTickets(filters: { type?: string; status?: string; keyword?: string }) {
    return this.tickets.filter((item) => {
      if (filters.type && item.type !== filters.type) {
        return false;
      }
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.keyword) {
        return [item.ticketId, item.orderNo ?? '', item.content].some((text) =>
          text.includes(filters.keyword!),
        );
      }
      return true;
    });
  }

  getTicket(ticketId: string) {
    const ticket = this.tickets.find((item) => item.ticketId === ticketId);
    if (!ticket) {
      throw new NotFoundException('ticket not found');
    }
    return ticket;
  }

  updateTicketStatus(ticketId: string, status: TicketStatus, operatorNote?: string) {
    const ticket = this.getTicket(ticketId);
    ticket.status = status;
    ticket.operatorNote = operatorNote;
    return ticket;
  }

  listRefunds(filters: { status?: string; orderType?: string }) {
    return this.refunds.filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.orderType && item.orderType !== filters.orderType) {
        return false;
      }
      return true;
    });
  }

  approveRefund(refundId: string, approvedAmount: string, comment?: string) {
    const refund = this.getRefund(refundId);
    refund.status = 'approved';
    refund.refundAmount = approvedAmount;
    refund.comment = comment;

    const order = this.orders.find((item) => item.orderNo === refund.orderNo);
    if (order) {
      order.status = 'refunded';
      order.serviceTimeline.push({
        status: 'refunded',
        time: new Date().toISOString(),
      });
    }

    return refund;
  }

  rejectRefund(refundId: string, reason: string) {
    const refund = this.getRefund(refundId);
    refund.status = 'rejected';
    refund.comment = reason;
    return refund;
  }

  getFinanceOverview() {
    const completedLike = this.orders.filter((item) => item.paymentMethod !== null);
    const todayIncome = completedLike
      .reduce((sum, item) => sum + Number(item.amount), 0)
      .toFixed(2);
    const todayRefund = this.refunds
      .filter((item) => item.status === 'pending' || item.status === 'approved')
      .reduce((sum, item) => sum + Number(item.refundAmount), 0)
      .toFixed(2);
    const pendingSettlement = this.settlements
      .filter((item) => item.status === 'pending')
      .reduce((sum, item) => sum + Number(item.amount), 0)
      .toFixed(2);

    return {
      todayIncome,
      todayRefund,
      pendingSettlement,
      grossProfit: (Number(todayIncome) * 0.301).toFixed(2),
    };
  }

  listSettlements(filters: { status?: string; talentId?: string }) {
    return this.settlements.filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.talentId && item.talentId !== filters.talentId) {
        return false;
      }
      return true;
    });
  }

  paySettlement(settlementId: string, paidAmount: string, paidAt?: string) {
    const settlement = this.getSettlement(settlementId);
    settlement.status = 'paid';
    settlement.amount = paidAmount;
    settlement.paidAt = paidAt ?? new Date().toISOString();
    return settlement;
  }

  listWithdrawals() {
    return this.withdrawals;
  }

  reviewWithdrawal(withdrawalId: string, action: WithdrawalStatus, comment?: string) {
    const withdrawal = this.getWithdrawal(withdrawalId);
    withdrawal.status = action;
    withdrawal.comment = comment;
    return withdrawal;
  }

  listRoles() {
    return { list: this.roles };
  }

  getPermissions() {
    return { modules: this.permissions };
  }

  updateRolePermissions(roleId: number, permissions: string[]) {
    const role = this.roles.find((item) => item.roleId === roleId);
    if (!role) {
      throw new NotFoundException('role not found');
    }
    this.permissions = [
      {
        module: role.roleCode,
        permissions,
      },
      ...this.permissions.filter((item) => item.module !== role.roleCode),
    ];
    return {
      roleId,
      permissions,
    };
  }

  private getRefund(refundId: string) {
    const refund = this.refunds.find((item) => item.refundId === refundId);
    if (!refund) {
      throw new NotFoundException('refund not found');
    }
    return refund;
  }

  private getSettlement(settlementId: string) {
    const settlement = this.settlements.find((item) => item.settlementId === settlementId);
    if (!settlement) {
      throw new NotFoundException('settlement not found');
    }
    return settlement;
  }

  private getWithdrawal(withdrawalId: string) {
    const withdrawal = this.withdrawals.find((item) => item.withdrawalId === withdrawalId);
    if (!withdrawal) {
      throw new NotFoundException('withdrawal not found');
    }
    return withdrawal;
  }

  private generateOrderNo(orderType: OrderType) {
    const prefix = orderType === 'escort' ? 'DH' : orderType === 'playmate' ? 'PW' : 'ZB';
    return `${prefix}${Date.now()}`;
  }

  private bumpSequence() {
    this.sequence += 1;
    return this.sequence;
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private minutesAgo(minutes: number) {
    return new Date(Date.now() - minutes * 60_000).toISOString();
  }
}

