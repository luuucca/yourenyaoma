import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileEditForm } from '@/components/user/ProfileEditForm'

export const metadata = { title: '编辑资料' }

export default async function MeEditPage({
  searchParams,
}: {
  searchParams: { next?: string; reason?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me/edit')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, district, wechat, whatsapp, avatar_url')
    .eq('id', user.id)
    .single()

  // Sanitize next: only allow same-origin relative paths to prevent open-redirects.
  const next =
    searchParams.next && searchParams.next.startsWith('/')
      ? searchParams.next
      : null
  const reason = searchParams.reason || null

  return (
    <div className="container-page py-6 max-w-md">
      <h1 className="font-display text-2xl mb-5">编辑资料</h1>

      {reason === 'contact' && (
        <div className="mb-5 p-4 rounded-2xl bg-brand-yellow-soft border border-brand-yellow-line">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-ink-soft mb-2">
            发布前先补一下联系方式
          </div>
          <p className="text-[13px] text-brand-ink-soft leading-relaxed m-0">
            没有联系方式的闲置/活动发出去也没人能找到你 —— 至少留一个
            <strong className="text-brand-ink">微信</strong>或
            <strong className="text-brand-ink">WhatsApp</strong>。
          </p>
          <p className="text-[12px] text-brand-muted mt-2 mb-0">
            买家需要点「显示联系方式」才能看到，平台会记录每次解锁。
          </p>
        </div>
      )}

      <ProfileEditForm
        initial={profile}
        nextPath={next}
        requireContact={reason === 'contact'}
      />
    </div>
  )
}
