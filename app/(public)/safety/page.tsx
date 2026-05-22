export const metadata = { title: '安全交易指南' }

const tips = [
  { title: '建议本地当面交易', desc: '维也纳同区或邻区，地铁站或咖啡馆门口都是不错的选择。' },
  { title: '不要提前转账', desc: '无论对方说什么理由，先付钱再看货都是高风险行为。' },
  { title: '不要点击陌生付款链接', desc: '诈骗常伪装成「付款页面」「PayPal 验证」，请直接拒绝。' },
  { title: '不要使用加密货币付款', desc: '加密货币交易无法追溯、无法撤销，是诈骗高发场景。' },
  { title: '贵重物品请当面验货后付款', desc: '电子产品、相机、手表等，开机检查、确认序列号再付款。' },
  { title: '选择公共场所交易', desc: '尽量在咖啡馆、地铁站、超市门口等人多的地方。' },
  { title: '相信你的直觉', desc: '如果对方一直催促、不肯当面、要求加密通讯，请直接放弃。' },
]

export default function SafetyPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="font-display text-3xl mb-2">安全交易指南</h1>
      <p className="text-brand-muted mb-6">
        「有人要吗」是信息发布平台，不参与付款和担保。请阅读以下提示，保护自己。
      </p>
      <ul className="space-y-3">
        {tips.map((t) => (
          <li key={t.title} className="card p-4 border-l-4 border-brand-yellow">
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-brand-muted mt-1">{t.desc}</div>
          </li>
        ))}
      </ul>
      <div className="mt-8 card p-5 bg-brand-yellow-soft/30 border border-brand-yellow">
        <div className="font-semibold mb-2">遇到可疑情况？</div>
        <p className="text-sm">
          请在商品详情页点击「举报」，并选择「疑似诈骗」。我们会立即审核并下架可疑商品。
        </p>
      </div>
    </div>
  )
}
