'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { publishJob } from '@/app/(user)/jobs/new/actions'

export function JobPublishForm({ activeCount }: { activeCount: number }) {
  const router = useRouter()
  const { show } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [region, setRegion] = useState('')
  const [salary, setSalary] = useState('')
  const [wechat, setWechat] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
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
      contact_wechat: wechat,
      contact_whatsapp: whatsapp,
      contact_email: email,
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
          <a href="/me/jobs" className="underline mx-1">
            我的招工
          </a>
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

      <fieldset className="space-y-3 pt-2 border-t border-brand-line">
        <legend className="text-[13px] font-medium text-brand-ink mb-1">
          联系方式（至少填一个）
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="微信号"
            value={wechat}
            onChange={(e) => setWechat(e.target.value)}
            placeholder="可选"
            maxLength={40}
            disabled={atLimit}
          />
          <Input
            label="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+43 / +49 …"
            maxLength={40}
            disabled={atLimit}
          />
          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="可选"
            maxLength={80}
            disabled={atLimit}
            className="sm:col-span-2"
          />
        </div>
      </fieldset>

      <p className="text-xs text-brand-muted leading-relaxed">
        每位用户最多同时存在 <strong>2 条</strong> 招工广告。当前在线 {activeCount} / 2。
        关闭后可重新发或重开历史广告。
      </p>

      {err && (
        <div className="text-[13px] text-brand-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {err}
        </div>
      )}

      <Button type="submit" size="lg" loading={loading} disabled={atLimit} className="w-full">
        发布招工广告
      </Button>
    </form>
  )
}
