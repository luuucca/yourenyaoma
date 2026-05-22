import { z } from 'zod'
import { CATEGORIES } from '../constants/categories'
import { CONDITIONS } from '../constants/conditions'
import { DISTRICTS } from '../constants/districts'

const categoryIds = CATEGORIES.map((c) => c.id) as [string, ...string[]]
const conditionIds = CONDITIONS.map((c) => c.id) as [string, ...string[]]
const districtIds = DISTRICTS.map((d) => d.id) as [string, ...string[]]

export const listingSchema = z.object({
  title: z.string().trim().min(2, '标题至少 2 个字').max(60, '标题最多 60 个字'),
  description: z.string().trim().min(5, '描述至少 5 个字').max(2000, '描述最多 2000 个字'),
  price: z.coerce.number().nonnegative('价格不能为负').max(999999, '价格上限 999999'),
  category: z.enum(categoryIds, { errorMap: () => ({ message: '请选择分类' }) }),
  condition: z.enum(conditionIds, { errorMap: () => ({ message: '请选择成色' }) }),
  district: z.enum(districtIds, { errorMap: () => ({ message: '请选择区域' }) }),
  pickup_available: z.boolean().default(true),
  image_paths: z
    .array(z.string().min(1))
    .min(1, '至少上传 1 张图片')
    .max(9, '最多 9 张图片'),
})

export type ListingInput = z.infer<typeof listingSchema>
