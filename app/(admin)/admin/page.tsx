import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '管理后台' }

export default async function AdminPage() {
  const supabase = createClient()

  const [pending, openReports, hidden, banned] = await Promise.all([
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'hidden'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'banned'),
  ])

  return (
    <div className="container-page py-6 max-w-3xl">
      <h1 className="font-display text-2xl mb-5">管理后台</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <AdminCard
          href="/admin/pending"
          label="待审核"
          count={pending.count ?? 0}
          icon="🕐"
          highlight={(pending.count ?? 0) > 0}
        />
        <AdminCard
          href="/admin/reports"
          label="待处理举报"
          count={openReports.count ?? 0}
          icon="🚩"
          highlight={(openReports.count ?? 0) > 0}
        />
        <AdminCard
          href="/admin/pending?status=hidden"
          label="已隐藏"
          count={hidden.count ?? 0}
          icon="🙈"
        />
        <AdminCard
          href="/admin/users"
          label="用户管理"
          count={banned.count ?? 0}
          icon="👤"
          countSuffix=" 封禁中"
        />
        <AdminCard href="/admin/logs" label="审核记录" icon="📋" />
      </div>
    </div>
  )
}

function AdminCard({
  href,
  label,
  count,
  icon,
  highlight,
  countSuffix,
}: {
  href: string
  label: string
  count?: number
  icon: string
  highlight?: boolean
  countSuffix?: string
}) {
  return (
    <Link
      href={href}
      className={`card p-4 hover:shadow-lg transition flex flex-col gap-1 ${highlight ? 'border-2 border-brand-yellow' : ''}`}
    >
      <div className="text-2xl">{icon}</div>
      <div className="font-medium">{label}</div>
      {count !== undefined && (
        <div className="text-2xl font-bold text-brand-yellow">
          {count}
          {countSuffix && (
            <span className="text-xs text-brand-muted font-normal ml-1">{countSuffix}</span>
          )}
        </div>
      )}
    </Link>
  )
}
