import { createClient } from '@/lib/supabase/server'

// Yellow announcement marquee — sits at the top of every page above the nav.
// 抽奖文案只在真的有进行中抽奖时才出现（动态查 giveaways）；其余文案常驻。
const BASE_MESSAGES = [
  '海外华人邻里社区 · 闲置 · 师傅 · 搭子 · 找工作',
  '搬家季 · 整屋打包好物上线 · 包圆 / 单件都行',
  '找师傅 · 认证师傅入驻 · 中德双语沟通',
  '找搭子 · 加入活动自动进群聊 · 球友 / 饭搭子 / 车队',
  '安全交易 · 站内 IM + 公共场所交付 + 双向评价',
]

export default async function AnnouncementMarquee() {
  // 有进行中的抽奖才在头条喊一句（带上奖品名，更有吸引力）
  let messages = [...BASE_MESSAGES]
  try {
    const supabase = createClient()
    const { data: active } = await supabase
      .from('giveaways')
      .select('prize')
      .eq('status', 'active')
      .order('ends_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (active?.prize) {
      messages = [
        `🎁 新邻居福利 · 注册并发布闲置即可抽 ${active.prize} · 详见 /giveaway/rules`,
        ...BASE_MESSAGES,
      ]
    }
  } catch {
    // 查询失败就用基础文案，不影响渲染
  }

  // Duplicate the list so the marquee loops seamlessly.
  const items = [...messages, ...messages]
  return (
    <div
      role="marquee"
      aria-live="off"
      aria-label="平台公告"
      className="group bg-brand-yellow text-brand-ink border-b border-[#e5b500] overflow-hidden whitespace-nowrap py-[10px] text-[12px] font-medium tracking-[0.04em] select-none"
    >
      <div className="inline-flex gap-14 pl-[100%] animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {items.map((m, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-ink inline-block" aria-hidden />
            {m}
          </span>
        ))}
      </div>
    </div>
  )
}
