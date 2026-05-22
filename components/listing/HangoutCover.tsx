import Image from 'next/image'
import type { CoverSpec } from '@/lib/utils/hangoutCover'

type Props = {
  spec: CoverSpec
  /** Sizing class — e.g. "aspect-[16/9]" or "aspect-[2.4/1]". Caller controls. */
  className?: string
  /** Larger sizing for the detail page hero. */
  size?: 'card' | 'hero'
}

// Thin <Image> wrapper for hangout covers (Unsplash photos picked by
// pickHangoutCover). Kept as a separate component so all callers share
// consistent sizing/object-fit/transitions.
export default function HangoutCover({ spec, className = '', size = 'card' }: Props) {
  const sizes =
    size === 'hero'
      ? '(max-width: 768px) 100vw, 768px'
      : '(max-width: 768px) 100vw, 33vw'
  return (
    <div className={`relative ${className} bg-brand-cream overflow-hidden`}>
      <Image
        src={spec.url}
        alt={spec.alt}
        fill
        sizes={sizes}
        priority={size === 'hero'}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
  )
}
