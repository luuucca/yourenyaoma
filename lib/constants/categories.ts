// 分类清单 —— 全站单一数据源。
// 发布选择器 / 浏览筛选 / AI 识别 / 验证(zod enum) 全部从这里读取，改这里即可全站生效。
//
// 设计：参考 Willhaben 二手主干 + 针对(奥地利/欧洲)华人留学生高频需求细化。
// ★ = 为留学生新增的分类(合租厨具、教材资料、出行行李、卡券转租等痛点)。
//
// 重要：旧 id 一律保留(furniture/appliance/digital/bike/baby/books/fashion/life/
// moving/free/other)，已发布商品的 category 值不变 → 零数据迁移。只新增 + 微调中文标签。
//
// hint：给 AI 拍照识别看的「边界关键词」，帮它在语义相近的分类间做对选择
// (如 教材 vs 图书、厨房 vs 家电、电脑 vs 数码)。也是单一数据源 —— 加新类只写这里。
export const CATEGORIES = [
  { id: 'furniture', label: '家具', icon: '🛋️', hint: '床/沙发/桌椅/衣柜/床垫/书架等大件家具' },
  { id: 'appliance', label: '家电', icon: '🔌', hint: '冰箱/洗衣机/空调/电视/吸尘器等大中型电器' },
  { id: 'kitchen', label: '厨房餐厨', icon: '🍳', hint: '锅碗瓢盆/餐具/刀具/电饭煲/微波炉/咖啡机等厨房用品和小厨电' },
  { id: 'digital', label: '数码电子', icon: '📱', hint: '手机/平板/相机/耳机/智能手表/游戏机等数码设备' },
  { id: 'computer', label: '电脑办公', icon: '💻', hint: '笔记本/台式机/显示器/键盘鼠标/打印机等电脑办公设备' },
  { id: 'bike', label: '自行车·出行', icon: '🚲', hint: '自行车/电动滑板车/行李箱/出行装备' },
  { id: 'study', label: '教材·学习', icon: '📚', hint: '教材/课本/考试资料/词典/文具/计算器等学习用品' },
  { id: 'fashion', label: '服饰鞋包', icon: '👜', hint: '衣服/裤子/鞋/包/帽子/配饰/首饰' },
  { id: 'life', label: '家居日用', icon: '🧺', hint: '床品家纺/收纳/装饰/清洁/灯具等小件家居日用' },
  { id: 'beauty', label: '美妆个护', icon: '💄', hint: '化妆品/护肤品/香水/美妆工具/吹风机/剃须刀等个护' },
  { id: 'sports', label: '运动户外', icon: '⚽', hint: '健身器材/球类/滑雪滑板/瑜伽垫/露营等运动户外' },
  { id: 'music', label: '乐器', icon: '🎸', hint: '吉他/键盘/管乐弦乐等乐器及配件' },
  { id: 'books', label: '图书·游戏·影音', icon: '🎮', hint: '小说/漫画/游戏卡带光盘/CD/DVD等休闲读物影音(非教材)' },
  { id: 'baby', label: '母婴', icon: '🍼', hint: '婴儿车/儿童玩具/童装/喂养用品等母婴儿童' },
  { id: 'tickets', label: '票务·卡券', icon: '🎫', hint: '演唱会活动门票/健身房卡/交通卡/礼品代金券等可转让票券(票据/卡片/二维码截图归这类)' },
  { id: 'free', label: '免费送', icon: '🎁', hint: '免费赠送(由价格为0决定，非品类)' },
  { id: 'moving', label: '搬家甩卖', icon: '📦', hint: '整批打包甩卖(独立发布流程，非品类)' },
  { id: 'other', label: '其他', icon: '✨', hint: '无法归入以上任何品类时的兜底' },
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
