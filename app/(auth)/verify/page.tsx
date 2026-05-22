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
        <p className="text-sm text-brand-muted mb-6 leading-relaxed">
          我们已经发送验证邮件到 <strong>{searchParams.email ?? '你的邮箱'}</strong>。
          点击邮件里的链接完成验证后，就可以登录发布闲置了。
        </p>
        <p className="text-xs text-brand-muted mb-5">
          没收到？检查垃圾邮件文件夹，或稍等几分钟。
        </p>
        <Link href="/login">
          <Button variant="secondary" size="md">返回登录</Button>
        </Link>
      </div>
    </div>
  )
}
