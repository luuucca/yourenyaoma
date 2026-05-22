export const metadata = { title: '隐私政策' }

export default function PrivacyPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="font-display text-3xl mb-6">隐私政策</h1>
      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="font-semibold text-base mb-2">我们收集的信息</h2>
          <ul className="list-disc pl-5 space-y-1 text-brand-muted">
            <li>邮箱（用于注册、验证和登录）</li>
            <li>昵称、头像、所在维也纳区域（公开显示）</li>
            <li>可选：微信号、WhatsApp（仅登录用户点击解锁后可见）</li>
            <li>商品发布内容与图片</li>
            <li>IP 与登录时间（用于反作弊与安全）</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">我们如何使用信息</h2>
          <p className="text-brand-muted">
            用于提供平台核心功能：账户管理、商品发布与展示、内容审核、举报处理、与你沟通账户相关事宜。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">联系方式的可见性</h2>
          <p className="text-brand-muted">
            微信号与 WhatsApp 默认隐藏。仅当其他登录用户点击商品详情页的「显示联系方式」按钮时才可见。每次解锁会留下日志，用于反爬虫和反骚扰追溯。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">数据共享</h2>
          <p className="text-brand-muted">
            我们不出售你的数据。仅在以下情况共享：法律强制要求、保护平台与用户安全。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">你的权利</h2>
          <p className="text-brand-muted">
            你可以在「我的资料」中修改个人信息。如需删除账号，请发邮件给我们（见<a href="/about" className="underline text-brand-yellow">关于我们</a>）。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">Cookies</h2>
          <p className="text-brand-muted">
            我们仅使用必要的 Cookies（登录会话）。无广告追踪、无第三方分析（除部署服务商的基础统计外）。
          </p>
        </div>
        <p className="text-brand-muted text-xs pt-4 border-t border-brand-line">
          最近更新：2026 年
        </p>
      </section>
    </div>
  )
}
