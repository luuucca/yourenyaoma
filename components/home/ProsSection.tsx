import SectionHead from './SectionHead'
import ScrollReveal from '@/components/ui/ScrollReveal'
import CountUp from '@/components/ui/CountUp'
import ProContactButton from './ProContactButton'
import { createClient } from '@/lib/supabase/server'
import { DEMO_PROS, type DemoPro } from '@/lib/constants/demoData'

type LiveProRow = {
  user_id: string
  role: string
  region: string
  rate: string
  years: number
  jobs_count: number
  badge: string | null
  avatar_url: string | null
  profiles: { nickname: string | null; avatar_url?: string | null } | null
}

type Card = {
  id: string
  name: string
  role: string
  region: string
  rate: string
  years: number
  jobs: number
  badge: string
  avatar: string
  /** Whether the contact button hits the live API or is a demo no-op. */
  live: boolean
}

// 找师傅 — server component. Queries approved pros, falls back to DEMO_PROS
// so the section never looks empty during early launch. The interactive
// "聊一聊" button is a client island (ProContactButton).
export default async function ProsSection() {
  const supabase = createClient()
  const [{ data: liveRows }, { data: { user } }] = await Promise.all([
    supabase
      .from('pros')
      .select(
        'user_id, role, region, rate, years, jobs_count, badge, avatar_url, profiles!pros_user_id_fkey(nickname, avatar_url)',
      )
      .eq('status', 'approved')
      .order('approved_at', { ascending: false })
      .limit(6),
    supabase.auth.getUser(),
  ])

  const isAuthed = !!user

  const liveCards: Card[] =
    (liveRows as unknown as LiveProRow[] | null)?.map((p) => ({
      id: p.user_id,
      name: p.profiles?.nickname ?? '邻居师傅',
      role: p.role,
      region: p.region,
      rate: p.rate,
      years: p.years,
      jobs: p.jobs_count,
      badge: p.badge ?? '平台认证',
      avatar: (p.profiles?.nickname ?? '?').trim().charAt(0) || '?',
      live: true,
    })) ?? []

  const cards: Card[] =
    liveCards.length > 0
      ? liveCards
      : DEMO_PROS.map(
          (p): Card => ({
            id: p.id, // not a real user_id — button will route to /pros (not API)
            name: p.name,
            role: p.role,
            region: p.region,
            rate: p.rate,
            years: p.years,
            jobs: p.jobs,
            badge: p.badge,
            avatar: p.avatar,
            live: false,
          }),
        )

  return (
    <section className="max-w-[1360px] mx-auto px-4 md:px-16 pt-14">
      <SectionHead
        eyebrow="— PROS · 全部平台认证"
        title="找师傅"
        desc="海外华人最常找的几件事 — 资质审核 · 明码标价 · 中德双语"
        moreHref="/pros"
        tint="yellow"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((p, i) => (
          <ScrollReveal key={p.id} delay={i * 80}>
            <div className="h-full group bg-white border border-brand-line-2 rounded-2xl p-[22px] flex flex-col gap-3.5 transition-all duration-200 hover:border-brand-ink hover:-translate-y-1 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] active:translate-y-0 relative">
              <span className="absolute top-[22px] right-[22px] text-[10px] font-mono text-brand-muted tracking-[0.04em]">
                {p.badge}
              </span>
              <div className="flex items-center gap-3.5">
                <div className="w-[52px] h-[52px] rounded-full bg-brand-yellow-soft border border-brand-yellow-line flex items-center justify-center font-serif text-[22px] font-semibold text-brand-ink shrink-0">
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-brand-ink flex items-center gap-1.5 flex-wrap">
                    {p.name}
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-brand-ink text-brand-yellow py-[3px] px-2 rounded-pill tracking-[0.04em]">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
                        <path d="M6.5 11.5L3 8l1.4-1.4 2.1 2.1 5.1-5.1L13 5z" />
                      </svg>
                      已认证
                    </span>
                  </div>
                  <div className="text-[12px] text-[#666] mt-0.5">{p.role}</div>
                </div>
              </div>
              <div className="flex gap-4 py-3 border-y border-brand-line text-[12px] text-brand-ink-soft">
                <div className="flex flex-col">
                  <CountUp
                    value={p.years}
                    suffix="年"
                    className="font-serif text-[16px] text-brand-ink font-semibold"
                  />
                  <span className="text-[11px] text-brand-muted mt-0.5">从业经验</span>
                </div>
                <div className="flex flex-col">
                  <CountUp
                    value={p.jobs}
                    suffix="+"
                    className="font-serif text-[16px] text-brand-ink font-semibold"
                  />
                  <span className="text-[11px] text-brand-muted mt-0.5">服务单量</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-[16px] text-brand-ink font-semibold">{p.rate}</span>
                  <span className="text-[11px] text-brand-muted mt-0.5">起价</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-brand-muted">
                  📍 <b className="text-brand-ink font-medium">{p.region}</b>
                </span>
                <ProContactButton
                  proUserId={p.id}
                  proName={p.name}
                  isAuthed={isAuthed && p.live}
                />
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
