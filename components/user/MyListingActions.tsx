'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export function MyListingActions({
  listingId,
  status,
}: {
  listingId: string
  status: string
}) {
  const router = useRouter()
  const { show } = useToast()
  const [loading, setLoading] = useState(false)

  async function markSold() {
    if (!confirm('确认标记为已售出？')) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold', sold_at: new Date().toISOString() })
      .eq('id', listingId)
    setLoading(false)
    if (error) {
      show(error.message, 'error')
      return
    }
    show('已标记为售出', 'success')
    router.refresh()
  }

  async function remove() {
    if (!confirm('确认删除？此操作不可撤销。')) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('listings').delete().eq('id', listingId)
    setLoading(false)
    if (error) {
      show(error.message, 'error')
      return
    }
    show('已删除', 'success')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      {status === 'published' && (
        <Button size="sm" variant="secondary" onClick={markSold} loading={loading}>
          标记已售
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={remove}
        loading={loading}
        className="text-brand-danger"
      >
        删除
      </Button>
    </div>
  )
}
