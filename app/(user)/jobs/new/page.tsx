import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobPublishForm } from '@/components/jobs/JobPublishForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '发布招工 · 找工作' }

export default async function NewJobPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/jobs/new')

  if (!user.email_confirmed_at) {
    return (
      <article className="max-w-xl mx-auto px-4 md:px-6 py-12">
        <h1 className="font-serif text-[28px] font-bold text-brand-ink m-0 mb-4">
          先验证邮箱
        </h1>
        <p className="text-[14px] text-brand-muted">
          发布招工前需要先验证邮箱。检查你的邮箱收件箱，点击验证链接后再回来。
        </p>
        <Link
          href="/me"
          className="inline-block mt-6 text-[13px] underline underline-offset-2 text-brand-ink"
        >
          回我的页面
        </Link>
      </article>
    )
  }

  // 当前已发布数（用于前端展示限额）
  const { data: countRes } = await supabase.rpc('active_jobs_count', {
    p_user_id: user.id,
  })
  const activeCount = typeof countRes === 'number' ? countRes : 0

  return (
    <article className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="mb-4">
        <Link
          href="/jobs"
          className="text-[13px] text-brand-muted hover:text-brand-ink underline underline-offset-2"
        >
          ← 全部招工
        </Link>
      </div>

      <h1 className="font-serif text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-brand-ink m-0 mb-2">
        发布招工
      </h1>
      <p className="text-[14px] text-brand-muted mb-8">
        告诉社区你在招什么人。维也纳华人邻居会看到。
      </p>

      <JobPublishForm activeCount={activeCount} />
    </article>
  )
}
