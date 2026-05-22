import { z } from 'zod'
import { DISTRICTS } from '../constants/districts'

const districtIds = DISTRICTS.map((d) => d.id) as [string, ...string[]]

export const profileSchema = z.object({
  nickname: z.string().trim().min(1, '请填写昵称').max(24, '昵称最多 24 个字'),
  district: z.enum(districtIds).optional().nullable(),
  wechat: z
    .string()
    .trim()
    .max(60, '微信号最多 60 个字符')
    .optional()
    .or(z.literal('')),
  whatsapp: z
    .string()
    .trim()
    .max(20, 'WhatsApp 号最多 20 个字符')
    .regex(/^[+\d\s\-]*$/, 'WhatsApp 号格式不正确')
    .optional()
    .or(z.literal('')),
  avatar_url: z.string().url().optional().nullable(),
})

export type ProfileInput = z.infer<typeof profileSchema>

export const signUpSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少 8 位'),
  nickname: z.string().trim().min(1, '请填写昵称').max(24),
})

export const signInSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
})
