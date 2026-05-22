import { z } from 'zod'

export const HANGOUT_TAGS = [
  '球友',
  '饭搭子',
  '学习',
  '游戏',
  '户外',
  '拼车',
  '演唱会',
  '其他',
] as const

export type HangoutTag = (typeof HANGOUT_TAGS)[number]

export const hangoutSchema = z.object({
  title: z.string().min(2, '标题至少 2 个字').max(80, '标题最多 80 个字'),
  tag: z.enum(HANGOUT_TAGS),
  when_text: z.string().min(2, '请填写时间').max(40),
  region: z.string().min(2, '请填写地点').max(80),
  total_spots: z.number().int().min(1, '至少 1 人').max(200),
  description: z.string().max(2000).optional(),
})

export type HangoutInput = z.infer<typeof hangoutSchema>
