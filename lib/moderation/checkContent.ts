import { BLOCKED_WORDS_FALLBACK } from './blockedWords'

export type BlockedHit = { word: string; category: string }

export function checkBlockedWords(
  text: string,
  list: { word: string; category: string }[] = BLOCKED_WORDS_FALLBACK,
): BlockedHit[] {
  const lower = text.toLowerCase()
  const hits: BlockedHit[] = []
  for (const item of list) {
    if (lower.includes(item.word.toLowerCase())) {
      hits.push(item)
    }
  }
  return hits
}

export function shouldForceModeration(
  hits: BlockedHit[],
  approvedCount: number,
): { force: boolean; reason: string | null } {
  if (hits.length > 0) {
    return { force: true, reason: `命中敏感词：${hits.map((h) => h.word).join('、')}` }
  }
  if (approvedCount < 3) {
    return { force: true, reason: '新用户前 3 条商品需审核' }
  }
  return { force: false, reason: null }
}
