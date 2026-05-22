import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = { title: '登录' }

export default function LoginPage() {
  return (
    <div className="container-page py-10 max-w-md">
      <div className="card p-7">
        <Link href="/" className="font-display text-2xl block mb-1">
          <span className="bg-brand-yellow px-2 py-0.5 rounded-lg">有人要吗</span>
        </Link>
        <h1 className="text-xl font-semibold mb-6">欢迎回来</h1>
        <LoginForm />
      </div>
    </div>
  )
}
