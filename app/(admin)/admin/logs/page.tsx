import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime } from '@/lib/utils/formatDate'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '审核记录' }

const actionLabel: Record<string, string> = {
  approve: '✓ 通过',
  reject: '✗ 拒绝',
  hide: '隐藏',
  unhide: '取消隐藏',
  ban_user: '封禁用户',
  unban_user: '解封用户',
}

export default async function AdminLogsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('moderation_logs')
    .select(
      'id, action, reason, created_at, listing_id, user_id, profiles!moderation_logs_admin_id_fkey(nickname), listings(title)',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="container-page py-6 max-w-3xl">
      <h1 className="font-display text-2xl mb-5">审核记录</h1>
      {!data || data.length === 0 ? (
        <div className="card p-12 text-center text-brand-muted">
          还没有审核记录
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((l: any) => (
            <li
              key={l.id}
              className="card p-3 text-sm flex items-center gap-3 flex-wrap"
            >
              <span className="font-medium shrink-0">
                {actionLabel[l.action] ?? l.action}
              </span>
              {l.listings?.title && l.listing_id && (
                <Link
                  href={`/listing/${l.listing_id}`}
                  className="text-brand-ink-soft hover:underline truncate"
                  target="_blank"
                >
                  → {l.listings.title}
                </Link>
              )}
              {l.reason && <span className="text-brand-muted">（{l.reason}）</span>}
              <span className="text-xs text-brand-muted ml-auto">
                {l.profiles?.nickname ?? '系统'} · {formatRelativeTime(l.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
