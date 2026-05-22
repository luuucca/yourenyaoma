'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { listingSchema, type ListingInput } from '@/lib/validations/listing'
import { checkBlockedWords, shouldForceModeration } from '@/lib/moderation/checkContent'

type Result = { id?: string; status?: string; error?: string }

export async function publishListing(input: ListingInput): Promise<Result> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }
  if (!user.email_confirmed_at) return { error: '请先完成邮箱验证' }

  const parsed = listingSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? '校验失败' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('approved_listing_count, role')
    .eq('id', user.id)
    .single()
  if (profile?.role === 'banned') return { error: '账号已被封禁，无法发布' }

  const text = `${parsed.data.title} ${parsed.data.description}`
  const { data: blockedRows } = await supabase
    .from('blocked_words')
    .select('word, category')
  const list = blockedRows && blockedRows.length > 0 ? blockedRows : undefined
  const hits = checkBlockedWords(text, list)
  const { force } = shouldForceModeration(hits, profile?.approved_listing_count ?? 0)
  const status: 'pending' | 'published' = force ? 'pending' : 'published'

  const insert: any = {
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    price: parsed.data.price,
    category: parsed.data.category,
    condition: parsed.data.condition,
    district: parsed.data.district,
    pickup_available: parsed.data.pickup_available,
    status,
  }
  if (status === 'published') insert.published_at = new Date().toISOString()

  const { data: listing, error } = await supabase
    .from('listings')
    .insert(insert)
    .select('id, status')
    .single()
  if (error || !listing) return { error: error?.message ?? '发布失败' }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const imageRows = parsed.data.image_paths.map((path, idx) => ({
    listing_id: listing.id,
    image_url: `${supabaseUrl}/storage/v1/object/public/listings/${path}`,
    sort_order: idx,
  }))
  if (imageRows.length > 0) {
    await supabase.from('listing_images').insert(imageRows)
  }

  revalidatePath('/')
  revalidatePath('/browse')
  // Admin moderation queue and dashboard counters need to refresh too
  revalidatePath('/admin')
  revalidatePath('/admin/pending')
  return { id: listing.id, status: listing.status }
}
