'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function FavoriteButton({
  listingId,
  initialFavorited,
  loggedIn,
}: {
  listingId: string
  initialFavorited: boolean
  loggedIn: boolean
}) {
  const router = useRouter()
  const { show } = useToast()
  const [fav, setFav] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/listing/${listingId}`)}`)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    if (fav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
      setFav(false)
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listingId })
      setFav(true)
      show('已加入收藏', 'success')
    }
    setLoading(false)
  }

  return (
    <Button variant="secondary" onClick={toggle} loading={loading} className="flex-1">
      {fav ? '❤️ 已收藏' : '🤍 收藏'}
    </Button>
  )
}
