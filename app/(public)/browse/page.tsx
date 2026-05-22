import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listing/ListingCard'
import { ListingFilters } from '@/components/listing/ListingFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { CATEGORY_LABEL } from '@/lib/constants/categories'

export const metadata = { title: '浏览闲置' }

type SearchParams = Partial<
  Record<
    'q' | 'cat' | 'district' | 'min' | 'max' | 'cond' | 'free' | 'pickup' | 'sort' | 'page',
    string
  >
>

const PAGE_SIZE = 24

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = createClient()
  const page = Math.max(1, Number(searchParams.page) || 1)
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('listings')
    .select(
      'id, title, price, district, condition, status, listing_images(image_url, sort_order)',
      { count: 'exact' },
    )
    .eq('status', 'published')

  if (searchParams.q) {
    const q = searchParams.q.replace(/[%_]/g, '')
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }
  if (searchParams.cat) query = query.eq('category', searchParams.cat)
  if (searchParams.district) query = query.eq('district', searchParams.district)
  if (searchParams.min) query = query.gte('price', Number(searchParams.min))
  if (searchParams.max) query = query.lte('price', Number(searchParams.max))
  if (searchParams.cond) query = query.eq('condition', searchParams.cond)
  if (searchParams.free === '1') query = query.eq('price', 0)
  if (searchParams.pickup === '1') query = query.eq('pickup_available', true)

  const sort = searchParams.sort ?? 'latest'
  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('published_at', { ascending: false })

  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data, count } = await query
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const listings = (data ?? []).map((l: any) => ({
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
      <div className="mb-5">
        <h1 className="font-display text-2xl">
          浏览闲置
          {searchParams.cat && (
            <span className="text-base text-brand-muted ml-2">
              / {CATEGORY_LABEL[searchParams.cat] ?? searchParams.cat}
            </span>
          )}
        </h1>
        {count !== null && (
          <p className="text-sm text-brand-muted mt-1">共 {count} 件商品</p>
        )}
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <ListingFilters />
        <div>
          {listings.length === 0 ? (
            <EmptyState
              image="/illustrations/gamepad.png"
              title="没有符合筛选条件的商品，换个关键词试试？"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination current={page} total={totalPages} searchParams={searchParams} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Pagination({
  current,
  total,
  searchParams,
}: {
  current: number
  total: number
  searchParams: SearchParams
}) {
  const withPage = (p: number) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) if (v) sp.set(k, v as string)
    sp.set('page', String(p))
    return `?${sp.toString()}`
  }
  return (
    <div className="flex justify-center items-center gap-2 mt-8 text-sm">
      {current > 1 && (
        <Link
          href={withPage(current - 1)}
          className="px-3 py-1.5 rounded-pill border border-brand-line hover:bg-white"
        >
          ← 上一页
        </Link>
      )}
      <span className="px-3 py-1.5 text-brand-muted">
        {current} / {total}
      </span>
      {current < total && (
        <Link
          href={withPage(current + 1)}
          className="px-3 py-1.5 rounded-pill border border-brand-line hover:bg-white"
        >
          下一页 →
        </Link>
      )}
    </div>
  )
}
