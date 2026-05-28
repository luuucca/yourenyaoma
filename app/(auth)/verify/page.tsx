import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata = { title: '请验证邮箱' }

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  return (
    <div className="container-page py-10 max-w-md">
      <div className="card p-7 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-xl font-semibold mb-2">请检查你的邮箱</h1>
        <p className="text-sm text-brand-muted mb-5 leading-relaxed">
          我们已经发送验证邮件到 <strong>{searchParams.email ?? '你的邮箱'}</strong>。
          点击邮件里的链接完成验证后，就可以登录发布闲置了。
        </p>

        {/* 邮件延迟提示 — 海外华人常用 QQ/163/Gmail，到达时间差异大 */}
        <div className="text-left text-xs text-brand-ink-soft bg-brand-yellow-soft border border-brand-yellow-line rounded-xl px-4 py-3 mb-5 leading-relaxed">
          <div className="font-medium text-brand-ink mb-1">⏳ 邮件可能要等几分钟</div>
          验证邮件有时会延迟 1–10 分钟才到，尤其是
          <strong className="text-brand-ink"> QQ / 163 / 126 </strong>
          邮箱。请耐心等一下，并记得翻一下
          <strong className="text-brand-ink">垃圾邮件 / 订阅邮件</strong>文件夹。
        </div>

        <p className="text-xs text-brand-muted mb-5">
          实在收不到？联系管理员微信
          <strong className="font-mono text-brand-ink mx-1">LUUUCCA</strong>
          帮你手动开通。
        </p>
        <Link href="/login">
          <Button variant="secondary" size="md">返回登录</Button>
        </Link>
      </div>
    </div>
  )
}
