import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '我的招工' }

type Job = {
  id: string
  title: string
  region: string
  salary_text: string | null
  status: string
  created_at: string
}

export default async function MyJobsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me/jobs')

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, region, salary_text, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const list = (jobs as Job[]) || []
  const publishedCount = list.filter((j) => j.status === 'published').length

  return (
    <article className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-serif text-[28px] md:text-[36px] font-bold text-brand-ink m-0">
          我的招工
        </h1>
        <Link
          href="/me"
          className="text-[13px] text-brand-muted hover:text-brand-ink underline underline-offset-2"
        >
          返回我的
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 mb-5 p-4 rounded-2xl bg-brand-cream border border-brand-line">
        <div>
          <div className="text-[13px] font-medium text-brand-ink">在线限额</div>
          <div className="text-[11px] text-brand-muted mt-0.5">
            最多同时 2 条 · 当前 {publishedCount} / 2
          </div>
        </div>
        {publishedCount < 2 ? (
          <Link
            href="/jobs/new"
            className="shrink-0 bg-brand-ink text-white rounded-pill px-4 py-2 text-[12px] font-medium hover:opacity-85 transition-all"
          >
            + 发新的
          </Link>
        ) : (
          <span className="text-[11px] text-brand-muted shrink-0">已满</span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-brand-muted text-sm">
          还没发过招工。
          <br />
          <Link href="/jobs/new" className="underline text-brand-ink mt-2 inline-block">
            发布第一条 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((j) => {
            const closed = j.status === 'closed'
            return (
              <li key={j.id}>
                <Link
                  href={`/jobs/${j.id}`}
                  className={
                    'block border rounded-2xl p-4 bg-white hover:border-brand-ink transition-colors ' +
                    (closed
                      ? 'border-brand-line opacity-70'
                      : 'border-brand-line')
                  }
                >
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <h2 className="font-serif font-bold text-[15px] text-brand-ink m-0 truncate flex items-center gap-2">
                      {j.title}
                      {closed && (
                        <span className="text-[10px] font-mono py-0.5 px-2 rounded-full bg-brand-line text-brand-ink-soft uppercase tracking-wider">
                          closed
                        </span>
                      )}
                    </h2>
                    <span className="text-[11px] font-mono text-brand-muted shrink-0">
                      {new Date(j.created_at).toLocaleDateString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-[12px] text-brand-muted flex items-center gap-3 flex-wrap">
                    <span>📍 {j.region}</span>
                    {j.salary_text && (
                      <span className="font-mono text-brand-ink">{j.salary_text}</span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
