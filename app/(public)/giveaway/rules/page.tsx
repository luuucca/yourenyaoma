import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: '抽奖规则',
  description: '新邻居福利抽奖 — 注册并成功发布闲置即可参与。',
}

export default async function GiveawayRulesPage() {
  const supabase = createClient()

  const { data: active } = await supabase
    .from('giveaways')
    .select('id, title, prize, starts_at, ends_at, status')
    .eq('status', 'active')
    .order('ends_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data: pastDraws } = await supabase
    .from('giveaway_draws')
    .select(
      'winner_nickname, winner_email_masked, eligible_count, drawn_at, giveaways(title, prize)',
    )
    .order('drawn_at', { ascending: false })
    .limit(10)

  return (
    <article className="max-w-2xl mx-auto px-4 md:px-6 py-10">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted mb-3">
        GIVEAWAY · 新邻居福利
      </div>
      <h1 className="font-serif text-[36px] md:text-[48px] font-bold tracking-[-0.02em] text-brand-ink m-0 leading-[1.05]">
        注册 + 发布
        <br />
        <span className="text-highlight-yellow">就能抽奖</span>
      </h1>

      {/* 当前进行中的抽奖 */}
      {active ? (
        <div className="mt-7 rounded-2xl p-6 bg-brand-yellow-soft border border-brand-yellow-line">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-ink-soft mb-1">
            进行中
          </div>
          <h2 className="font-serif text-[22px] font-bold text-brand-ink m-0">
            {active.title}
          </h2>
          <div className="text-[15px] text-brand-ink mt-2">🎁 {active.prize}</div>
          <div className="text-[12px] font-mono text-brand-muted mt-2">
            截止 {new Date(active.ends_at).toLocaleString('zh-CN')}
          </div>
        </div>
      ) : (
        <p className="mt-7 text-[14px] text-brand-muted">
          目前没有进行中的抽奖。关注顶部公告条，下一期随时开始。
        </p>
      )}

      {/* 参与条件 */}
      <section className="mt-10">
        <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-4">
          怎么参与
        </h3>
        <ol className="space-y-3 m-0 p-0 list-none">
          {[
            '注册账号并完成邮箱验证',
            '发布至少 1 条闲置（审核通过 / 已发布状态）',
            '注册时间在本期抽奖启动之后',
          ].map((step, i) => (
            <li key={i} className="flex items-baseline gap-3 text-[14px] text-brand-ink-soft">
              <span className="font-serif font-bold text-brand-yellow text-[18px] leading-none shrink-0">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="text-[13px] text-brand-muted mt-4 leading-relaxed">
          满足以上三条 = 自动进入抽奖池，不需要额外报名。开奖时系统随机抽取，
          中奖者邮箱仅用于通知兑奖。
        </p>
      </section>

      {/* 公平性 + 合规 */}
      <section className="mt-8 text-[13px] text-brand-muted leading-relaxed space-y-2 border-t border-brand-line pt-6">
        <p>· 完全免费参与，不收任何费用，不强制购买 — 纯属新邻居福利，不是博彩。</p>
        <p>· 开奖记录当时合格人数，保证公平。中奖名单公示在本页下方。</p>
        <p>· 奖品不可转让、不可折现。中奖者邮箱仅用于兑奖通知，不作他用。</p>
      </section>

      {/* 历史中奖名单 */}
      {pastDraws && pastDraws.length > 0 && (
        <section className="mt-10">
          <h3 className="font-serif text-[18px] font-bold text-brand-ink mb-4">
            历史中奖
          </h3>
          <ul className="border border-brand-line rounded-2xl overflow-hidden divide-y divide-brand-line">
            {pastDraws.map((d: any, i: number) => (
              <li key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-brand-ink">
                    {d.winner_nickname}
                    <span className="text-[11px] font-mono text-brand-muted ml-2">
                      {d.winner_email_masked}
                    </span>
                  </div>
                  <div className="text-[12px] text-brand-muted">
                    {d.giveaways?.title} · 🎁 {d.giveaways?.prize}
                  </div>
                </div>
                <div className="text-[11px] font-mono text-brand-muted shrink-0">
                  {new Date(d.drawn_at).toLocaleDateString('zh-CN')}
                  <br />
                  {d.eligible_count} 人参与
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10">
        <Link
          href="/publish"
          className="inline-block bg-brand-ink text-white rounded-pill px-6 py-3 text-[14px] font-medium hover:opacity-85 transition-all"
        >
          去发布闲置 →
        </Link>
      </div>
    </article>
  )
}
