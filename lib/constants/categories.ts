// 分类清单 —— 全站单一数据源。
// 发布选择器 / 浏览筛选 / AI 识别 / 验证(zod enum) 全部从这里读取，改这里即可全站生效。
//
// 设计：参考 Willhaben 二手主干 + 针对(奥地利/欧洲)华人留学生高频需求细化。
// ★ = 为留学生新增的分类(合租厨具、教材资料、出行行李、卡券转租等痛点)。
//
// 重要：旧 id 一律保留(furniture/appliance/digital/bike/baby/books/fashion/life/
// moving/free/other)，已发布商品的 category 值不变 → 零数据迁移。只新增 + 微调中文标签。
export const CATEGORIES = [
  { id: 'furniture', label: '家具', icon: '🛋️' },
  { id: 'appliance', label: '家电', icon: '🔌' },
  { id: 'kitchen', label: '厨房餐厨', icon: '🍳' }, // ★ 锅具/餐具/电饭煲/小家电 — 留学生超高频
  { id: 'digital', label: '数码电子', icon: '📱' }, // 手机/平板/相机/耳机/游戏机
  { id: 'computer', label: '电脑办公', icon: '💻' }, // ★ 笔记本/显示器/键鼠/打印机
  { id: 'bike', label: '自行车·出行', icon: '🚲' }, // 自行车/滑板车/行李箱 — 出行神器
  { id: 'study', label: '教材·学习', icon: '📚' }, // ★ 教材/考试资料/文具/计算器
  { id: 'fashion', label: '服饰鞋包', icon: '👜' },
  { id: 'life', label: '家居日用', icon: '🧺' }, // 床品家纺/收纳/装饰/清洁
  { id: 'beauty', label: '美妆个护', icon: '💄' }, // ★ 美妆/护肤/个护小电
  { id: 'sports', label: '运动户外', icon: '⚽' }, // ★ 健身器材/滑雪/球类/露营
  { id: 'music', label: '乐器', icon: '🎸' }, // ★ 吉他/键盘/管弦
  { id: 'books', label: '图书·游戏·影音', icon: '🎮' }, // 中文书/小说/游戏卡带/影碟
  { id: 'baby', label: '母婴', icon: '🍼' },
  { id: 'tickets', label: '票务·卡券', icon: '🎫' }, // ★ 健身卡/演唱会/火车票/礼品卡转让
  { id: 'free', label: '免费送', icon: '🎁' },
  { id: 'moving', label: '搬家甩卖', icon: '📦' },
  { id: 'other', label: '其他', icon: '✨' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
)

// 首页分类网格展示的「精选高频」品类(留学生最常逛的)。
// free/moving 已在导航和独立页有入口、other 太泛 → 不放首页，首页末尾用「全部」兜底。
const HOME_CATEGORY_IDS = [
  'furniture',
  'appliance',
  'kitchen',
  'digital',
  'computer',
  'bike',
  'study',
  'fashion',
  'sports',
] as const

export const HOME_CATEGORIES = HOME_CATEGORY_IDS.map(
  (id) => CATEGORIES.find((c) => c.id === id)!,
)
