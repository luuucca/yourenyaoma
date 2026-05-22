'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signInSchema } from '@/lib/validations/profile'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/me'
  const { show } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    const result = signInSchema.safeParse({ email, password })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      show(
        error.message === 'Invalid login credentials' ? '邮箱或密码不正确' : error.message,
        'error',
      )
      return
    }
    show('登录成功', 'success')
    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="email"
        name="email"
        label="邮箱"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoComplete="email"
      />
      <Input
        type="password"
        name="password"
        label="密码"
        placeholder="至少 8 位"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        autoComplete="current-password"
      />
      <Button type="submit" size="lg" loading={loading} className="w-full">
        登录
      </Button>
      <div className="text-sm text-center text-brand-muted">
        还没有账号？
        <Link
          href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
          className="text-brand-ink font-medium hover:underline ml-1"
        >
          立即注册
        </Link>
      </div>
    </form>
  )
}
