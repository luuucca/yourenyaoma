import { CONDITION_LABEL } from '@/lib/constants/conditions'

/**
 * Vienna district codes look like "1010" / "1220" — the middle two digits are
 * the bezirk number. Format as the short Chinese form for compact card display.
 * e.g. "1010" → "1 区", "1220" → "22 区".
 */
export function formatDistrictShort(district: string | null | undefined): string {
  if (!district) return '同城'
  const m = district.match(/^1(\d{2})\d$/)
  if (!m) return district
  const n = parseInt(m[1], 10)
  return `${n} 区`
}

/** Map raw condition id ("90") to display label ("九成新"). */
export function formatCondition(condition: string | null | undefined): string {
  if (!condition) return ''
  return CONDITION_LABEL[condition] ?? condition
}
