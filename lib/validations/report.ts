import { z } from 'zod'
import { REPORT_REASONS } from '../constants/reportReasons'

const reasonIds = REPORT_REASONS.map((r) => r.id) as [string, ...string[]]

export const reportSchema = z.object({
  listing_id: z.string().uuid(),
  reason: z.enum(reasonIds),
  description: z.string().trim().max(500, '说明最多 500 字').optional().or(z.literal('')),
})

export type ReportInput = z.infer<typeof reportSchema>
