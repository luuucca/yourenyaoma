import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils/formatPrice'
import { CONDITION_LABEL } from '@/lib/constants/conditions'
import { DISTRICT_LABEL } from '@/lib/constants/districts'

export type ListingCardData = {
  id: string
  title: string
  price: number
  district: string
  condition: string
  status?: string
  cover_url?: string | null
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const isSold = listing.status === 'sold'
  const districtLabel = DISTRICT_LABEL[listing.district]?.slice(0, 5) ?? listing.district

  return (
    <Link href={`/listing/${listing.id}`} className="card block group">
      <div className="aspect-square bg-brand-cream relative overflow-hidden">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="sold">已售出</Badge>
          </div>
        )}
        {listing.price === 0 && !isSold && (
          <div className="absolute top-2 left-2">
            <Badge variant="free">免费送</Badge>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{listing.title}</div>
        <div className="mt-2 flex items-center justify-between">
          <span
            className={
              listing.price === 0
                ? 'text-brand-free font-semibold'
                : 'text-brand-ink font-semibold'
            }
          >
            {formatPrice(listing.price)}
          </span>
          <Badge>{CONDITION_LABEL[listing.condition] ?? listing.condition}</Badge>
        </div>
        <div className="mt-1 text-xs text-brand-muted">{districtLabel}</div>
      </div>
    </Link>
  )
}
