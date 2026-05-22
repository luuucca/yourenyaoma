export const metadata = { title: '禁止发布' }

const rules = [
  { title: '假货 / 仿牌奢侈品 / 高仿', desc: '所有非正品商品禁止发布。' },
  { title: '盗版 / 破解软件 / 影视资源', desc: '侵犯版权的内容不允许售卖。' },
  { title: '烟草 / 电子烟 / 烟弹', desc: '不允许烟草及尼古丁产品。' },
  { title: '酒精饮料', desc: '酒类不在闲置交易范围内。' },
  { title: '处方药 / 受管制药品', desc: '所有处方药及类似产品禁止。' },
  { title: '毒品 / 大麻 / CBD / THC', desc: '即使在部分国家合法，平台一律禁止。' },
  { title: '武器 / 刀具 / 防身喷雾 / 弓弩', desc: '任何具有杀伤力的工具禁止。' },
  { title: '色情服务 / 援交', desc: '严禁色情相关内容与服务。' },
  { title: '赌博 / 博彩', desc: '不允许任何赌博相关物品或服务。' },
  { title: '虚假证件', desc: '假证、假驾照、假身份证等禁止。' },
  { title: '宠物买卖', desc: '保护动物福利，平台不开放活体宠物交易。' },
  { title: '自制食品', desc: '出于食品安全考量，不允许自制食品。' },
  { title: '明显偷盗物品', desc: '所有「不问出处」「无收据」的可疑物品禁止。' },
  { title: '金融贷款 / 投资理财广告', desc: '平台不是金融服务市场。' },
]

export default function RulesPage() {
  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="font-display text-3xl mb-2">禁止发布的内容</h1>
      <p className="text-brand-muted mb-6">
        以下内容禁止在「有人要吗」发布。违反规定的商品会被下架，严重者账号会被封禁。
      </p>
      <ul className="space-y-3">
        {rules.map((r) => (
          <li key={r.title} className="card p-4">
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm text-brand-muted mt-1">{r.desc}</div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-brand-muted mt-8">
        发现违规内容？请使用商品详情页的「举报」功能告诉我们。
      </p>
    </div>
  )
}
