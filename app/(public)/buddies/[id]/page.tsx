import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import HangoutJoinButton from '@/components/home/HangoutJoinButton'
import HostAgendaEditor from '@/components/publish/HostAgendaEditor'
import HostCancelButton from '@/components/publish/HostCancelButton'
import HangoutCover from '@/components/listing/HangoutCover'
import { HangoutChat } from '@/components/messaging/HangoutChat'
import { pickHangoutCover } from '@/lib/utils/hangoutCover'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: h } = await supabase
    .from('hangouts')
    .select('title, tag')
    .eq('id', params.id)
    .single()
  return { title: h ? `${h.tag} · ${h.title}` : '活动' }
}

export default async function HangoutDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [
    { data: hangout },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from('hangouts')
      .select(
        '*, profiles!hangouts_host_id_fkey(id, nickname, avatar_url, district)',
      )
      .eq('id', params.id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!hangout) return notFound()

  // Fetch joined participants (limited to a preview).
  const { data: participants } = await supabase
    .from('hangout_participants')
    .select('user_id, joined_at, profiles!hangout_participants_user_id_fkey(nickname, avatar_url)')
    .eq('hangout_id', params.id)
    .eq('status', 'joined')
    .order('joined_at', { ascending: true })
    .limit(50)

  const isHost = user?.id === hangout.host_id
  const alreadyJoined =
    !!user && !!participants?.find((p: any) => p.user_id === user.id)
  const isMember = isHost || alreadyJoined
  const hostProfile: any = (hangout as any).profiles

  // 仅成员加载群聊历史消息 + 拼成员昵称映射
  let initialChatMessages: any[] = []
  const participantMap: Record<string, string> = {}
  if (isMember) {
    // 拉群聊历史
    const { data: msgs } = await supabase
      .from('hangout_messages')
      .select('id, sender_id, body, created_at')
      .eq('hangout_id', params.id)
      .order('created_at', { ascending: true })
    initialChatMessages = msgs || []

    // 成员名映射：host + 已加入参与者
    if (hostProfile?.nickname) {
      participantMap[hangout.host_id] = hostProfile.nickname
    }
    ;(participants || []).forEach((p: any) => {
      if (p.profiles?.nickname) {
        participantMap[p.user_id] = p.profiles.nickname
      }
    })
  }
  const remaining = Math.max(0, hangout.total_spots - hangout.taken_spots)
  const spotsLabel =
    hangout.status === 'full' || remaining === 0
      ? `已满 ${hangout.taken_spots} 人`
      : `${remaining}/${hangout.total_spots} 缺`
  const cover = pickHangoutCover(hangout.title, hangout.description ?? null, hangout.tag)

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Cover hero — bigger illustration + label for the detail page. */}
      <div className="rounded-2xl overflow-hidden border border-brand-line mb-6">
        <HangoutCover spec={cover} className="aspect-[16/9] md:aspect-[2.4/1]" size="hero" />
      </div>

      {/* Eyebrow + tag */}
      <div className="flex items-center gap-3 mb-3">
        <Link
          href="/buddies"
          className="text-[12px] text-brand-muted hover:text-brand-ink transition-colors"
        >
          ← 返回搭子
        </Link>
        <span className="self-start text-[11px] py-1 px-2.5 rounded-pill bg-brand-yellow-soft text-brand-ink border border-brand-yellow-line font-medium">
          {hangout.tag}
        </span>
        {hangout.status === 'cancelled' && (
          <span className="text-[11px] py-1 px-2.5 rounded-pill bg-red-50 text-red-700 border border-red-200 font-medium">
            已取消
          </span>
        )}
        {hangout.status === 'closed' && (
          <span className="text-[11px] py-1 px-2.5 rounded-pill bg-brand-line text-brand-ink-soft border border-brand-line font-medium">
            已关闭
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="font-serif text-[36px] md:text-[48px] font-bold tracking-[-0.02em] text-brand-ink m-0 leading-[1.05]">
        {hangout.title}
      </h1>

      {/* Meta line */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-y border-brand-line">
        <Meta label="TIME" value={hangout.when_text} />
        <Meta label="PLACE" value={hangout.region} />
        <Meta label="SPOTS" value={spotsLabel} accent={remaining > 0} />
        <Meta label="HOST" value={hostProfile?.nickname || '邻居'} />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 mt-6 flex-wrap">
        <HangoutJoinButton
          hangoutId={hangout.id}
          hangoutTitle={hangout.title}
          isAuthed={!!user}
          isHost={isHost}
          alreadyJoined={alreadyJoined}
        />
        {/* Host-only cancel — kept here next to the primary action, with
            muted styling so it doesn't compete with «我要加入» */}
        {isHost && hangout.status !== 'cancelled' && (
          <HostCancelButton
            hangoutId={hangout.id}
            hangoutTitle={hangout.title}
          />
        )}
        <span className="text-[12px] text-brand-muted">
          {participants?.length || 0} 人已加入 · 实名社区 · 公共场所交付
        </span>
      </div>

      {/* Description / Agenda */}
      <section className="mt-10">
        {isHost ? (
          <HostAgendaEditor
            hangoutId={hangout.id}
            initial={hangout.description ?? ''}
          />
        ) : hangout.description ? (
          <>
            <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-3">活动安排</h3>
            <div className="text-[14px] leading-[1.75] text-brand-ink-soft whitespace-pre-wrap p-5 rounded-2xl border border-brand-line bg-brand-cream">
              {hangout.description}
            </div>
          </>
        ) : (
          <div className="text-[13px] text-brand-muted italic p-5 rounded-2xl border border-dashed border-brand-line">
            发起人还没填活动安排。
          </div>
        )}
      </section>

      {/* Participants */}
      {participants && participants.length > 0 && (
        <section className="mt-10">
          <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-3">已加入的伙伴</h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((p: any) => (
              <span
                key={p.user_id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border border-brand-line bg-white text-[13px]"
              >
                <span className="w-6 h-6 rounded-full bg-brand-yellow-soft border border-brand-yellow-line flex items-center justify-center text-[11px] font-medium text-brand-ink">
                  {(p.profiles?.nickname ?? '?').charAt(0)}
                </span>
                {p.profiles?.nickname ?? '邻居'}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 群聊 — 仅成员（host 或 已加入）可见 */}
      {isMember && (
        <HangoutChat
          hangoutId={hangout.id}
          viewerId={user!.id}
          hostId={hangout.host_id}
          initialMessages={initialChatMessages}
          participantMap={participantMap}
        />
      )}

      {/* Safety reminder */}
      <section className="mt-12 p-5 rounded-2xl bg-brand-cream border border-brand-line">
        <h3 className="font-serif text-[15px] font-bold text-brand-ink mb-2">安全提醒</h3>
        <ul className="text-[13px] text-brand-ink-soft leading-relaxed space-y-1 list-none p-0">
          <li>· 公共场所见面，避开夜间偏僻地点</li>
          <li>· 财物 AA 事先约清楚，群聊记录平台留存</li>
          <li>· 加入活动后自动进入群聊；退出后无法继续读消息</li>
        </ul>
      </section>
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
        className={
          'text-[14px] md:text-[15px] font-medium ' +
          (accent ? 'text-brand-ink' : 'text-brand-ink-soft')
        }
      >
        {value}
      </div>
    </div>
  )
}
