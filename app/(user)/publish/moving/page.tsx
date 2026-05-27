import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MovingSalePublishForm } from '@/components/publish/MovingSalePublishForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '发布搬家甩卖' }

export default async function NewMovingSalePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/publish/moving')

  if (!user.email_confirmed_at) {
    return (
      <article className="max-w-xl mx-auto px-4 md:px-6 py-12">
        <h1 className="font-serif text-[28px] font-bold text-brand-ink m-0 mb-4">
          先验证邮箱
        </h1>
        <p className="text-[14px] text-brand-muted">
          发布搬家甩卖前需要验证邮箱。
        </p>
      </article>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('district, wechat, whatsapp')
    .eq('id', user.id)
    .single()

  if (!profile?.wechat && !profile?.whatsapp) {
    redirect('/me/edit?next=/publish/moving&reason=contact')
  }

  return (
    <article className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="mb-4">
        <Link
          href="/publish"
          className="text-[13px] text-brand-muted hover:text-brand-ink underline underline-offset-2"
        >
          ← 普通发布
        </Link>
      </div>
      <h1 className="font-serif text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-brand-ink m-0 mb-2">
        发布搬家甩卖
      </h1>
      <p className="text-[14px] text-brand-muted mb-8">
        一次性发布整屋物品 — 可设包圆总价，也可逐件标价
      </p>

      <MovingSalePublishForm defaultDistrict={profile?.district ?? null} />
    </article>
  )
}
