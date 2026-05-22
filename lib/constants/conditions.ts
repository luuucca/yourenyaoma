export const CONDITIONS = [
  { id: 'new', label: '全新' },
  { id: 'like-new', label: '几乎全新' },
  { id: '90', label: '九成新' },
  { id: '80', label: '八成新' },
  { id: 'used', label: '正常使用痕迹' },
  { id: 'worn', label: '有明显使用痕迹' },
] as const

export type ConditionId = (typeof CONDITIONS)[number]['id']
export const CONDITION_LABEL: Record<string, string> = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c.label]),
)
