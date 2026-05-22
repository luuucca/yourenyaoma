import { UserActions } from '@/components/admin/UserActions'
import { formatRelativeTime } from '@/lib/utils/formatDate'
import { DISTRICT_LABEL } from '@/lib/constants/districts'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '用户管理' }

type AuthUser = {
  id: string
  email?: string
  email_confirmed_at?: string | null
  created_at: string
}

type ProfileRow = {
  id: string
  nickname: string | null
  district: string | null
  role: string
  approved_listing_count: number
  created_at: string
}

// Fetch auth.users via service_role + profiles via the user's session so we
// can merge `email_confirmed_at` into the existing list. The Supabase JS
// client doesn't expose admin user management, so we call the REST endpoint
// directly.
async function fetchAuthUsers(): Promise<Map<string, AuthUser>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    cache: 'no-store',
  })
  if (!res.ok) return new Map()
  const data = await res.json()
  const users: AuthUser[] = data.users || data
  return new Map(users.map((u) => [u.id, u]))
}

async function fetchProfiles(q?: string): Promise<ProfileRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const search = q ? `&nickname=ilike.${encodeURIComponent('%' + q + '%')}` : ''
  const res = await fetch(
    `${url}/rest/v1/profiles?select=id,nickname,district,role,approved_listing_count,created_at&order=created_at.desc&limit=100${search}`,
    {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: 'no-store',
    },
  )
  if (!res.ok) return []
  return res.json()
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string }
}) {
  const [authMap, profiles] = await Promise.all([
    fetchAuthUsers(),
    fetchProfiles(searchParams.q),
  ])

  let rows = profiles.map((p) => ({
    ...p,
    email: authMap.get(p.id)?.email,
    emailConfirmed: !!authMap.get(p.id)?.email_confirmed_at,
  }))

  if (searchParams.filter === 'unconfirmed') {
    rows = rows.filter((r) => !r.emailConfirmed)
  }

  const unconfirmedCount = rows.length === 0 ? 0 : profiles.filter((p) => !authMap.get(p.id)?.email_confirmed_at).length

  return (
    <div className="container-page py-6 max-w-3xl">
      <div className="flex items-baseline justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-display text-2xl">用户管理</h1>
        <div className="flex gap-2 text-sm">
          <FilterTab href="/admin/users" active={searchParams.filter !== 'unconfirmed'}>
            全部
          </FilterTab>
          <FilterTab href="/admin/users?filter=unconfirmed" active={searchParams.filter === 'unconfirmed'} highlight={unconfirmedCount > 0}>
            未验证邮箱 {unconfirmedCount > 0 ? `(${unconfirmedCount})` : ''}
          </FilterTab>
        </div>
      </div>

      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="搜索昵称…"
          className="flex-1 h-10 px-3 rounded-pill border border-brand-line bg-white outline-none focus:border-brand-yellow"
        />
        <button className="h-10 px-4 bg-brand-ink text-white rounded-pill">搜索</button>
      </form>

      <ul className="space-y-2">
        {rows.length === 0 && (
          <li className="card p-12 text-center text-brand-muted">没有符合条件的用户</li>
        )}
        {rows.map((u) => (
          <li key={u.id} className="card p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-yellow-soft flex items-center justify-center font-medium shrink-0">
              {u.nickname?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium flex items-center gap-2 flex-wrap">
                {u.nickname}
                {u.role === 'admin' && (
                  <span className="chip bg-brand-yellow text-brand-ink">管理员</span>
                )}
                {u.role === 'banned' && (
                  <span className="chip bg-red-100 text-red-700">已封禁</span>
                )}
                {!u.emailConfirmed && (
                  <span className="chip bg-orange-100 text-orange-700">未验证邮箱</span>
                )}
              </div>
              <div className="text-xs text-brand-muted truncate">
                {u.email && <span className="font-mono">{u.email} · </span>}
                {u.district ? DISTRICT_LABEL[u.district]?.slice(0, 5) : '未填区域'} · 已通过{' '}
                {u.approved_listing_count} 件 · 加入 {formatRelativeTime(u.created_at)}
              </div>
            </div>
            <UserActions userId={u.id} role={u.role} emailConfirmed={u.emailConfirmed} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function FilterTab({
  href,
  active,
  highlight,
  children,
}: {
  href: string
  active: boolean
  highlight?: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className={
        'px-3 py-1.5 rounded-pill transition-colors ' +
        (active
          ? 'bg-brand-ink text-white'
          : highlight
            ? 'bg-orange-100 text-orange-700 border border-orange-200'
            : 'bg-white border border-brand-line hover:border-brand-ink')
      }
    >
      {children}
    </a>
  )
}
