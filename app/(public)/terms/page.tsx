export const metadata = { title: '使用条款' }

export default function TermsPage() {
  return (
    <div className="container-page py-10 max-w-3xl prose prose-sm">
      <h1 className="font-display text-3xl mb-6">使用条款</h1>
      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="font-semibold text-base mb-2">1. 平台定位</h2>
          <p>
            「有人要吗」是面向维也纳本地华人社区的二手闲置信息发布平台。我们不参与付款、不提供担保、不收取交易佣金，仅提供信息发布、展示、搜索、联系与社区审核服务。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">2. 用户责任</h2>
          <p>
            发布者对商品的真实性、合法性、所有权负责。任何交易均为买卖双方私人行为，与平台无关。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">3. 禁止行为</h2>
          <p>
            请参阅<a href="/rules" className="text-brand-yellow underline">禁止发布</a>页面。违规账号会被封禁。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">4. 内容审核</h2>
          <p>
            平台对发布内容拥有最终审核权，可能根据规则隐藏、删除商品或封禁账号。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">5. 免责声明</h2>
          <p>
            平台不对买卖双方因交易产生的纠纷、损失负责。请仔细阅读<a href="/safety" className="text-brand-yellow underline">安全交易指南</a>。
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-base mb-2">6. 条款修改</h2>
          <p>
            平台保留随时修改本条款的权利，修改后会在本页面公布。继续使用即代表同意新条款。
          </p>
        </div>
        <p className="text-brand-muted text-xs pt-4 border-t border-brand-line">
          最近更新：2026 年
        </p>
      </section>
    </div>
  )
}
