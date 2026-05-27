'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { publishJob } from '@/app/(user)/jobs/new/actions'

export function JobPublishForm({
  activeCount,
  myWechat,
  myWhatsapp,
}: {
  activeCount: number
  myWechat: string | null
  myWhatsapp: string | null
}) {
  const router = useRouter()
  const { show } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [region, setRegion] = useState('')
  const [salary, setSalary] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    const result = await publishJob({
      title,
      description,
      region,
      salary_text: salary,
    })
    setLoading(false)
    if (result.error) {
      setErr(result.error)
      return
    }
    show('已发布', 'success')
    router.push(`/jobs/${result.id}`)
    router.refresh()
  }

  const atLimit = activeCount >= 2

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {atLimit && (
        <div className="text-[13px] text-brand-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          你已经有 {activeCount} 条招工广告在线 — 限额是 2 条。先去
          <Link href="/me/jobs" className="underline mx-1">
            我的招工
          </Link>
          关闭一条才能发新的。
        </div>
      )}

      <Input
        label="职位标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="例：餐厅周末服务员 / 周一到三晚 / 包餐"
        maxLength={80}
        disabled={atLimit}
        required
      />

      <Textarea
        label="详细描述"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="工作内容、要求、班次、福利、试岗安排等。越具体越容易匹配到合适的人。"
        maxLength={2000}
        disabled={atLimit}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="工作地点"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="例：1010 内城 / Wien Mitte / 全城远程"
          maxLength={80}
          disabled={atLimit}
          required
        />
        <Input
          label="薪资（选填）"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="例：€14/小时 · €2000/月 · 面议"
          maxLength={60}
          disabled={atLimit}
        />
      </div>

      {/* 联系方式 — 自动来自资料 */}
      <div className="border border-brand-line rounded-2xl p-4 bg-brand-cream">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[12px] font-medium text-brand-ink">
            联系方式（来自你的资料）
          </span>
          <Link
            href="/me/edit?next=/jobs/new"
            className="text-[11px] underline underline-offset-2 text-brand-ink-soft hover:text-brand-ink"
          >
            编辑资料
          </Link>
        </div>
        <div className="space-y-1 text-[13px]">
          {myWechat ? (
            <div className="flex items-baseline gap-3">
              <span className="text-brand-muted shrink-0 w-16 text-[11px] font-mono uppercase">
                wechat
              </span>
              <span className="font-mono text-brand-ink">{myWechat}</span>
            </div>
          ) : null}
          {myWhatsapp ? (
            <div className="flex items-baseline gap-3">
              <span className="text-brand-muted shrink-0 w-16 text-[11px] font-mono uppercase">
                whatsapp
              </span>
              <span className="font-mono text-brand-ink">{myWhatsapp}</span>
            </div>
          ) : null}
          {!myWechat && !myWhatsapp && (
            <div className="text-brand-danger">
              你还没填联系方式 —
              <Link
                href="/me/edit?next=/jobs/new"
                className="underline ml-1"
              >
                去补一下
              </Link>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-brand-muted leading-relaxed">
        每位用户最多同时存在 <strong>2 条</strong> 招工广告。当前在线 {activeCount} / 2。
        关闭后可重新发或重开历史广告。
      </p>

      {err && (
        <div className="text-[13px] text-brand-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {err}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={loading}
        disabled={atLimit || (!myWechat && !myWhatsapp)}
        className="w-full"
      >
        发布招工广告
      </Button>
    </form>
  )
}
