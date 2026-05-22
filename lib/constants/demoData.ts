// Demo data lifted verbatim from the design handoff bundle
// (_design_handoff/project/playful/data.jsx). Used as fallback content
// for sections whose live backend tables aren't wired yet (hangouts, pros)
// or as placeholders when the listings table is empty.
//
// When live data is ready, replace at the section component level.

export type DemoProduct = {
  id: number
  title: string
  price: string
  origPrice: string
  region: string
  condition: string
  tags: string[]
  pickup: boolean
  badge?: string
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  { id: 1, title: '北欧布艺三人沙发', price: '€280', origPrice: '€899', region: 'Mitte · 1.2km', condition: '9 成新', tags: ['急出'], pickup: true, badge: 'MOVE' },
  { id: 2, title: '德龙全自动咖啡机', price: '€85', origPrice: '€349', region: 'Prenzlauer · 0.8km', condition: '8 成新', tags: ['可自取'], pickup: true },
  { id: 3, title: 'Cube 城市通勤自行车', price: '€120', origPrice: '€420', region: 'Kreuzberg · 2.1km', condition: '7 成新', tags: ['可议价'], pickup: true },
  { id: 4, title: '原木餐椅 × 2', price: '€40', origPrice: '€160', region: 'Charlottenb · 3.4km', condition: '9 成新', tags: ['可自取'], pickup: true },
  { id: 5, title: '黄铜复古台灯', price: '€15', origPrice: '€60', region: 'Mitte · 0.5km', condition: '9 成新', tags: ['急出'], pickup: true },
  { id: 6, title: 'MacBook Pro 14 M1 Pro', price: '€450', origPrice: '€2199', region: 'Neukölln · 4.0km', condition: '95 新', tags: ['保修内'], pickup: false, badge: 'HOT' },
  { id: 7, title: 'Stokke 婴儿推车', price: '€90', origPrice: '€399', region: 'Wedding · 2.7km', condition: '8 成新', tags: ['可自取'], pickup: true },
  { id: 8, title: '西门子滚筒洗衣机', price: '€160', origPrice: '€599', region: 'Friedrichs · 5.2km', condition: '7 成新', tags: ['搬家急出'], pickup: false },
]

export type DemoMoving = {
  id: string
  title: string
  desc: string
  price: string
  items: number
  region: string
}

export const DEMO_MOVING: DemoMoving[] = [
  { id: 'm1', title: '整屋打包 · 1B1B 公寓清空', desc: '沙发 + 床 + 餐桌 + 锅碗瓢盆，一次拎走', price: '€680', items: 38, region: 'Mitte' },
  { id: 'm2', title: '毕业季清仓 · 学生宿舍', desc: '桌椅 + 学习灯 + 自行车 + 书籍', price: '€220', items: 14, region: 'Charlottenburg' },
  { id: 'm3', title: '回国前甩卖 · 全屋家电', desc: '洗衣机 + 冰箱 + 微波炉 + 吸尘器', price: '€450', items: 9, region: 'Neukölln' },
]

export type DemoFree = {
  id: string
  title: string
  region: string
  from: string
}

export const DEMO_FREE: DemoFree[] = [
  { id: 'f1', title: '宜家书架 · 自取免费', region: 'Mitte · 1.2km', from: 'Linda' },
  { id: 'f2', title: '搬家剩下的厨房用品', region: 'Prenzlauer · 0.5km', from: 'Wei' },
  { id: 'f3', title: '孩子穿小的冬衣 3 件', region: 'Wedding · 2.0km', from: 'Mama Yu' },
  { id: 'f4', title: '中文书 20 本随便拿', region: 'Kreuzberg · 3.1km', from: '小杨' },
]

export type DemoHangout = {
  id: string
  title: string
  when: string
  spots: string
  host: string
  region: string
  tag: string
}

export const DEMO_HANGOUTS: DemoHangout[] = [
  { id: 'h1', title: '周六篮球局 · 中央公园', when: '周六 11:00', spots: '2/8 缺', host: 'Tom', region: 'Berlin Mitte · 1.2km', tag: '球友' },
  { id: 'h2', title: '德语 B2 学习搭子', when: '每周二 19:00', spots: '1/2 缺', host: 'Yuki', region: 'München 图书馆', tag: '学习' },
  { id: 'h3', title: '周日中式火锅局', when: '周日 18:30', spots: '3/6 缺', host: '小满', region: 'Frankfurt 市中心', tag: '饭搭子' },
  { id: 'h4', title: '王者荣耀车队 · 缺中单', when: '每晚 21:00', spots: '1/5 缺', host: 'A98', region: '线上 · 国服', tag: '游戏' },
  { id: 'h5', title: '周六徒步 · 勃兰登堡山径', when: '周六 9:00', spots: '已 4 人', host: 'Linda', region: 'Berlin 周边 30km', tag: '户外' },
  { id: 'h6', title: '周日演唱会拼车 · 汉堡场', when: '周日 14:00', spots: '1/4 缺', host: 'Echo', region: 'Berlin → Hamburg', tag: '拼车' },
]

export type DemoPro = {
  id: string
  name: string
  role: string
  region: string
  rate: string
  years: number
  jobs: number
  badge: string
  avatar: string
}

export const DEMO_PROS: DemoPro[] = [
  { id: 'pro1', name: 'Linda 林老师', role: '法定翻译 · 中德', region: 'Berlin Mitte', rate: '€60/小时', years: 8, jobs: 320, badge: '宣誓翻译', avatar: 'L' },
  { id: 'pro2', name: '王师傅', role: '搬家 · 整屋打包', region: 'Berlin · 全城', rate: '€280 起', years: 12, jobs: 540, badge: '整屋打包', avatar: '王' },
  { id: 'pro3', name: '陈师傅', role: '家电维修 · 水电', region: 'Munich · 5km', rate: '€45/次', years: 9, jobs: 270, badge: '持证电工', avatar: '陈' },
  { id: 'pro4', name: 'Studio 小满', role: '装修设计 · 软装', region: 'Hamburg', rate: '€80/小时', years: 6, jobs: 88, badge: '案例 30+', avatar: 'M' },
  { id: 'pro5', name: 'Anna 月嫂', role: '母婴护理 · 产后', region: 'Frankfurt · 上门', rate: '€2800/月', years: 7, jobs: 42, badge: '高级母婴', avatar: 'A' },
  { id: 'pro6', name: 'Dr. 周', role: '中医 · 针灸推拿', region: 'Köln · 诊所', rate: '€65/次', years: 15, jobs: 1200, badge: '国家执医', avatar: '周' },
]

export const SAFETY_STEPS = [
  { n: '01', t: '站内沟通', d: '不私加微信 · IM 谈成色 / 服务 / 活动细节 · 聊天记录留痕可查' },
  { n: '02', t: '同城见面', d: '自取 / 师傅上门 / 搭子局子——邻里之间公共场所交付' },
  { n: '03', t: '双向评价', d: '买卖 / 服务 / 搭子局子都可互评 · 实名社区沉淀长期信任' },
] as const

export const TRUST_ITEMS = [
  { t: '实名邻里', d: '海外华人 · 同城见面 · 双向评价' },
  { t: '平台认证', d: '师傅 · 服务 · 资质全部审核' },
  { t: '同城见面', d: '自取省运费 · 公共场所交付' },
  { t: '站内 IM', d: '聊天留痕 · 举报通道 · 客服 24h' },
] as const
