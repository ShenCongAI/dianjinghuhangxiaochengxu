import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ====== Banners ======
  await prisma.banner.deleteMany().catch(() => {});
  await prisma.banner.createMany({
    data: [
      {
        title: '翻车三把 直接退款',
        subtitle: '平台服务保障 · 安全放心',
        image: 'https://cdn.example.com/banner/home-1.png',
        linkType: 'section',
        linkValue: 'subway',
        sortOrder: 1,
        status: 'online',
      },
      {
        title: '新人首单立减5元',
        subtitle: '限时优惠 · 立即体验',
        image: 'https://cdn.example.com/banner/home-2.png',
        linkType: 'section',
        linkValue: 'boost',
        sortOrder: 2,
        status: 'online',
      },
    ],
  });

  // ====== Clubs ======
  await prisma.club.deleteMany().catch(() => {});
  await prisma.club.createMany({
    data: [
      {
        name: '9100雷霆分部',
        members: 128,
        focus: '地铁护航 / 车队排位',
        incomeText: '昨日成交 ¥8420',
        desc: '全天在线车队，适合想做护航走量和车队稳定接单的成员。',
        status: 'online',
      },
      {
        name: '雪隼精英俱乐部',
        members: 76,
        focus: '人工服务 / 高段位订单',
        incomeText: '昨日成交 ¥5160',
        desc: '主打高段位人工服务，审核标准更严格。',
        status: 'online',
      },
    ],
  });

  // ====== FAQs ======
  await prisma.fAQ.deleteMany().catch(() => {});
  await prisma.fAQ.createMany({
    data: [
      {
        question: '下单后多久会有人接单？',
        answer: '通常 5 分钟内会由系统分配接单人员。高峰时段若超过 15 分钟仍无人接单，可申请退款。',
        sortOrder: 1,
        status: 'online',
      },
      {
        question: '装备类订单什么时候发货？',
        answer: '现货订单一般当日处理，晚间订单次日优先发货。',
        sortOrder: 2,
        status: 'online',
      },
      {
        question: '如何申请成为陪玩？',
        answer: '在"我的"页面点击"申请成为陪玩"，填写相关信息后等待平台审核。',
        sortOrder: 3,
        status: 'online',
      },
    ],
  });

  // ====== Users ======
  await prisma.user.deleteMany().catch(() => {});
  const passwordHash = await bcrypt.hash('123456', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 14864083,
        nickname: '9100用户_8848',
        avatar: 'https://cdn.example.com/avatar/14864083.png',
        mobile: '13812348811',
        password: passwordHash,
        status: 'normal',
        totalSpend: 3820.00,
        registerAt: new Date('2026-03-02T20:00:00+08:00'),
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        id: 14864221,
        nickname: '地铁冲榜小周',
        avatar: 'https://cdn.example.com/avatar/14864221.png',
        mobile: '13612342277',
        password: passwordHash,
        status: 'normal',
        totalSpend: 680.00,
        registerAt: new Date('2026-03-15T10:00:00+08:00'),
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        id: 14863914,
        nickname: '装备采购小南',
        avatar: 'https://cdn.example.com/avatar/14863914.png',
        mobile: '13912344400',
        password: passwordHash,
        status: 'observing',
        totalSpend: 1560.00,
        registerAt: new Date('2026-01-10T08:00:00+08:00'),
        lastLoginAt: new Date(),
      },
    }),
  ]);

  // ====== User Notes ======
  await prisma.userNote.createMany({
    data: [
      {
        content: '接受客服推荐，遇到接单慢会立即催单。',
        operator: '客服A',
        userId: 14864083,
      },
      {
        content: '售后沟通敏感，需保留完整发货证据。',
        operator: '客服B',
        userId: 14863914,
      },
    ],
  });

  // ====== Products ======
  await prisma.product.deleteMany().catch(() => {});
  await prisma.product.createMany({
    data: [
      {
        id: 'subway-escort',
        title: '地铁护航 300W-1000W',
        category: 'subway',
        orderType: 'escort',
        price: 9.90,
        priceSuffix: '起',
        tag: '人工技术保障 · 纯手工',
        badge: '护航爆款',
        cover: 'https://cdn.example.com/product/subway-escort.png',
        status: 'online',
        introJson: JSON.stringify(['纯手工护航，效率优先。', '支持全程截图反馈。', '翻车按规则补偿。']),
        noticeJson: JSON.stringify(['账号需可正常登录。', '禁止私下转账。']),
      },
      {
        id: 'crash-challenge',
        title: '进阶翻车挑战单',
        category: 'boost',
        orderType: 'escort',
        price: 32.00,
        priceSuffix: '起',
        tag: '保底500W · 翻车包赔',
        badge: '极速上分',
        cover: 'https://cdn.example.com/product/crash-challenge.png',
        status: 'online',
        introJson: JSON.stringify(['适合冲刺期高强度订单。', '支持局后复盘。', '按目标段位拆分执行。']),
        noticeJson: JSON.stringify(['高峰期可能排队。', '请先确认目标分段。']),
      },
      {
        id: 'snowfalcon',
        title: '人工服务-雪隼',
        category: 'manual',
        orderType: 'escort',
        price: 28.80,
        tag: '王牌段位 · 包满意',
        badge: '人工服务',
        cover: 'https://cdn.example.com/product/snowfalcon.png',
        status: 'online',
        introJson: JSON.stringify(['专属接单池，主打稳定和响应。', '客服可根据偏好匹配人员。', '开局前可换人。']),
        noticeJson: JSON.stringify(['若需指定风格请备注。', '默认安排最快可接单人员。']),
      },
      {
        id: 'gear-premium',
        title: '高阶电竞装备组合',
        category: 'gear',
        orderType: 'gear',
        price: 199.00,
        tag: '高阶组合 · 包邮到家',
        badge: '高配专区',
        cover: 'https://cdn.example.com/product/gear-premium.png',
        status: 'online',
        introJson: JSON.stringify(['精选电竞配件组合。', '发货前支持视频验货。', '适合工作室和重度玩家。']),
        noticeJson: JSON.stringify(['发货后不可更改地址。', '定制类商品不支持无理由退换。']),
      },
    ],
  });

  // ====== Talents ======
  await prisma.talent.deleteMany().catch(() => {});
  await prisma.talent.createMany({
    data: [
      {
        id: 'xiaomu',
        name: '9100小木',
        typeLabel: '男神',
        status: 'online',
        price: 29.90,
        score: 4.9,
        ordersCount: 1200,
        voiceStyle: '低音稳聊',
        serviceLabel: '5分钟响应',
        tagsJson: JSON.stringify(['地铁护航', '稳单', '秒回']),
        bio: '偏稳健护航风格，适合低失误陪跑和长时间连单。',
        completionRate: 98.0,
        avgResponseMinutes: 2.3,
        todayOrders: 8,
        pendingSettlement: 920.00,
        complaints: 0,
        cover: 'https://cdn.example.com/talent/xiaomu.png',
      },
      {
        id: 'xiaoli',
        name: '优质陪玩小梨',
        typeLabel: '女神',
        status: 'busy',
        price: 39.90,
        score: 5.0,
        ordersCount: 2300,
        voiceStyle: '甜妹音',
        serviceLabel: '语音陪玩',
        tagsJson: JSON.stringify(['女神陪玩', '高情绪价值', '会唱歌']),
        bio: '互动型风格，擅长语音陪玩和娱乐局带气氛，适合高复购用户。',
        completionRate: 97.0,
        avgResponseMinutes: 4.1,
        todayOrders: 5,
        pendingSettlement: 1480.00,
        complaints: 0,
        cover: 'https://cdn.example.com/talent/xiaoli.png',
      },
      {
        id: 'baicheng',
        name: '9100白城',
        typeLabel: '男神',
        status: 'reviewing',
        price: 42.00,
        score: 4.9,
        ordersCount: 1600,
        voiceStyle: '高冷指挥',
        serviceLabel: '冲榜保段',
        tagsJson: JSON.stringify(['高分段', '指挥型', '保段']),
        bio: '高分段指挥型接单人员，适合冲榜和保段订单。',
        completionRate: 96.4,
        avgResponseMinutes: 3.4,
        todayOrders: 3,
        pendingSettlement: 2360.00,
        complaints: 1,
        cover: 'https://cdn.example.com/talent/baicheng.png',
      },
      {
        id: 'xiaoyu',
        name: '小雨陪玩',
        typeLabel: '女神',
        status: 'online',
        price: 35.00,
        score: 4.8,
        ordersCount: 980,
        voiceStyle: '温柔治愈',
        serviceLabel: '娱乐陪玩',
        tagsJson: JSON.stringify(['温柔', '娱乐局', '新手友好']),
        bio: '温柔治愈型，擅长带新手和娱乐局，耐心细致。',
        completionRate: 99.0,
        avgResponseMinutes: 1.8,
        todayOrders: 12,
        pendingSettlement: 560.00,
        complaints: 0,
        cover: 'https://cdn.example.com/talent/xiaoyu.png',
      },
      {
        id: 'dawang',
        name: '大王电竞',
        typeLabel: '男神',
        status: 'online',
        price: 49.90,
        score: 5.0,
        ordersCount: 2800,
        voiceStyle: '激情解说',
        serviceLabel: '技术教学',
        tagsJson: JSON.stringify(['技术流', '教学', '复盘']),
        bio: '技术型大神，擅长教学和复盘，适合想提升技术的玩家。',
        completionRate: 97.5,
        avgResponseMinutes: 3.0,
        todayOrders: 6,
        pendingSettlement: 1890.00,
        complaints: 0,
        cover: 'https://cdn.example.com/talent/dawang.png',
      },
      {
        id: 'mengmeng',
        name: '萌萌酱',
        typeLabel: '女神',
        status: 'offline',
        price: 29.90,
        score: 4.7,
        ordersCount: 760,
        voiceStyle: '萝莉音',
        serviceLabel: '语音陪聊',
        tagsJson: JSON.stringify(['可爱', '语音', '社交']),
        bio: '可爱型陪玩，擅长活跃气氛和社交互动。',
        completionRate: 95.0,
        avgResponseMinutes: 5.2,
        todayOrders: 0,
        pendingSettlement: 320.00,
        complaints: 1,
        cover: 'https://cdn.example.com/talent/mengmeng.png',
      },
    ],
  });

  // ====== Orders ======
  await prisma.order.deleteMany().catch(() => {});
  await prisma.orderStatusLog.deleteMany().catch(() => {});

  const order1 = await prisma.order.create({
    data: {
      orderNo: 'DH24042718',
      orderType: 'escort',
      status: 'pending_assign',
      title: '地铁护航 300W-1000W',
      amount: 9.90,
      paymentMethod: 'wechat',
      remark: '希望5分钟内开单',
      createdAt: new Date(Date.now() - 90 * 60_000),
      paidAt: new Date(Date.now() - 89 * 60_000),
      userId: 14864221,
      productId: 'subway-escort',
    },
  });
  await prisma.orderStatusLog.createMany({
    data: [
      { orderId: order1.id, status: 'pending_payment', time: new Date(Date.now() - 90 * 60_000) },
      { orderId: order1.id, status: 'pending_assign', time: new Date(Date.now() - 89 * 60_000) },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      orderNo: 'PW24042709',
      orderType: 'playmate',
      status: 'assigned',
      title: '优质陪玩小梨 专属陪玩',
      amount: 39.90,
      paymentMethod: 'alipay',
      remark: '21:30上线，需连麦',
      createdAt: new Date(Date.now() - 126 * 60_000),
      paidAt: new Date(Date.now() - 124 * 60_000),
      userId: 14864083,
      talentId: 'xiaoli',
    },
  });
  await prisma.orderStatusLog.createMany({
    data: [
      { orderId: order2.id, status: 'pending_payment', time: new Date(Date.now() - 126 * 60_000) },
      { orderId: order2.id, status: 'pending_assign', time: new Date(Date.now() - 124 * 60_000) },
      { orderId: order2.id, status: 'assigned', time: new Date(Date.now() - 120 * 60_000) },
    ],
  });

  const order3 = await prisma.order.create({
    data: {
      orderNo: 'ZB24042607',
      orderType: 'gear',
      status: 'pending_shipment',
      title: '高阶电竞装备组合',
      amount: 199.00,
      paymentMethod: 'wechat',
      createdAt: new Date(Date.now() - 460 * 60_000),
      paidAt: new Date(Date.now() - 455 * 60_000),
      userId: 14863914,
      productId: 'gear-premium',
    },
  });
  await prisma.orderStatusLog.createMany({
    data: [
      { orderId: order3.id, status: 'pending_payment', time: new Date(Date.now() - 460 * 60_000) },
      { orderId: order3.id, status: 'pending_shipment', time: new Date(Date.now() - 455 * 60_000) },
    ],
  });

  // ====== Tickets ======
  await prisma.ticket.deleteMany().catch(() => {});
  await prisma.ticket.createMany({
    data: [
      {
        ticketNo: 'CS1024',
        type: 'reminder',
        status: 'open',
        content: '护航订单超过9分钟未开单',
        userId: 14864221,
        orderId: order1.id,
        createdAt: new Date(Date.now() - 78 * 60_000),
      },
      {
        ticketNo: 'RF2041',
        type: 'refund',
        status: 'processing',
        content: '装备订单申请退款，需确认是否已出库',
        userId: 14863914,
        orderId: order3.id,
        operatorNote: '已联系仓库确认发货状态',
        createdAt: new Date(Date.now() - 150 * 60_000),
      },
    ],
  });

  // ====== Refunds ======
  await prisma.refund.deleteMany().catch(() => {});
  await prisma.refund.create({
    data: {
      refundNo: 'RF20260428001',
      status: 'pending',
      refundAmount: 199.00,
      reason: '仓库确认未发货',
      orderId: order3.id,
      createdAt: new Date(Date.now() - 140 * 60_000),
    },
  });

  // ====== Partner Applications ======
  await prisma.partnerApplication.deleteMany().catch(() => {});
  await prisma.partnerApplication.create({
    data: {
      status: 'pending',
      name: '9100小木',
      specialty: '地铁护航、语音陪玩',
      note: '晚间可接单，段位稳定',
      contact: 'wx9100xiaomu',
      userId: 14864083,
      createdAt: new Date(Date.now() - 320 * 60_000),
    },
  });

  // ====== Settlements ======
  await prisma.settlement.deleteMany().catch(() => {});
  await prisma.settlement.createMany({
    data: [
      {
        settlementNo: 'SET20260428001',
        amount: 1480.00,
        status: 'pending',
        talentId: 'xiaoli',
        createdAt: new Date(Date.now() - 520 * 60_000),
      },
      {
        settlementNo: 'SET20260428002',
        amount: 920.00,
        status: 'pending',
        talentId: 'xiaomu',
        createdAt: new Date(Date.now() - 480 * 60_000),
      },
    ],
  });

  // ====== Withdrawals ======
  await prisma.withdrawal.deleteMany().catch(() => {});
  await prisma.withdrawal.create({
    data: {
      withdrawalNo: 'WD20260428001',
      amount: 2360.00,
      status: 'pending',
      comment: '投诉单未结，需人工确认',
      talentId: 'baicheng',
      createdAt: new Date(Date.now() - 400 * 60_000),
    },
  });

  // ====== Admin Users ======
  await prisma.adminUser.deleteMany().catch(() => {});
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.create({
    data: {
      id: 1,
      account: 'admin',
      passwordHash: adminPasswordHash,
      name: '系统管理员',
      roleCode: 'super_admin',
    },
  });

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
