'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { banUser, unbanUser, confirmUserEmail } from '@/app/(admin)/admin/actions'

export function UserActions({
  userId,
  role,
  emailConfirmed,
}: {
  userId: string
  role: string
  /** Whether this user's email is verified. Optional — when omitted the manual-confirm button is hidden. */
  emailConfirmed?: boolean
}) {
  const { show } = useToast()
  const [loading, setLoading] = useState(false)

  async function confirmEmail() {
    setLoading(true)
    const r = await confirmUserEmail(userId)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else show('已手动验证邮箱', 'success')
  }

  async function ban() {
    const reason = window.prompt('封禁原因（可选）：')
    if (reason === null) return
    setLoading(true)
    const r = await banUser(userId, reason || undefined)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else show('已封禁', 'success')
  }

  async function unban() {
    setLoading(true)
    const r = await unbanUser(userId)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else show('已解封', 'success')
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {emailConfirmed === false && (
        <Button size="sm" variant="primary" onClick={confirmEmail} loading={loading}>
          手动验证邮箱
        </Button>
      )}
      {role !== 'admin' && role !== 'banned' && (
        <Button size="sm" variant="danger" onClick={ban} loading={loading}>
          封禁
        </Button>
      )}
      {role === 'banned' && (
        <Button size="sm" variant="secondary" onClick={unban} loading={loading}>
          解封
        </Button>
      )}
    </div>
  )
}
