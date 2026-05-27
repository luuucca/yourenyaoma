import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type Job = {
  id: string
  title: string
  region: string
  salary_text: string | null
  description: string
  created_at: string
}

export default async function JobsSection() {
  const supabase = createClient()
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, region, salary_text, description, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(4)

  const list = (jobs as Job[]) || []

  return (
    <section className="max-w-[1360px] mx-auto px-4 md:px-16 py-12 md:py-16">
      <header className="flex items-end justify-between mb-7 gap-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] text-brand-muted uppercase mb-2">
            — jobs
          </div>
          <h2 className="font-serif font-bold text-[28px] md:text-[40px] tracking-[-0.025em] text-brand-ink leading-none m-0">
            <span className="text-highlight-yellow">找工作</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-brand-muted-soft">
          <span className="hidden md:inline">本地招工 · 单人限 2 条</span>
          <Link
            href="/jobs"
            className="text-brand-ink hover:opacity-80 transition-opacity underline underline-offset-4"
          >
            查看全部 →
          </Link>
        </div>
      </header>

      {list.length === 0 ? (
        <div className="border border-dashed border-brand-line rounded-2xl px-6 py-12 text-center bg-brand-cream">
          <div className="text-[14px] text-brand-muted mb-2">
            还没有招工广告
          </div>
          <Link
            href="/jobs/new"
            className="text-[13px] underline underline-offset-2 text-brand-ink"
          >
            成为第一个发布招工的人 →
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((j) => (
            <li key={j.id}>
              <Link
                href={`/jobs/${j.id}`}
                className="block border border-brand-line rounded-2xl p-5 bg-white hover:border-brand-ink hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-12px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out motion-reduce:transition-none h-full"
              >
                <h3 className="font-serif font-bold text-[16px] text-brand-ink m-0 mb-1.5 truncate">
                  {j.title}
                </h3>
                <p className="text-[12px] text-brand-ink-soft line-clamp-2 mb-3 leading-relaxed">
                  {j.description}
                </p>
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-brand-muted truncate">📍 {j.region}</span>
                  {j.salary_text && (
                    <span className="font-mono font-semibold text-brand-ink shrink-0">
                      {j.salary_text}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
