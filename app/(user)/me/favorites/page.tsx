import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listing/ListingCard'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata = { title: '我的收藏' }

export default async function MyFavoritesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/me/favorites')

  const { data } = await supabase
    .from('favorites')
    .select(
      'listing_id, created_at, listings(id, title, price, district, condition, status, listing_images(image_url, sort_order))',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const listings = (data ?? [])
    .map((f: any) => f.listings)
    .filter(Boolean)
    .map((l: any) => ({
      id: l.id,
      title: l.title,
      price: Number(l.price),
      district: l.district,
      condition: l.condition,
      status: l.status,
      cover_url:
        [...(l.listing_images ?? [])].sort(
          (a: any, b: any) => a.sort_order - b.sort_order,
        )?.[0]?.image_url ?? null,
    }))

  return (
    <div className="container-page py-6">
      <h1 className="font-display text-2xl mb-5">我的收藏</h1>
      {listings.length === 0 ? (
        <EmptyState
          image="/illustrations/handbag.png"
          title="还没有收藏任何商品"
          action={
            <Link
              href="/browse"
              className="inline-block bg-brand-ink text-white px-4 py-2 rounded-pill text-sm font-medium"
            >
              去逛逛
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  )
}
