import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { MyListingActions } from '@/components/user/MyListingActions'
import { formatPrice } from '@/lib/utils/formatPrice'
import { formatRelativeTime } from '@/lib/utils/formatDate'

export const metadata = { title: '我的发布' }

const statusBadge: Record<string, { v: any; label: string }> = {
  pending: { v: 'pending', label: '待审核' },
  published: { v: 'yellow', label: '已上架' },
  rejected: { v: 'rejected', label: '已拒绝' },
  hidden: { v: 'hidden', label: '已隐藏' },
  sold: { v: 'sold', label: '已售出' },
  draft: { v: 'default', label: '草稿' },
}

export default async function MyListingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me/listings')

  const { data } = await supabase
    .from('listings')
    .select(
      'id, title, price, status, created_at, rejected_reason, listing_images(image_url, sort_order)',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container-page py-6 max-w-3xl">
      <h1 className="font-display text-2xl mb-5">我的发布</h1>
      {!data || data.length === 0 ? (
        <EmptyState
          image="/illustrations/chair.png"
          title="还没有发布过商品"
          action={
            <Link
              href="/publish"
              className="inline-block bg-brand-ink text-white px-4 py-2 rounded-pill text-sm font-medium"
            >
              立即发布
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {data.map((l: any) => {
            const cover = [...(l.listing_images ?? [])].sort(
              (a: any, b: any) => a.sort_order - b.sort_order,
            )?.[0]?.image_url
            const sb = statusBadge[l.status] ?? { v: 'default', label: l.status }
            return (
              <li key={l.id} className="card p-3 flex gap-3 items-stretch">
                <Link
                  href={`/listing/${l.id}`}
                  className="shrink-0 w-20 h-20 rounded-lg bg-brand-cream overflow-hidden relative"
                >
                  {cover ? (
                    <Image src={cover} alt="" fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xl">📦</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={sb.v}>{sb.label}</Badge>
                    <span className="text-xs text-brand-muted">
                      {formatRelativeTime(l.created_at)}
                    </span>
                  </div>
                  <Link
                    href={`/listing/${l.id}`}
                    className="font-medium line-clamp-1 hover:underline"
                  >
                    {l.title}
                  </Link>
                  <div className="text-sm font-semibold mt-1">
                    {formatPrice(Number(l.price))}
                  </div>
                  {l.status === 'rejected' && l.rejected_reason && (
                    <div className="text-xs text-brand-danger mt-1">
                      拒绝原因：{l.rejected_reason}
                    </div>
                  )}
                </div>
                <MyListingActions listingId={l.id} status={l.status} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
