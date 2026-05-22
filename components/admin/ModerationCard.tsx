'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatPrice } from '@/lib/utils/formatPrice'
import { formatRelativeTime } from '@/lib/utils/formatDate'
import { CATEGORY_LABEL } from '@/lib/constants/categories'
import { CONDITION_LABEL } from '@/lib/constants/conditions'
import { DISTRICT_LABEL } from '@/lib/constants/districts'
import { REJECTION_REASONS } from '@/lib/constants/reportReasons'
import {
  approveListing,
  rejectListing,
  hideListing,
  unhideListing,
} from '@/app/(admin)/admin/actions'

export function ModerationCard({
  listing,
  status,
}: {
  listing: any
  status: string
}) {
  const { show } = useToast()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState<string>(REJECTION_REASONS[0].id)
  const [detail, setDetail] = useState('')
  const [loading, setLoading] = useState(false)

  const images = [...(listing.listing_images ?? [])]
    .sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((i: any) => i.image_url) as string[]

  async function doApprove() {
    setLoading(true)
    const r = await approveListing(listing.id)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else show('已通过', 'success')
  }

  async function doReject() {
    setLoading(true)
    const label =
      REJECTION_REASONS.find((x) => x.id === reason)?.label ?? '其他'
    const full = detail ? `${label}：${detail}` : label
    const r = await rejectListing(listing.id, full)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else {
      show('已拒绝', 'success')
      setRejectOpen(false)
    }
  }

  async function doHide() {
    if (!confirm('确认隐藏？')) return
    setLoading(true)
    const r = await hideListing(listing.id)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else show('已隐藏', 'success')
  }

  async function doUnhide() {
    setLoading(true)
    const r = await unhideListing(listing.id)
    setLoading(false)
    if (r.error) show(r.error, 'error')
    else show('已恢复上架', 'success')
  }

  return (
    <div className="card p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="grid grid-cols-3 gap-1 md:w-48 shrink-0">
          {images.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className="aspect-square bg-brand-cream rounded-lg overflow-hidden relative"
            >
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-3 aspect-[3/1] bg-brand-cream rounded-lg flex items-center justify-center text-2xl">
              📦
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/listing/${listing.id}`}
            target="_blank"
            className="font-semibold hover:underline"
          >
            {listing.title}
          </Link>
          <div className="mt-1 text-sm text-brand-ink-soft line-clamp-3 whitespace-pre-wrap">
            {listing.description}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-muted">
            <span className="font-medium text-brand-ink">{formatPrice(Number(listing.price))}</span>
            <span>{CATEGORY_LABEL[listing.category]}</span>
            <span>{CONDITION_LABEL[listing.condition]}</span>
            <span>{DISTRICT_LABEL[listing.district]?.slice(0, 5)}</span>
            <span>
              · {listing.profiles?.nickname}（已通过{' '}
              {listing.profiles?.approved_listing_count ?? 0} 件）
            </span>
            <span>· {formatRelativeTime(listing.created_at)}</span>
            {listing.report_count > 0 && (
              <span className="text-brand-danger">举报 {listing.report_count} 次</span>
            )}
          </div>
          {listing.rejected_reason && (
            <div className="mt-2 text-xs text-brand-danger">
              拒绝原因：{listing.rejected_reason}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {status === 'pending' && (
              <>
                <Button size="sm" onClick={doApprove} loading={loading}>
                  ✓ 通过
                </Button>
                <Button size="sm" variant="danger" onClick={() => setRejectOpen(true)}>
                  ✗ 拒绝
                </Button>
                <Button size="sm" variant="secondary" onClick={doHide}>
                  隐藏
                </Button>
              </>
            )}
            {status === 'hidden' && (
              <>
                <Button size="sm" onClick={doUnhide} loading={loading}>
                  恢复上架
                </Button>
                <Button size="sm" variant="danger" onClick={() => setRejectOpen(true)}>
                  转为拒绝
                </Button>
              </>
            )}
            {status === 'rejected' && (
              <Button size="sm" onClick={doApprove} loading={loading}>
                恢复并通过
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="拒绝原因"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>取消</Button>
            <Button variant="danger" onClick={doReject} loading={loading}>确认拒绝</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            {REJECTION_REASONS.map((rj) => (
              <label key={rj.id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="rj"
                  value={rj.id}
                  checked={reason === rj.id}
                  onChange={() => setReason(rj.id)}
                  className="accent-brand-yellow"
                />
                {rj.label}
              </label>
            ))}
          </div>
          <Textarea
            label="补充说明（可选）"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="min-h-[80px]"
            maxLength={300}
          />
        </div>
      </Dialog>
    </div>
  )
}
