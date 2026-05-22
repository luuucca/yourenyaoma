'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import {
  resolveReport,
  dismissReport,
  hideListing,
} from '@/app/(admin)/admin/actions'

export function ReportActions({
  reportId,
  listingId,
}: {
  reportId: string
  listingId: string
}) {
  const { show } = useToast()
  const [loading, setLoading] = useState(false)

  async function resolve() {
    setLoading(true)
    const r = await resolveReport(reportId)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else show('已处理', 'success')
  }

  async function dismiss() {
    setLoading(true)
    const r = await dismissReport(reportId)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else show('已忽略', 'success')
  }

  async function hideAndResolve() {
    if (!confirm('隐藏该商品并标记举报为已处理？')) return
    setLoading(true)
    await hideListing(listingId, '举报核实成立')
    await resolveReport(reportId)
    setLoading(false)
    show('已隐藏并处理', 'success')
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <Button size="sm" variant="danger" onClick={hideAndResolve} loading={loading}>
        隐藏并处理
      </Button>
      <Button size="sm" variant="secondary" onClick={resolve} loading={loading}>
        仅处理
      </Button>
      <Button size="sm" variant="ghost" onClick={dismiss} loading={loading}>
        忽略
      </Button>
    </div>
  )
}
