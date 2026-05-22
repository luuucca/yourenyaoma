'use client'
import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { REPORT_REASONS } from '@/lib/constants/reportReasons'

export function ReportDialog({ listingId }: { listingId: string }) {
  const { show } = useToast()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].id)
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, reason, description: desc }),
    })
    setLoading(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: '提交失败' }))
      show(error || '提交失败', 'error')
      return
    }
    show('已收到你的举报，我们会尽快审核', 'success')
    setOpen(false)
    setDesc('')
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className="flex-1">
        举报
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="举报商品"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submit} loading={loading}>提交</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">举报原因</div>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="accent-brand-yellow"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>
          <Textarea
            label="补充说明（可选）"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={500}
            placeholder="补充更多细节，帮助我们更快审核"
            className="min-h-[80px]"
          />
        </div>
      </Dialog>
    </>
  )
}
