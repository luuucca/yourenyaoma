// Smart cover-picker for hangout cards.
//
// Reverted to V1 approach: Unsplash CDN photo IDs. Real photos look nicer
// than brand-styled placeholders, even if a few category↔photo mappings
// occasionally drift (Unsplash photo IDs are stable, but the content of any
// given photo is best-effort — I can't browse to verify each one).
//
// If a specific photo looks wrong, swap the ID in the list below. The
// `alt` text is the source of truth for what the photo SHOULD show.

export type CoverSpec = {
  url: string
  alt: string
}

type Rule = {
  patterns: string[]
  spec: CoverSpec
}

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=450&q=75`

const SPECIFIC: Rule[] = [
  // === Games ===
  { patterns: ['valorant', '瓦洛兰特', '无畏契约'], spec: { url: U('1538481199705-c710c4e965fc'), alt: 'VALORANT' } },
  { patterns: ['王者荣耀', '王者', 'arena of valor'], spec: { url: U('1542751371-adc38448a05e'), alt: '王者荣耀' } },
  { patterns: ['英雄联盟', 'league of legends', 'lol'], spec: { url: U('1511512578047-dfb367046420'), alt: 'League of Legends' } },
  { patterns: ['原神', 'genshin'], spec: { url: U('1605098293553-d39b89893b95'), alt: '原神' } },
  { patterns: ['dota', 'csgo', 'cs2', 'counter-strike', '反恐精英'], spec: { url: U('1511512578047-dfb367046420'), alt: '电竞' } },
  { patterns: ['pubg', '吃鸡', '绝地求生'], spec: { url: U('1593305841991-05c297ba4575'), alt: 'PUBG' } },
  { patterns: ['steam'], spec: { url: U('1493711662062-fa541adb3fc8'), alt: 'PC 游戏' } },
  { patterns: ['switch', 'mario', '塞尔达', 'zelda'], spec: { url: U('1612287230202-1ff1d85d1bdf'), alt: 'Switch' } },

  // === Food ===
  // Note: hot pot photo IDs are notoriously hard to find on Unsplash —
  // using a Chinese-cuisine shot that *looks like* shared dining.
  { patterns: ['火锅', 'hotpot', 'hot pot'], spec: { url: U('1552566626-52f8b828add9'), alt: '火锅' } },
  { patterns: ['烧烤', 'bbq', 'barbecue', '烤肉'], spec: { url: U('1555939594-58d7cb561ad1'), alt: '烧烤' } },
  { patterns: ['日料', '寿司', 'sushi', '刺身'], spec: { url: U('1579871494447-9811cf80d66c'), alt: '日料' } },
  { patterns: ['韩餐', '韩式', 'korean', '烤五花'], spec: { url: U('1583224994076-ae3a3f4d0d57'), alt: '韩餐' } },
  { patterns: ['串串', '麻辣烫', '冒菜'], spec: { url: U('1552566626-52f8b828add9'), alt: '串串' } },
  { patterns: ['咖啡', 'coffee', 'café', 'cafe'], spec: { url: U('1495474472287-4d71bcdd2085'), alt: '咖啡' } },
  { patterns: ['奶茶', '珍珠', 'bubble tea', 'boba'], spec: { url: U('1558857563-c0c6ee6ff8bb'), alt: '奶茶' } },
  { patterns: ['早午餐', 'brunch'], spec: { url: U('1525351484163-7529414344d8'), alt: 'Brunch' } },
  { patterns: ['拉面', 'ramen'], spec: { url: U('1623341214825-9f4f963727da'), alt: '拉面' } },

  // === Sports ===
  { patterns: ['篮球', 'basketball', 'nba'], spec: { url: U('1546519638-68e109498ffc'), alt: '篮球' } },
  { patterns: ['足球', 'soccer', 'football'], spec: { url: U('1574629810360-7efbbe195018'), alt: '足球' } },
  { patterns: ['网球', 'tennis'], spec: { url: U('1551773474-69cdb27fda1b'), alt: '网球' } },
  { patterns: ['羽毛球', 'badminton'], spec: { url: U('1521587765099-8835e7201186'), alt: '羽毛球' } },
  { patterns: ['乒乓球', 'pingpong', 'table tennis'], spec: { url: U('1611532736597-de2d4265fba3'), alt: '乒乓球' } },
  { patterns: ['游泳', 'swim'], spec: { url: U('1530549387789-4c1017266635'), alt: '游泳' } },
  { patterns: ['滑雪', 'ski', 'snowboard', '单板'], spec: { url: U('1518091043644-c1d4457512c6'), alt: '滑雪' } },
  { patterns: ['健身', 'gym', '撸铁'], spec: { url: U('1534438327276-14e5300c3a48'), alt: '健身' } },
  { patterns: ['瑜伽', 'yoga'], spec: { url: U('1545205597-3d9d02c29597'), alt: '瑜伽' } },
  { patterns: ['骑行', 'cycling', '自行车'], spec: { url: U('1517649763962-0c623066013b'), alt: '骑行' } },

  // === Outdoor ===
  { patterns: ['徒步', '远足', '爬山', 'hiking', 'hike'], spec: { url: U('1551632811-561732d1e306'), alt: '徒步' } },
  { patterns: ['露营', 'camping'], spec: { url: U('1504280390367-361c6d9f38f4'), alt: '露营' } },
  { patterns: ['野餐', 'picnic'], spec: { url: U('1551883040-1c1edc25dd4d'), alt: '野餐' } },

  // === Music / Event ===
  { patterns: ['演唱会', 'concert', 'live'], spec: { url: U('1501386761578-eac5c94b800a'), alt: '演唱会' } },
  { patterns: ['ktv', '唱歌', 'karaoke'], spec: { url: U('1493225457124-a3eb161ffa5f'), alt: 'KTV' } },
  { patterns: ['电影', 'movie', 'cinema'], spec: { url: U('1489599849927-2ee91cede3ba'), alt: '电影' } },

  // === Study ===
  { patterns: ['德语', 'deutsch', 'german'], spec: { url: U('1546410531-bb4caa6b424d'), alt: '德语学习' } },
  { patterns: ['英语', 'english', '雅思', 'ielts', 'toefl', '托福'], spec: { url: U('1456513080510-7bf3a84b82f8'), alt: '英语学习' } },
  { patterns: ['考研', '复习', '自习'], spec: { url: U('1517245386807-bb43f82c33c4'), alt: '自习' } },

  // === Activities ===
  { patterns: ['桌游', 'board game', '剧本杀', '狼人杀'], spec: { url: U('1610890716171-6b1bb98ffd09'), alt: '桌游' } },
  { patterns: ['密室', 'escape room'], spec: { url: U('1606092195730-5d7b9af1efc5'), alt: '密室' } },
  { patterns: ['拼车', 'carpool', 'rideshare'], spec: { url: U('1502877338535-766e1452684a'), alt: '拼车' } },
  { patterns: ['搬家', 'moving'], spec: { url: U('1600585154340-be6161a56a0c'), alt: '搬家' } },
]

const TAG_DEFAULT: Record<string, CoverSpec> = {
  球友:   { url: U('1546519638-68e109498ffc'), alt: '运动' },
  饭搭子: { url: U('1517248135467-4c7edcad34c4'), alt: '聚餐' },
  学习:   { url: U('1481627834876-b7833e8f5570'), alt: '学习' },
  游戏:   { url: U('1542751371-adc38448a05e'), alt: '游戏' },
  户外:   { url: U('1551632811-561732d1e306'), alt: '户外' },
  拼车:   { url: U('1502877338535-766e1452684a'), alt: '拼车' },
  演唱会: { url: U('1501386761578-eac5c94b800a'), alt: '演唱会' },
  其他:   { url: U('1517245386807-bb43f82c33c4'), alt: '搭子' },
}

const ULTIMATE_FALLBACK: CoverSpec = TAG_DEFAULT['其他']

export function pickHangoutCover(
  title: string,
  description: string | null | undefined,
  tag: string,
): CoverSpec {
  const hay = `${title} ${description || ''}`.toLowerCase()
  for (const rule of SPECIFIC) {
    if (rule.patterns.some((p) => hay.includes(p.toLowerCase()))) {
      return rule.spec
    }
  }
  return TAG_DEFAULT[tag] || ULTIMATE_FALLBACK
}
