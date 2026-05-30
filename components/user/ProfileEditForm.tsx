'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { DISTRICTS } from '@/lib/constants/districts'
import { profileSchema } from '@/lib/validations/profile'
import { createClient } from '@/lib/supabase/client'
import AvatarUploader from '@/components/user/AvatarUploader'

export function ProfileEditForm({
  initial,
  /** If set, redirect here after a successful save (instead of /me). */
  nextPath,
  /** If true, validate that at least one of wechat/whatsapp is filled. */
  requireContact,
}: {
  initial: {
    nickname?: string | null
    district?: string | null
    wechat?: string | null
    whatsapp?: string | null
    avatar_url?: string | null
  } | null
  nextPath?: string | null
  requireContact?: boolean
}) {
  const router = useRouter()
  const { show } = useToast()
  // 昵称注册后锁定，只读展示，不参与提交
  const nickname = initial?.nickname ?? ''
  const [district, setDistrict] = useState(initial?.district ?? '')
  const [wechat, setWechat] = useState(initial?.wechat ?? '')
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    // Soft validation: when arrived here via a publish/hangout flow that
    // requires contact, refuse to save until at least one channel is filled.
    if (requireContact && !wechat.trim() && !whatsapp.trim()) {
      setErrors({
        wechat: '至少填一个：微信号 或 WhatsApp',
        whatsapp: ' ',
      })
      return
    }

    // 昵称锁定，不校验/不提交；只验可编辑字段
    const result = profileSchema.omit({ nickname: true }).safeParse({
      district: district || undefined,
      wechat,
      whatsapp,
    })
    if (!result.success) {
      const fe: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        fe[err.path[0] as string] = err.message
      })
      setErrors(fe)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    // 注意：不提交 nickname —— 注册后锁定，DB 触发器也会拒绝改动
    const { error } = await supabase
      .from('profiles')
      .update({
        district: district || null,
        wechat: wechat || null,
        whatsapp: whatsapp || null,
      })
      .eq('id', user.id)
    setLoading(false)
    if (error) {
      show(error.message, 'error')
      return
    }
    show('已保存', 'success')
    router.push(nextPath || '/me')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 card p-6">
      {/* 头像 —— 即时上传保存 */}
      <AvatarUploader initialUrl={initial?.avatar_url} nickname={nickname} />

      {/* 昵称 —— 注册后锁定，只读 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          昵称
          <span className="ml-2 text-[11px] font-normal text-brand-muted">注册后不可修改</span>
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-brand-line bg-brand-cream px-3.5 py-2.5 text-[15px] text-brand-ink-soft">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-brand-muted" aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="truncate">{nickname || '—'}</span>
        </div>
      </div>
      <Select
        label="所在区"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        placeholder="请选择"
        options={DISTRICTS.map((d) => ({ value: d.id, label: d.label }))}
        error={errors.district}
      />
      <Input
        label={
          requireContact
            ? '微信号（与 WhatsApp 至少填一个）'
            : '微信号（可选，需点击解锁才显示给买家）'
        }
        value={wechat}
        onChange={(e) => setWechat(e.target.value)}
        error={errors.wechat}
      />
      <Input
        label={
          requireContact
            ? 'WhatsApp（与微信至少填一个）'
            : 'WhatsApp（可选）'
        }
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        error={errors.whatsapp}
        placeholder="+436601234567"
      />
      <Button type="submit" size="lg" loading={loading} className="w-full">
        {nextPath ? '保存并继续' : '保存'}
      </Button>
    </form>
  )
}
