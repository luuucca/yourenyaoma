'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createGiveaway, drawWinner } from '@/app/(admin)/admin/giveaway/actions'

type Giveaway = {
  id: string
  title: string
  prize: string
  starts_at: string
  ends_at: string
  status: string
  draw?: {
    winner_nickname: string | null
    winner_email_masked: string | null
    eligible_count: number
    drawn_at: string
  } | null
}

export function GiveawayManager({ giveaways }: { giveaways: Giveaway[] }) {
  const router = useRouter()
  const { show } = useToast()
  const [title, setTitle] = useState('')
  const [prize, setPrize] = useState('€200 MediaMarkt 代金券')
  const [endsAt, setEndsAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [drawingId, setDrawingId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const r = await createGiveaway({ title, prize, endsAt })
    setLoading(false)
    if (r.error) return show(r.error, 'error')
    show('已创建', 'success')
    setTitle('')
    setEndsAt('')
    router.refresh()
  }

  async function handleDraw(id: string) {
    if (!confirm('确认开奖？随机抽 1 个合格用户，不可撤销。')) return
    setDrawingId(id)
    const r = await drawWinner(id)
    setDrawingId(null)
    if (r.error) return show(r.error, 'error')
    show(`🎉 中奖者：${r.winner}`, 'success')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {/* 创建新抽奖 */}
      <form
        onSubmit={handleCreate}
        className="border border-brand-line rounded-2xl p-5 bg-white space-y-4"
      >
        <h2 className="font-serif text-[18px] font-bold text-brand-ink m-0">
          创建抽奖
        </h2>
        <Input
          label="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：搬家季新邻居福利"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="奖品"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            required
          />
          <Input
            type="datetime-local"
            label="截止时间"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
          />
        </div>
        <p className="text-[11px] text-brand-muted">
          合格条件（开奖时自动判定）：邮箱已验证 · 至少 1 条已发布闲置 · 注册时间晚于本抽奖启动。
        </p>
        <Button type="submit" loading={loading} size="md">
          创建
        </Button>
      </form>

      {/* 抽奖列表 */}
      <div className="space-y-3">
        <h2 className="font-serif text-[18px] font-bold text-brand-ink m-0">
          全部抽奖
        </h2>
        {giveaways.length === 0 ? (
          <p className="text-sm text-brand-muted py-6 text-center">还没有抽奖</p>
        ) : (
          <ul className="space-y-3">
            {giveaways.map((g) => (
              <li
                key={g.id}
                className="border border-brand-line rounded-2xl p-4 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-[15px] text-brand-ink">
                      {g.title}
                    </div>
                    <div className="text-[12px] text-brand-muted mt-0.5">
                      🎁 {g.prize}
                    </div>
                    <div className="text-[11px] font-mono text-brand-muted mt-1">
                      截止 {new Date(g.ends_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {g.status === 'drawn' && g.draw ? (
                      <div className="text-right">
                        <div className="text-[11px] text-brand-free font-medium">
                          ✓ 已开奖
                        </div>
                        <div className="text-[13px] font-semibold text-brand-ink mt-0.5">
                          {g.draw.winner_nickname}
                        </div>
                        <div className="text-[10px] font-mono text-brand-muted">
                          {g.draw.winner_email_masked}
                        </div>
                        <div className="text-[10px] text-brand-muted">
                          {g.draw.eligible_count} 人参与
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleDraw(g.id)}
                        loading={drawingId === g.id}
                      >
                        立即开奖
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
