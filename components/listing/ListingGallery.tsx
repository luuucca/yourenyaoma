'use client'
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

export function ListingGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-brand-cream rounded-2xl flex items-center justify-center text-6xl">
        📦
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-[4/3] relative bg-brand-cream rounded-2xl overflow-hidden">
        <Image
          src={images[idx]}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
              aria-label="上一张"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
              aria-label="下一张"
            >
              ›
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIdx(i)}
              className={cn(
                'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 relative bg-brand-cream',
                i === idx ? 'border-brand-yellow' : 'border-transparent',
              )}
              type="button"
              aria-label={`第 ${i + 1} 张`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
