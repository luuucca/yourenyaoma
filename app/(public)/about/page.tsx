export const metadata = { title: '关于我们' }

export default function AboutPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="font-display text-3xl mb-6">关于「有人要吗」</h1>

      <section className="space-y-6 text-sm leading-relaxed">
        <p>
          「有人要吗」是面向<strong>维也纳本地华人社区</strong>的二手闲置交易平台。
          我们相信：你不要的东西，正好有人需要。让闲置流动起来，比扔进垃圾桶更有意义。
        </p>

        <div className="card p-5 bg-brand-yellow-soft/30 border-l-4 border-brand-yellow">
          <div className="font-semibold mb-1">我们做什么</div>
          <ul className="list-disc pl-5 space-y-1 text-brand-ink-soft">
            <li>提供清爽的中文界面，让发布与浏览闲置变简单</li>
            <li>专注维也纳 23 个邮编区，本地自取交易</li>
            <li>社区共同维护：举报、审核、规则</li>
          </ul>
        </div>

        <div className="card p-5">
          <div className="font-semibold mb-1">我们不做什么</div>
          <ul className="list-disc pl-5 space-y-1 text-brand-ink-soft">
            <li>不参与付款、不做担保交易</li>
            <li>不抽取交易佣金</li>
            <li>不卖你的数据</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-base mb-2">联系我们</h2>
          <p className="text-brand-muted">
            建议、反馈、合作：写信到 hi@youren-yaoma.example（请替换为你的真实邮箱）
          </p>
        </div>

        <p className="text-brand-muted text-xs pt-4 border-t border-brand-line">
          你不要的，正好有人要 — 让好物继续发光 ✨
        </p>
      </section>
    </div>
  )
}
