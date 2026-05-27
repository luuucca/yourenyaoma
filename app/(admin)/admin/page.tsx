import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '管理后台' }

type AuthUser = { id: string; email?: string; email_confirmed_at?: string | null }

async function fetchAuthUsers(): Promise<AuthUser[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return []
  try {
    const res = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.users || data
  } catch {
    return []
  }
}

export default async function AdminPage() {
  const supabase = createClient()

  // 当前时间锚点
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 6) // 含今天的近 7 天
  const todayISO = today.toISOString()
  const weekAgoISO = weekAgo.toISOString()

  const [
    pending,
    openReports,
    hidden,
    banned,
    soldCount,
    publishedCount,
    totalUsers,
    todayUsers,
    weekUsers,
    recentUsers,
    weeklySignups,
    offersCount,
    hangoutsActive,
    prosCount,
    authUsers,
  ] = await Promise.all([
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
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sold'),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayISO),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgoISO),
    // 最近 10 个注册的 profile
    supabase
      .from('profiles')
      .select('id, nickname, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    // 近 7 天每天的注册数（前端聚合）
    supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', weekAgoISO)
      .order('created_at', { ascending: true }),
    supabase.from('price_offers').select('id', { count: 'exact', head: true }),
    supabase
      .from('hangouts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase.from('pros').select('id', { count: 'exact', head: true }),
    fetchAuthUsers(),
  ])

  const confirmedCount = authUsers.filter((u) => u.email_confirmed_at).length
  const totalUserCount = totalUsers.count ?? 0

  // 7 天注册量分组（YYYY-MM-DD → count）
  const dailyCounts: { date: string; count: number; label: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    dailyCounts.push({ date: key, count: 0, label })
  }
  ;(weeklySignups.data || []).forEach((row: any) => {
    const key = (row.created_at as string).slice(0, 10)
    const slot = dailyCounts.find((d) => d.date === key)
    if (slot) slot.count++
  })
  const maxDaily = Math.max(1, ...dailyCounts.map((d) => d.count))

  return (
    <div className="container-page py-6 max-w-4xl">
      <h1 className="font-display text-2xl mb-6">管理后台</h1>

      {/* 用户统计板块 */}
      <section className="mb-7">
        <h2 className="text-[12px] font-mono tracking-[0.18em] text-brand-muted uppercase font-medium mb-3">
          — users
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard label="总用户数" value={totalUserCount} accent />
          <StatCard
            label="今日新增"
            value={todayUsers.count ?? 0}
            suffix={(todayUsers.count ?? 0) > 0 ? ' ↑' : ''}
          />
          <StatCard label="近 7 日新增" value={weekUsers.count ?? 0} />
          <StatCard
            label="已验邮箱"
            value={confirmedCount}
            suffix={` / ${totalUserCount}`}
            subtle
          />
        </div>

        {/* 近 7 天注册曲线 */}
        <div className="border border-brand-line rounded-2xl p-4 bg-white">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[12px] font-medium text-brand-ink-soft">
              近 7 天注册量
            </span>
            <span className="text-[11px] font-mono text-brand-muted">
              共 {weekUsers.count ?? 0} 人
            </span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {dailyCounts.map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1.5"
                title={`${d.date}: ${d.count} 人`}
              >
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-brand-yellow rounded-sm transition-all"
                    style={{
                      height: `${(d.count / maxDaily) * 100}%`,
                      minHeight: d.count > 0 ? '4px' : '0',
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-brand-muted">
                  {d.label}
                </span>
                <span className="text-[11px] font-semibold text-brand-ink leading-none">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 最近注册的 10 个用户 */}
        {recentUsers.data && recentUsers.data.length > 0 && (
          <div className="border border-brand-line rounded-2xl mt-3 overflow-hidden">
            <div className="bg-brand-cream px-4 py-2.5 text-[12px] font-medium text-brand-ink-soft border-b border-brand-line flex items-baseline justify-between">
              <span>最近 10 个注册</span>
              <Link
                href="/admin/users"
                className="text-[11px] text-brand-ink-soft underline underline-offset-2"
              >
                全部用户 →
              </Link>
            </div>
            <ul className="divide-y divide-brand-line">
              {recentUsers.data.map((u: any) => (
                <li
                  key={u.id}
                  className="px-4 py-2.5 flex items-baseline justify-between text-[13px]"
                >
                  <span className="font-medium">
                    {u.nickname || u.id.slice(0, 8)}
                  </span>
                  <span className="text-[11px] font-mono text-brand-muted">
                    {new Date(u.created_at).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 内容/审核板块 */}
      <section className="mb-7">
        <h2 className="text-[12px] font-mono tracking-[0.18em] text-brand-muted uppercase font-medium mb-3">
          — moderation
        </h2>
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
      </section>

      {/* 平台 KPI */}
      <section>
        <h2 className="text-[12px] font-mono tracking-[0.18em] text-brand-muted uppercase font-medium mb-3">
          — platform
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="已发布闲置" value={publishedCount.count ?? 0} />
          <StatCard label="已售出" value={soldCount.count ?? 0} />
          <StatCard label="砍一刀总数" value={offersCount.count ?? 0} />
          <StatCard label="进行中搭子" value={hangoutsActive.count ?? 0} />
          <StatCard label="入驻师傅" value={prosCount.count ?? 0} subtle />
        </div>
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  suffix,
  accent,
  subtle,
}: {
  label: string
  value: number
  suffix?: string
  accent?: boolean
  subtle?: boolean
}) {
  return (
    <div
      className={`border rounded-2xl px-4 py-3.5 bg-white ${
        accent ? 'border-brand-ink' : 'border-brand-line'
      }`}
    >
      <div className="text-[11px] font-mono text-brand-muted tracking-[0.1em] uppercase mb-1">
        {label}
      </div>
      <div
        className={`text-[26px] font-bold leading-none ${
          subtle ? 'text-brand-ink-soft' : 'text-brand-ink'
        }`}
      >
        {value}
        {suffix && (
          <span className="text-[12px] font-mono text-brand-muted ml-1 font-normal">
            {suffix}
          </span>
        )}
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
