import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata = { title: '注册' }

export default function SignupPage() {
  return (
    <div className="container-page py-10 max-w-md">
      <div className="card p-7">
        <Link href="/" className="font-display text-2xl block mb-1">
          <span className="bg-brand-yellow px-2 py-0.5 rounded-lg">有人要吗</span>
        </Link>
        <h1 className="text-xl font-semibold mb-6">创建新账号</h1>
        <SignupForm />

        {/* Email delivery fallback notice — QQ / 163 / 新浪 / 139 reject the
            default Supabase SMTP almost always. Until we wire a custom SMTP
            (Mailgun / SES / 阿里云) or SMS, point users at admin manual approval. */}
        <div className="mt-6 p-4 rounded-2xl bg-brand-yellow-soft border border-brand-yellow-line">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-ink-soft mb-2">
            收不到验证邮件？
          </div>
          <p className="text-[13px] leading-relaxed text-brand-ink-soft m-0">
            国内邮箱（QQ / 163 / 新浪）有时收不到验证邮件 —— 这是 Supabase 默认 SMTP 的已知问题，
            <strong className="text-brand-ink">不是你的错</strong>。
          </p>
          <p className="text-[13px] leading-relaxed text-brand-ink-soft mt-2 mb-0">
            等几分钟还是没收到？发邮件给{' '}
            <a
              href="mailto:luuucca.97@gmail.com?subject=%E6%9C%89%E4%BA%BA%E8%A6%81%E5%90%97%20%C2%B7%20%E6%89%8B%E5%8A%A8%E9%AA%8C%E8%AF%81%E9%82%AE%E7%AE%B1&body=Hi%2C%0A%0A%E6%88%91%E5%88%9A%E5%9C%A8%20%E6%9C%89%E4%BA%BA%E8%A6%81%E5%90%97%20%E6%B3%A8%E5%86%8C%E4%BA%86%E8%B4%A6%E5%8F%B7%EF%BC%8C%E4%BD%86%E6%B2%A1%E6%94%B6%E5%88%B0%E9%AA%8C%E8%AF%81%E9%82%AE%E4%BB%B6%E3%80%82%E9%BA%BB%E7%83%A6%E5%B8%AE%E6%88%91%E6%89%8B%E5%8A%A8%E9%AA%8C%E8%AF%81%E4%B8%80%E4%B8%8B%EF%BC%9A%0A%0A%E6%B3%A8%E5%86%8C%E9%82%AE%E7%AE%B1%EF%BC%9A%0A%E6%98%B5%E7%A7%B0%EF%BC%9A%0A%0A%E8%B0%A2%E8%B0%A2%EF%BC%81"
              className="text-brand-ink font-medium underline underline-offset-2 hover:no-underline"
            >
              luuucca.97@gmail.com
            </a>
            ，说明你的注册邮箱和昵称，管理员一小时内手动给你开通。
          </p>
          <p className="text-[12px] text-brand-muted mt-3 mb-0">
            建议：用 Gmail / Outlook / iCloud 邮箱收件最稳。
          </p>
        </div>
      </div>
    </div>
  )
}
