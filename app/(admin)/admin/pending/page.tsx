import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ModerationCard } from '@/components/admin/ModerationCard'

// Admin pages must always read fresh data — never cache, never prerender.
// Without this, server-side fetches against Supabase can be served from
// Next.js's data cache and stale "0 pending listings" sticks around even
// after a new listing is created.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '审核' }

const validStatuses = ['pending', 'hidden', 'rejected'] as const
type AdminStatus = (typeof validStatuses)[number]

export default async function AdminPendingPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()
  const status = (validStatuses as readonly string[]).includes(searchParams.status ?? '')
    ? (searchParams.status as AdminStatus)
    : 'pending'

  // Disambiguate the listings→profiles embed: listings has TWO FK paths to
  // profiles (direct user_id, and indirect through favorites). PostgREST
  // refuses ambiguous embeds with PGRST201, so we name the FK explicitly.
  const { data } = await supabase
    .from('listings')
    .select(
      '*, listing_images(image_url, sort_order), profiles!listings_user_id_fkey(nickname, district, approved_listing_count)',
    )
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50)

  const titleMap: Record<AdminStatus, string> = {
    pending: '待审核',
    hidden: '已隐藏',
    rejected: '已拒绝',
  }

  return (
    <div className="container-page py-6">
      <div className="mb-5 flex items-center gap-2">
        <h1 className="font-display text-2xl mr-3">{titleMap[status]}</h1>
        <Tab href="/admin/pending" active={status === 'pending'}>待审核</Tab>
        <Tab href="/admin/pending?status=hidden" active={status === 'hidden'}>已隐藏</Tab>
        <Tab href="/admin/pending?status=rejected" active={status === 'rejected'}>已拒绝</Tab>
      </div>
      {!data || data.length === 0 ? (
        <div className="card p-12 text-center text-brand-muted">
          没有 {titleMap[status]} 的商品
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((l: any) => (
            <ModerationCard key={l.id} listing={l} status={status} />
          ))}
        </div>
      )}
    </div>
  )
}

function Tab({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-pill text-sm ${
        active
          ? 'bg-brand-ink text-white'
          : 'bg-white border border-brand-line hover:border-brand-ink'
      }`}
    >
      {children}
    </Link>
  )
}
