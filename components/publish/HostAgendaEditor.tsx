'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateHangoutDescription } from '@/app/(public)/buddies/[id]/actions'

type Props = {
  hangoutId: string
  initial: string
}

// Host-only inline editor for the hangout's description (acts as the agenda).
// Renders a textarea + "保存活动安排" button. Save calls the server action,
// which re-validates the hangout detail page.
export default function HostAgendaEditor({ hangoutId, initial }: Props) {
  const router = useRouter()
  const [text, setText] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dirty = text !== initial

  const onSave = async () => {
    setSaving(true)
    setError(null)
    const r = await updateHangoutDescription(hangoutId, text)
    setSaving(false)
    if (r.error) {
      setError(r.error)
      return
    }
    setSavedAt(Date.now())
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-[18px] font-bold text-brand-ink m-0">活动安排</h3>
        <span className="text-[11px] text-brand-muted font-mono uppercase tracking-wider">
          HOST EDIT · 只有发起人能改
        </span>
      </div>
      <textarea
        rows={8}
        maxLength={2000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="写清楚活动详情、费用、装备、集合方式、注意事项…"
        className="w-full px-4 py-3 rounded-2xl border border-brand-line bg-white outline-none focus:border-brand-ink text-[14px] leading-relaxed"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="bg-brand-ink text-white rounded-pill px-5 py-2.5 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中…' : '保存活动安排'}
        </button>
        {savedAt && !dirty && (
          <span className="text-[12px] text-brand-free">✓ 已保存</span>
        )}
        {error && <span className="text-[12px] text-red-600">{error}</span>}
        <span className="text-[11px] text-brand-muted ml-auto">{text.length}/2000</span>
      </div>
    </div>
  )
}
