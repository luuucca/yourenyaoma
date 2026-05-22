export const REPORT_REASONS = [
  { id: 'scam', label: '疑似诈骗' },
  { id: 'forbidden', label: '违禁商品' },
  { id: 'fake', label: '假货' },
  { id: 'duplicate', label: '重复发布' },
  { id: 'misleading', label: '信息不实' },
  { id: 'sold-not-marked', label: '已经售出但未标记' },
  { id: 'other', label: '其他' },
] as const

export const REJECTION_REASONS = [
  { id: 'forbidden', label: '违禁商品' },
  { id: 'scam', label: '疑似诈骗' },
  { id: 'unclear-images', label: '图片不清晰' },
  { id: 'incomplete', label: '信息不完整' },
  { id: 'duplicate', label: '重复发布' },
  { id: 'commercial-ad', label: '商业广告' },
  { id: 'other', label: '其他' },
] as const

export type ReportReasonId = (typeof REPORT_REASONS)[number]['id']
export type RejectionReasonId = (typeof REJECTION_REASONS)[number]['id']
