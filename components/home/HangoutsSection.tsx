import Link from 'next/link'
import SectionHead from './SectionHead'
import ScrollReveal from '@/components/ui/ScrollReveal'
import HangoutJoinButton from './HangoutJoinButton'
import HangoutCover from '@/components/listing/HangoutCover'
import { createClient } from '@/lib/supabase/server'
import { DEMO_HANGOUTS } from '@/lib/constants/demoData'
import { pickHangoutCover, type CoverSpec } from '@/lib/utils/hangoutCover'

type LiveHangoutRow = {
  id: string
  title: string
  tag: string
  when_text: string
  region: string
  total_spots: number
  taken_spots: number
  host_id: string
  status: string
  profiles: { nickname: string | null } | null
}

type Card = {
  id: string
  title: string
  when: string
  region: string
  spots: string
  host: string
  host_id: string | null
  tag: string
  live: boolean
  cover: CoverSpec
}

export default async function HangoutsSection() {
  const supabase = createClient()
  const [{ data: liveRows }, { data: { user } }] = await Promise.all([
    supabase
      .from('hangouts')
      .select(
        'id, title, tag, when_text, region, total_spots, taken_spots, host_id, status, profiles!hangouts_host_id_fkey(nickname)',
      )
      .in('status', ['open', 'full'])
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.auth.getUser(),
  ])

  // Check which hangouts the current user already joined (for button state)
  let joinedIds = new Set<string>()
  if (user && liveRows && liveRows.length > 0) {
    const ids = (liveRows as unknown as LiveHangoutRow[]).map((h) => h.id)
    const { data: parts } = await supabase
      .from('hangout_participants')
      .select('hangout_id')
      .eq('user_id', user.id)
      .eq('status', 'joined')
      .in('hangout_id', ids)
    joinedIds = new Set((parts ?? []).map((p: any) => p.hangout_id))
  }

  const liveCards: Card[] =
    (liveRows as unknown as (LiveHangoutRow & { description?: string | null })[] | null)?.map((h) => {
      const remaining = Math.max(0, h.total_spots - h.taken_spots)
      const spots =
        h.status === 'full' || remaining === 0
          ? `已满 ${h.taken_spots} 人`
          : `${remaining}/${h.total_spots} 缺`
      return {
        id: h.id,
        title: h.title,
        when: h.when_text,
        region: h.region,
        spots,
        host: h.profiles?.nickname ?? '邻居',
        host_id: h.host_id,
        tag: h.tag,
        live: true,
        cover: pickHangoutCover(h.title, (h as any).description ?? null, h.tag),
      }
    }) ?? []

  const cards: Card[] =
    liveCards.length > 0
      ? liveCards
      : DEMO_HANGOUTS.map(
          (h): Card => ({
            id: h.id,
            title: h.title,
            when: h.when,
            region: h.region,
            spots: h.spots,
            host: h.host,
            host_id: null,
            tag: h.tag,
            live: false,
            cover: pickHangoutCover(h.title, null, h.tag),
          }),
        )

  return (
    <section className="max-w-[1360px] mx-auto px-4 md:px-16 pt-14">
      <SectionHead
        eyebrow="— BUDDIES · 同城搭子"
        title="找搭子"
        desc="饭搭子 · 球友 · 游戏车队 · 驴友 · 拼车——漂泊的日子也要有邻居一起玩"
        moreHref="/buddies"
        tint="yellow"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((h, i) => (
          <ScrollReveal key={h.id} delay={i * 80}>
            <div className="h-full group bg-white border border-brand-line-2 rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:border-brand-ink hover:-translate-y-1 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] active:translate-y-0 relative">
              {/* Cover — branded gradient + illustration/emoji + serif label.
                  No external photo CDN; always matches. */}
              <div className="relative overflow-hidden">
                <HangoutCover spec={h.cover} className="aspect-[16/9]" />
                <span className="absolute top-3 left-3 z-20 text-[11px] py-1 px-2.5 rounded-pill bg-brand-yellow text-brand-ink font-medium shadow-pill">
                  {h.tag}
                </span>
              </div>
              <div className="p-[22px] flex flex-col gap-3.5 flex-1">
              {h.live ? (
                <Link
                  href={`/buddies/${h.id}`}
                  className="font-serif text-[19px] font-semibold m-0 text-brand-ink tracking-[-0.01em] leading-[1.3] hover:underline underline-offset-4 decoration-2"
                >
                  {h.title}
                </Link>
              ) : (
                <h3 className="font-serif text-[19px] font-semibold m-0 text-brand-ink tracking-[-0.01em] leading-[1.3]">
                  {h.title}
                </h3>
              )}
              <div className="flex flex-col gap-1.5 text-[13px] text-[#666] py-2.5 border-t border-brand-line">
                <div className="flex items-center gap-2">
                  🕛 <b className="text-brand-ink font-medium">{h.when}</b>
                </div>
                <div className="flex items-center gap-2">
                  📍 <b className="text-brand-ink font-medium">{h.region}</b>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2.5 border-t border-brand-line">
                <span className="text-[12px] text-brand-muted">
                  发起人 <b className="text-brand-ink font-medium">{h.host}</b>
                </span>
                <span className="font-mono text-[11px] text-brand-ink font-semibold bg-brand-yellow py-1 px-2.5 rounded-pill pulse-soft motion-reduce:animate-none">
                  {h.spots}
                </span>
              </div>
              <HangoutJoinButton
                hangoutId={h.id}
                hangoutTitle={h.title}
                isAuthed={!!user && h.live}
                isHost={!!user && h.host_id === user.id}
                alreadyJoined={joinedIds.has(h.id)}
              />
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
