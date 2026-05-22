'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signUpSchema } from '@/lib/validations/profile'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import TurnstileWidget from './TurnstileWidget'

type NicknameStatus =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available' }
  | { kind: 'taken' }
  | { kind: 'invalid'; message: string }

export function SignupForm() {
  const router = useRouter()
  const { show } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>({ kind: 'idle' })
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const turnstileEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  // Debounced nickname availability check (400ms)
  useEffect(() => {
    const trimmed = nickname.trim()
    if (trimmed.length === 0) {
      setNicknameStatus({ kind: 'idle' })
      return
    }
    if (trimmed.length < 2) {
      setNicknameStatus({ kind: 'invalid', message: '至少 2 个字符' })
      return
    }
    setNicknameStatus({ kind: 'checking' })
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/check-nickname?nickname=${encodeURIComponent(trimmed)}`,
          { cache: 'no-store' },
        )
        const data = await res.json()
        if (data.available) {
          setNicknameStatus({ kind: 'available' })
        } else if (data.reason === 'reserved') {
          setNicknameStatus({ kind: 'invalid', message: '此昵称已被保留，请换一个' })
        } else if (data.reason === 'too_short') {
          setNicknameStatus({ kind: 'invalid', message: '至少 2 个字符' })
        } else if (data.reason === 'too_long') {
          setNicknameStatus({ kind: 'invalid', message: '最多 24 个字符' })
        } else {
          setNicknameStatus({ kind: 'taken' })
        }
      } catch {
        setNicknameStatus({ kind: 'idle' })
      }
    }, 400)
    return () => clearTimeout(t)
  }, [nickname])

  const onTurnstileToken = useCallback((token: string | null) => {
    setCaptchaToken(token)
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    if (nicknameStatus.kind === 'taken') {
      setErrors({ nickname: '昵称已被使用，请换一个' })
      return
    }
    if (nicknameStatus.kind === 'invalid') {
      setErrors({ nickname: nicknameStatus.message })
      return
    }
    if (nicknameStatus.kind === 'checking') {
      setErrors({ nickname: '正在检查昵称…请稍候' })
      return
    }

    const result = signUpSchema.safeParse({ email, password, nickname })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    if (turnstileEnabled && !captchaToken) {
      setErrors({ password: '请先完成人机验证' })
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // When configured, Supabase verifies the token against Cloudflare
        // Turnstile server-side before creating the user.
        ...(captchaToken ? { captchaToken } : {}),
      },
    })
    setLoading(false)
    if (error) {
      show(error.message, 'error')
      return
    }
    router.push('/verify?email=' + encodeURIComponent(email))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input
          name="nickname"
          label="昵称（其他用户能看到）"
          placeholder="例如：阿瓜"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          error={errors.nickname}
          autoComplete="nickname"
        />
        {/* Realtime availability hint */}
        {nickname.trim().length > 0 && !errors.nickname && (
          <div className="mt-1 text-[12px]">
            {nicknameStatus.kind === 'checking' && (
              <span className="text-brand-muted">检查中…</span>
            )}
            {nicknameStatus.kind === 'available' && (
              <span className="text-brand-free">✓ 可以使用</span>
            )}
            {nicknameStatus.kind === 'taken' && (
              <span className="text-red-600">✗ 此昵称已被使用</span>
            )}
            {nicknameStatus.kind === 'invalid' && (
              <span className="text-red-600">✗ {nicknameStatus.message}</span>
            )}
          </div>
        )}
      </div>

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
        hint="设置一个强密码，至少 8 个字符"
        autoComplete="new-password"
      />

      {/* Cloudflare Turnstile — free, privacy-focused alternative to reCAPTCHA */}
      <TurnstileWidget onToken={onTurnstileToken} />

      <Button
        type="submit"
        size="lg"
        loading={loading}
        className="w-full"
        disabled={
          nicknameStatus.kind === 'taken' ||
          nicknameStatus.kind === 'invalid' ||
          (turnstileEnabled && !captchaToken)
        }
      >
        注册
      </Button>

      <div className="text-sm text-center text-brand-muted">
        已有账号？
        <Link href="/login" className="text-brand-ink font-medium hover:underline ml-1">
          立即登录
        </Link>
      </div>
      <p className="text-xs text-brand-muted text-center leading-relaxed">
        注册即代表同意我们的
        <Link href="/terms" className="underline mx-0.5">使用条款</Link>
        和
        <Link href="/privacy" className="underline mx-0.5">隐私政策</Link>。
      </p>
    </form>
  )
}
