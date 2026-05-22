import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HangoutForm from '@/components/publish/HangoutForm'

export const metadata = { title: '发起活动' }

export default async function NewHangoutPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/buddies/new')

  // Contact gate — hangouts need a way to reach the host too.
  const { data: profile } = await supabase
    .from('profiles')
    .select('wechat, whatsapp')
    .eq('id', user.id)
    .single()
  if (!profile?.wechat && !profile?.whatsapp) {
    redirect('/me/edit?next=/buddies/new&reason=contact')
  }

  if (!user.email_confirmed_at) {
    return (
      <div className="max-w-md mx-auto py-10 px-4">
        <div className="bg-white border border-brand-line rounded-2xl p-7 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-xl font-semibold mb-2">请先验证邮箱</h1>
          <p className="text-sm text-brand-muted leading-relaxed">
            完成 <strong>{user.email}</strong> 的邮件验证后才能发起活动。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-12 px-4 md:px-6">
      <div className="mb-7">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted">
          BUDDIES · 发起活动
        </span>
        <h1 className="font-serif text-[36px] md:text-[44px] font-bold tracking-[-0.02em] text-brand-ink mt-2 mb-2">
          发起一个活动
        </h1>
        <p className="text-[14px] text-brand-muted leading-relaxed">
          饭搭子、球友、车队、徒步、演唱会拼车——把你想约的事情发出来，邻居们就能加入。
        </p>
      </div>
      <HangoutForm />
    </div>
  )
}
