import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JobOwnerActions } from '@/components/jobs/JobOwnerActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: j } = await supabase
    .from('jobs')
    .select('title')
    .eq('id', params.id)
    .maybeSingle()
  return { title: j ? `${j.title} · 招工` : '招工' }
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: job }, { data: { user } }] = await Promise.all([
    supabase
      .from('jobs')
      .select(
        'id, user_id, title, description, region, salary_text, contact_wechat, contact_whatsapp, contact_email, status, created_at',
      )
      .eq('id', params.id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ])

  if (!job) notFound()

  const isOwner = user?.id === job.user_id
  const isClosed = job.status === 'closed'

  // 拉发布者的 nickname + 联系方式（联系方式以 profile 为准）
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, wechat, whatsapp')
    .eq('id', job.user_id)
    .maybeSingle()

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

      {isClosed && (
        <div className="text-[12px] py-2 px-3 rounded-pill bg-brand-line text-brand-ink-soft border border-brand-line font-medium inline-block mb-4">
          已关闭
        </div>
      )}

      <h1 className="font-serif text-[32px] md:text-[42px] font-bold tracking-[-0.02em] text-brand-ink m-0 leading-[1.1]">
        {job.title}
      </h1>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-y border-brand-line">
        <Meta label="LOCATION" value={job.region} />
        {job.salary_text && <Meta label="SALARY" value={job.salary_text} accent />}
        <Meta label="POSTED" value={formatDate(job.created_at)} />
      </div>

      <section className="mt-8">
        <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-3">职位描述</h3>
        <div className="text-[14px] leading-[1.75] text-brand-ink-soft whitespace-pre-wrap p-5 rounded-2xl border border-brand-line bg-white">
          {job.description}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-3">联系方式</h3>
        {user ? (
          <div className="space-y-2">
            {profile?.wechat && (
              <ContactRow label="微信" value={profile.wechat} />
            )}
            {profile?.whatsapp && (
              <ContactRow
                label="WhatsApp"
                value={profile.whatsapp}
                href={`https://wa.me/${profile.whatsapp.replace(/[^0-9+]/g, '')}`}
              />
            )}
            {!profile?.wechat && !profile?.whatsapp && (
              <div className="text-[13px] text-brand-muted py-3">
                这位发布者还没填联系方式。
              </div>
            )}
            <p className="text-[11px] text-brand-muted leading-relaxed pt-3 border-t border-brand-line">
              提示：见面优先公共场所。试岗工资按约定结算，不要预付任何「保证金」。
            </p>
          </div>
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(`/jobs/${job.id}`)}`}
            className="inline-block w-full text-center bg-brand-ink text-white rounded-pill px-5 py-2.5 text-[13px] font-medium hover:opacity-85 transition-all"
          >
            登录后查看联系方式
          </Link>
        )}
      </section>

      <section className="mt-6 text-[12px] text-brand-muted">
        发布人：{profile?.nickname || '邻居'}
      </section>

      {isOwner && <JobOwnerActions jobId={job.id} status={job.status} />}
    </article>
  )
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-muted mb-1.5">
        {label}
      </div>
      <div
        className={`text-[14px] md:text-[15px] font-medium ${
          accent ? 'text-brand-ink font-mono' : 'text-brand-ink-soft'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 px-4 rounded-xl bg-brand-cream border border-brand-line">
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-brand-muted font-mono uppercase tracking-wider">
          {label}
        </span>
        {href ? (
          <a
            href={href}
            className="text-[15px] font-medium text-brand-ink truncate hover:underline"
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noreferrer' : undefined}
          >
            {value}
          </a>
        ) : (
          <span className="text-[15px] font-medium text-brand-ink truncate">
            {value}
          </span>
        )}
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000 / 60
  if (diff < 60) return `${Math.max(1, Math.floor(diff))} 分钟前`
  if (diff < 60 * 24) return `${Math.floor(diff / 60)} 小时前`
  if (diff < 60 * 24 * 7) return `${Math.floor(diff / 60 / 24)} 天前`
  return d.toLocaleDateString('zh-CN', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  })
}
