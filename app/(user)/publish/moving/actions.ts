'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/constants/categories'
import { CONDITIONS } from '@/lib/constants/conditions'
import { DISTRICTS } from '@/lib/constants/districts'

const validCategoryIds = CATEGORIES.map((c) => c.id) as readonly string[]
const validConditionIds = CONDITIONS.map((c) => c.id) as readonly string[]
const validDistrictIds = DISTRICTS.map((d) => d.id) as readonly string[]

const itemSchema = z.object({
  title: z.string().trim().min(2, '物品标题至少 2 字').max(60, '物品标题不超过 60 字'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  price: z.number().min(0).optional().nullable(),
  category: z.enum(validCategoryIds as [string, ...string[]]),
  condition: z.enum(validConditionIds as [string, ...string[]]),
  /** 单一售价已填 → 出现在 /browse；为空 → 仅 bundle 内可见 */
  bundle_only: z.boolean(),
})

const movingSaleSchema = z.object({
  parent: z.object({
    title: z
      .string()
      .trim()
      .min(4, '总标题至少 4 字')
      .max(60, '总标题不超过 60 字'),
    description: z
      .string()
      .trim()
      .min(10, '总描述至少 10 字')
      .max(2000, '总描述不超过 2000 字'),
    district: z.enum(validDistrictIds as [string, ...string[]]),
    total_price: z.number().min(0).optional().nullable(),
    pickup_available: z.boolean(),
    image_paths: z.array(z.string()).min(1, '请至少上传 1 张总封面图'),
  }),
  items: z.array(itemSchema).min(1, '至少添加 1 件物品').max(50, '最多 50 件'),
})

export type MovingSaleInput = z.infer<typeof movingSaleSchema>

type Result = { parentId?: string; error?: string }

export async function publishMovingSale(input: MovingSaleInput): Promise<Result> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '请先登录' }
  if (!user.email_confirmed_at) return { error: '请先完成邮箱验证' }

  const parsed = movingSaleSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? '校验失败' }

  // ban 检查
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role === 'banned') return { error: '账号已被封禁' }

  const { parent, items } = parsed.data

  // 1) 插入父 listing — category='moving'
  const parentInsert: any = {
    user_id: user.id,
    title: parent.title,
    description: parent.description,
    price: parent.total_price ?? 0, // 0 表示「按件单算」
    category: 'moving',
    condition: 'used', // 父 bundle 不强求 — 用「正常使用」当占位
    district: parent.district,
    pickup_available: parent.pickup_available,
    status: 'published',
    published_at: new Date().toISOString(),
  }
  const { data: parentRow, error: parentErr } = await supabase
    .from('listings')
    .insert(parentInsert)
    .select('id')
    .single()
  if (parentErr || !parentRow) {
    return { error: parentErr?.message ?? '父 listing 创建失败' }
  }

  // 2) 父封面图
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const parentImageRows = parent.image_paths.map((path, idx) => ({
    listing_id: parentRow.id,
    image_url: `${supabaseUrl}/storage/v1/object/public/listings/${path}`,
    sort_order: idx,
  }))
  if (parentImageRows.length > 0) {
    await supabase.from('listing_images').insert(parentImageRows)
  }

  // 3) 子 listings 批量插入
  const childRows = items.map((it) => ({
    user_id: user.id,
    title: it.title,
    description: it.description || '',
    price: it.price ?? 0,
    category: it.category,
    condition: it.condition,
    district: parent.district, // 继承父区域
    pickup_available: parent.pickup_available,
    status: 'published',
    published_at: new Date().toISOString(),
    parent_listing_id: parentRow.id,
    bundle_only: it.bundle_only,
  }))
  const { error: childErr } = await supabase.from('listings').insert(childRows)
  if (childErr) {
    // 父已经创建 → 不回滚（用户可以编辑/删除）
    return {
      parentId: parentRow.id,
      error: `子物品部分失败: ${childErr.message}`,
    }
  }

  revalidatePath('/')
  revalidatePath('/browse')
  revalidatePath(`/listing/${parentRow.id}`)
  return { parentId: parentRow.id }
}
