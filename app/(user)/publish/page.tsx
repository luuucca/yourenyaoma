import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublishForm } from '@/components/publish/PublishForm'

export const metadata = { title: '发布闲置' }

export default async function PublishPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/publish')

  if (!user.email_confirmed_at) {
    return (
      <div className="container-page py-10 max-w-md">
        <div className="card p-7 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-xl font-semibold mb-2">请先验证邮箱</h1>
          <p className="text-sm text-brand-muted mb-4 leading-relaxed">
            我们已经发送验证邮件到 <strong>{user.email}</strong>。完成验证后才能发布闲置。
          </p>
        </div>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('district, wechat, whatsapp')
    .eq('id', user.id)
    .single()

  // Contact gate — a listing with no way to reach the seller is useless.
  // Force the user through profile setup once, then back to /publish.
  if (!profile?.wechat && !profile?.whatsapp) {
    redirect('/me/edit?next=/publish&reason=contact')
  }

  return (
    <div className="container-page py-6 max-w-2xl">
      <h1 className="font-display text-2xl mb-1">发布闲置</h1>
      <p className="text-sm text-brand-muted mb-6">
        填写商品信息，让你的闲置找到下一位主人
      </p>
      <PublishForm defaultDistrict={profile?.district ?? null} />
    </div>
  )
}
