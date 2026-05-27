import Link from 'next/link'

export const metadata = {
  title: '关于我们',
  description:
    '面向海外华人的同城邻里社区。一个平台解决四件事 — 闲置二手、找师傅、找搭子、找工作。让漂泊的日子也有邻里温度。',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-9">
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted">
          ABOUT · 关于我们
        </span>
        <h1 className="font-serif text-[40px] md:text-[56px] font-bold tracking-[-0.025em] text-brand-ink m-0 mt-3 leading-[1.05]">
          海外华人的
          <br />
          <span className="bg-[linear-gradient(180deg,transparent_60%,#F4C300_60%,#F4C300_92%,transparent_92%)] px-1">
            邻里社区
          </span>
        </h1>
        <p className="mt-6 text-[16px] text-brand-ink-soft leading-relaxed max-w-[560px]">
          漂泊的日子也要有邻居。一个平台解决四件事 —
          <strong className="text-brand-ink">闲置二手</strong>、
          <strong className="text-brand-ink">找师傅</strong>、
          <strong className="text-brand-ink">找搭子</strong>、
          <strong className="text-brand-ink">找工作</strong>。
        </p>
      </div>

      <section className="prose prose-sm md:prose-base max-w-none space-y-7">
        <Block eyebrow="WHY" title="为什么做这个">
          海外的中文社区被分散在零散的微信群里 ——
          买二手要翻 50 个群、找翻译要群里 @所有人、约个球友要发三次朋友圈。
          老乡之间的信任明明是最高的，但工具一直停留在
          <em className="not-italic text-brand-ink">「群里发条消息然后等」</em>。
          我们想做一个让大家
          <strong className="text-brand-ink">不用从零打听</strong>的地方 ——
          想买想卖想约的事，直接在这里发，邻居们自然就来了。
        </Block>

        <Block eyebrow="HOW" title="四件事 · 一个原则">
          <ul className="m-0 list-none p-0 space-y-3 text-[14px] md:text-[15px] text-brand-ink-soft leading-relaxed">
            <li>
              <strong className="text-brand-ink">闲置二手</strong> ——
              发布 / 浏览 / 砍价 / 同城自取。包含搬家甩卖整批清空。
              第一版不抽佣、不站内支付，纯信息发布 + 双方自己谈。
            </li>
            <li>
              <strong className="text-brand-ink">找师傅</strong> ——
              法定翻译、搬家、家电维修、装修、月嫂、中医。每一位师傅都需要
              提交资质材料、人工审核通过才能展示。
            </li>
            <li>
              <strong className="text-brand-ink">找搭子</strong> ——
              饭搭子、球友、游戏车队、徒步、拼车、演唱会。
              一次性 / 每周定期 / 长期有效都行。加入活动自动进入群聊。
            </li>
            <li>
              <strong className="text-brand-ink">找工作</strong> ——
              本地华人招工广告。餐厅、保洁、保姆、家教、办公室工作等。
              每个用户同时最多 2 条招工广告。
            </li>
          </ul>
          <p className="mt-5 mb-0 text-[14px] md:text-[15px] text-brand-ink-soft leading-relaxed">
            <strong className="text-brand-ink">同城见面</strong>是我们的核心
            机制 —— 不是 GMV 不是流量，是
            <em className="not-italic text-brand-ink">真的认识邻居</em>。
          </p>
        </Block>

        <Block eyebrow="NOT" title="我们不做的事">
          <ul className="m-0 list-disc pl-6 space-y-2 text-[14px] md:text-[15px] text-brand-ink-soft leading-relaxed">
            <li>不抽取交易佣金 / 不站内支付</li>
            <li>不做担保交易 — 我们是信息发布平台不是中介</li>
            <li>不卖你的数据 / 不弹广告 / 不强行推送</li>
            <li>不绑定单一城市 — 你在柏林、慕尼黑、维也纳、汉堡都能用</li>
          </ul>
        </Block>

        <Block eyebrow="WHO" title="谁在做">
          <p className="m-0 text-[14px] md:text-[15px] text-brand-ink-soft leading-relaxed">
            一位住在维也纳的奥籍华人独立开发者。本职做房产中介，
            做这个站是因为
            <em className="not-italic text-brand-ink">「自己也想用」</em>。
            没有融资、没有团队、没有 KPI ——
            <strong className="text-brand-ink">只想让海外华人的日子好过一点</strong>。
          </p>
        </Block>

        <div className="rounded-2xl p-6 bg-brand-yellow-soft border border-brand-yellow-line mt-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-ink-soft mb-2">
            CONTACT · 联系我们
          </div>
          <h2 className="font-serif text-[22px] font-bold text-brand-ink m-0">
            建议、反馈、合作
          </h2>
          <p className="mt-3 mb-0 text-[14px] text-brand-ink-soft leading-relaxed">
            微信
            <strong className="font-mono font-bold text-brand-ink mx-1 tracking-[0.05em]">
              LUUUCCA
            </strong>
            ， 或邮件{' '}
            <a
              href="mailto:luuucca.97@gmail.com"
              className="font-mono font-medium text-brand-ink underline underline-offset-4 hover:text-brand-yellow transition-colors"
            >
              luuucca.97@gmail.com
            </a>
            。
          </p>
          <p className="mt-2 mb-0 text-[12px] text-brand-muted">
            想成为认证师傅？
            <Link href="/pros" className="underline underline-offset-4 ml-1">
              → 师傅入驻
            </Link>
            。 想报告 bug 或建议新功能？发邮件就行，48 小时内回。
          </p>
        </div>

        <p className="text-center text-[13px] text-brand-muted pt-6 border-t border-brand-line italic">
          你不要的，正好有人要 — 邻里之间的温柔循环 ✨
        </p>
      </section>
    </div>
  )
}

function Block({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="not-prose">
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-muted mb-2">
        — {eyebrow}
      </div>
      <h2 className="font-serif text-[26px] md:text-[32px] font-bold text-brand-ink m-0 mb-4 leading-[1.1]">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  )
}
