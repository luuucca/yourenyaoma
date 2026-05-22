export const CATEGORIES = [
  { id: 'furniture', label: '家具家电', icon: '🛋️' },
  { id: 'appliance', label: '家电', icon: '🔌' },
  { id: 'digital', label: '数码电子', icon: '📱' },
  { id: 'bike', label: '自行车', icon: '🚴' },
  { id: 'baby', label: '母婴', icon: '🍼' },
  { id: 'fashion', label: '服饰鞋包', icon: '👜' },
  { id: 'books', label: '图书影音', icon: '📚' },
  { id: 'life', label: '生活用品', icon: '🧺' },
  { id: 'moving', label: '搬家甩卖', icon: '📦' },
  { id: 'free', label: '免费送', icon: '🎁' },
  { id: 'other', label: '其他', icon: '✨' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
)

export const HOME_CATEGORIES = CATEGORIES.filter((c) =>
  ['furniture', 'digital', 'fashion', 'life', 'books'].includes(c.id),
)
