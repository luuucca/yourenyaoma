'use client'
import { useRouter } from 'next/navigation'
import { useState, type MouseEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  listingId: string
  initialFavorited: boolean
  loggedIn: boolean
}

// Compact heart icon for product cards (e.g. on homepage feed). Click toggles
// the favorite optimistically; click events are stopped so the parent <Link>
// to the listing detail page doesn't navigate at the same time.
export default function FavoriteHeart({
  listingId,
  initialFavorited,
  loggedIn,
}: Props) {
  const router = useRouter()
  const [fav, setFav] = useState(initialFavorited)
  const [busy, setBusy] = useState(false)

  async function onClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault() // stop the wrapping <Link>
    e.stopPropagation()
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent('/')}`)
      return
    }
    if (busy) return
    setBusy(true)
    const next = !fav
    setFav(next) // optimistic
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setFav(!next)
      setBusy(false)
      router.push('/login')
      return
    }
    try {
      if (next) {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: listingId })
        // Duplicate key on PK (user_id, listing_id) is fine — already favorited.
        if (error && !error.message.toLowerCase().includes('duplicate')) {
          setFav(!next)
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
        if (error) setFav(!next)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={fav ? '取消收藏' : '收藏'}
      aria-pressed={fav}
      className={
        'absolute top-1.5 right-1.5 w-11 h-11 rounded-pill flex items-center justify-center transition-transform active:scale-90 ' +
        (busy ? 'opacity-70' : '')
      }
    >
      <span
        className={
          'w-7 h-7 rounded-pill bg-white/95 flex items-center justify-center text-[16px] leading-none border ' +
          (fav ? 'text-red-500 border-red-200' : 'text-[#444] border-transparent')
        }
        aria-hidden
      >
        {fav ? '♥' : '♡'}
      </span>
    </button>
  )
}
