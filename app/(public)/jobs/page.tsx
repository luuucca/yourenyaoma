import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '找工作 · 维也纳华人招工' }

type Job = {
  id: string
  title: string
  description: string
  region: string
  salary_text: string | null
  created_at: string
  user_id: string
}

export default async function JobsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, description, region, salary_text, created_at, user_id')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <header className="flex items-baseline justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-[36px] md:text-[48px] font-bold tracking-[-0.02em] text-brand-ink m-0">
            找工作
          </h1>
          <p className="text-[14px] text-brand-muted mt-2">
            维也纳本地华人招工广告 · 每人最多同时 2 条
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="shrink-0 bg-brand-ink text-white rounded-pill px-5 py-2.5 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all"
        >
          + 发布招工
        </Link>
      </header>

      {!jobs || jobs.length === 0 ? (
        <div className="text-center py-20 text-brand-muted text-sm">
          还没有招工广告。
          <br />
          <Link href="/jobs/new" className="underline text-brand-ink mt-2 inline-block">
            发第一条
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {(jobs as Job[]).map((j) => (
            <li key={j.id}>
              <Link
                href={`/jobs/${j.id}`}
                className="block border border-brand-line rounded-2xl p-5 bg-white hover:border-brand-ink hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-12px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out motion-reduce:transition-none"
              >
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <h2 className="font-serif font-bold text-[18px] text-brand-ink m-0 truncate">
                    {j.title}
                  </h2>
                  <span className="text-[11px] font-mono text-brand-muted shrink-0">
                    {formatTime(j.created_at)}
                  </span>
                </div>
                <p className="text-[13px] text-brand-ink-soft line-clamp-2 mb-2.5">
                  {j.description}
                </p>
                <div className="flex items-center gap-3 text-[12px] text-brand-muted flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    📍 {j.region}
                  </span>
                  {j.salary_text && (
                    <span className="inline-flex items-center gap-1 font-mono text-brand-ink">
                      💰 {j.salary_text}
                    </span>
                  )}
                  {user?.id === j.user_id && (
                    <span className="text-[11px] py-0.5 px-2 rounded-pill bg-brand-yellow-soft text-brand-ink border border-brand-yellow-line ml-auto">
                      我发的
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {user && (
        <div className="mt-10 text-center">
          <Link
            href="/me/jobs"
            className="text-[13px] text-brand-muted underline underline-offset-2 hover:text-brand-ink"
          >
            管理我的招工 →
          </Link>
        </div>
      )}
    </article>
  )
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000 / 60
  if (diff < 60) return `${Math.max(1, Math.floor(diff))} 分钟前`
  if (diff < 60 * 24) return `${Math.floor(diff / 60)} 小时前`
  if (diff < 60 * 24 * 7) return `${Math.floor(diff / 60 / 24)} 天前`
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
