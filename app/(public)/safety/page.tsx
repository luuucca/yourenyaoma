import Link from 'next/link'

export const metadata = {
  title: '安全交易指南',
  description:
    '站内 IM · 公共场所交付 · 双向评价 — 邻里之间的小默契。海外华人社区如何安全用「有人要吗」做闲置/找师傅/找搭子。',
}

// Three pillars × actionable rules. Mirrors the SafetyStepsSection on the
// homepage but unpacked: each step has detailed dos/don'ts. Reader scrolls
// down to find tips for the three different surfaces (listings / pros /
// hangouts).
const STEPS = [
  {
    n: '01',
    t: '站内沟通',
    d: '砍价、约时间、问成色都用「砍一刀」+ 详情页的联系方式解锁。不要私加微信再聊 — 平台留痕，遇事可查。',
  },
  {
    n: '02',
    t: '同城见面',
    d: '咖啡馆、地铁站门口、超市门口、办公楼大堂。避开夜晚偏僻地点、对方家里、对方车里这种私人空间。',
  },
  {
    n: '03',
    t: '双向评价',
    d: '交易完后互评一下，沉淀长期信用。评价多的用户/师傅/搭子在所有列表里会优先展示。',
  },
] as const

const LISTING_TIPS = [
  { do: '✓ 当面验货后付款', dont: '✗ 不要提前转账，无论对方说什么理由' },
  { do: '✓ 现金 / 银行转账', dont: '✗ 不接受加密货币、礼品卡、PayPal 链接' },
  { do: '✓ 电子产品当场开机', dont: '✗ 不接受"密封盒不能拆"" 回家再试" ' },
  { do: '✓ 大件让卖家陪同验货', dont: '✗ 不要远程付款让快递寄过来' },
  { do: '✓ 保留所有聊天记录', dont: '✗ 出问题时聊天记录是关键证据' },
]

const PRO_TIPS = [
  { do: '✓ 选有「✓ 已认证」徽章的师傅', dont: '✗ 无认证的请直接绕开' },
  { do: '✓ 服务前签简单的报价单（微信文字也行）', dont: '✗ 不要先全款再开工' },
  { do: '✓ 大额服务（装修、月嫂）走银行转账', dont: '✗ 不要现金分多次付' },
  { do: '✓ 要求开发票/收据', dont: '✗ 不要"为了便宜不开票"' },
  { do: '✓ 不满意先平台投诉', dont: '✗ 不要直接给师傅打差评后失联' },
]

const BUDDIES_TIPS = [
  { do: '✓ 首次见面选公共场所 + 白天', dont: '✗ 不要单独去对方家里' },
  { do: '✓ 把活动信息和地点发给一个朋友', dont: '✗ 不要"突然变更地点"' },
  { do: '✓ 多人活动至少 3 人以上再去', dont: '✗ 不要 1v1 上车 / 上车前确认车牌' },
  { do: '✓ 拼车收发起人微信，写好 AA 价', dont: '✗ 不要先付全款给陌生人' },
  { do: '✓ 不舒服立刻退出 + 站内举报', dont: '✗ 不要为了"面子"勉强留下' },
]

export default function SafetyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-7">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted">
          SAFETY · 安全交易
        </span>
        <h1 className="font-serif text-[40px] md:text-[52px] font-bold tracking-[-0.025em] text-brand-ink m-0 mt-3 leading-[1.05]">
          站内沟通 · 同城见面 · 双向评价
        </h1>
        <p className="mt-5 text-[15px] text-brand-ink-soft leading-relaxed">
          「有人要吗」是<strong className="text-brand-ink">信息发布平台</strong>，
          不参与付款、不做担保交易、不抽佣。但邻里之间的几条小默契可以让 95%
          的骗局根本进不来。
        </p>
      </div>

      {/* 3 大步骤 */}
      <section className="space-y-4 mb-12">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl p-6 border border-brand-line bg-white"
          >
            <div className="flex items-start gap-5">
              <div className="font-serif text-[56px] font-bold text-brand-yellow leading-none shrink-0">
                {s.n}
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-[22px] font-bold m-0 text-brand-ink">
                  {s.t}
                </h2>
                <p className="text-[14px] leading-relaxed text-brand-ink-soft mt-2 mb-0">
                  {s.d}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3 大场景的 do / don't */}
      <ScenarioBlock
        eyebrow="LISTINGS · 闲置交易"
        title="买卖闲置物品时"
        tips={LISTING_TIPS}
      />
      <ScenarioBlock
        eyebrow="PROS · 找师傅"
        title="找师傅做服务时"
        tips={PRO_TIPS}
      />
      <ScenarioBlock
        eyebrow="BUDDIES · 找搭子"
        title="参加搭子活动时"
        tips={BUDDIES_TIPS}
      />

      {/* 举报通道 + 联系管理员 */}
      <section
        id="report"
        className="mt-12 rounded-2xl p-6 bg-brand-yellow-soft border border-brand-yellow-line"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-ink-soft mb-2">
          遇到可疑情况
        </div>
        <h2 className="font-serif text-[22px] font-bold text-brand-ink m-0">
          一键举报 · 1 小时内人工审核
        </h2>
        <ul className="mt-4 space-y-2 text-[14px] text-brand-ink-soft">
          <li>
            · 商品/活动/师傅卡片右上「举报」按钮 → 选原因 → 提交。
            举报 ≥ 2 次的内容会自动隐藏待审核。
          </li>
          <li>
            · 直接联系管理员微信：
            <strong className="font-mono font-bold text-brand-ink mx-1 tracking-[0.05em]">
              LUUUCCA
            </strong>
          </li>
          <li>
            · 紧急情况（人身威胁 / 严重诈骗）请第一时间报警，留好聊天记录截图。
            奥地利警察 <code className="font-mono">133</code>。
          </li>
        </ul>
        <p className="mt-5 mb-0 text-[12px] text-brand-muted">
          平台对举报内容保密。我们会优先保护举报人不被对方知道是谁举报的。
        </p>
      </section>

      <div className="mt-10 flex gap-3 flex-wrap">
        <Link
          href="/rules"
          className="text-[13px] text-brand-ink underline underline-offset-4 hover:text-brand-yellow transition-colors"
        >
          → 禁止发布内容清单
        </Link>
        <Link
          href="/privacy"
          className="text-[13px] text-brand-ink underline underline-offset-4 hover:text-brand-yellow transition-colors"
        >
          → 隐私政策
        </Link>
        <Link
          href="/terms"
          className="text-[13px] text-brand-ink underline underline-offset-4 hover:text-brand-yellow transition-colors"
        >
          → 使用条款
        </Link>
      </div>
    </div>
  )
}

function ScenarioBlock({
  eyebrow,
  title,
  tips,
}: {
  eyebrow: string
  title: string
  tips: { do: string; dont: string }[]
}) {
  return (
    <section className="mb-10">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted mb-2">
        — {eyebrow}
      </div>
      <h2 className="font-serif text-[26px] md:text-[32px] font-bold text-brand-ink m-0 mb-5 leading-[1.1]">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tips.map((t, i) => (
          <div key={i} className="grid grid-cols-1 gap-1">
            <div className="rounded-xl px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-900 leading-relaxed">
              {t.do}
            </div>
            <div className="rounded-xl px-4 py-2.5 bg-red-50 border border-red-200 text-[13px] text-red-900 leading-relaxed">
              {t.dont}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
