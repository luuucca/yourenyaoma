'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { closeJob, reopenJob, deleteJob } from '@/app/(user)/jobs/new/actions'

/**
 * Owner-only 操作条：关闭 / 重开 / 删除自己发的招工
 */
export function JobOwnerActions({
  jobId,
  status,
}: {
  jobId: string
  status: string
}) {
  const router = useRouter()
  const { show } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleClose() {
    if (!confirm('关闭后这条广告不再出现在「找工作」列表，但记录保留可以再打开。')) {
      return
    }
    setLoading(true)
    const result = await closeJob(jobId)
    setLoading(false)
    if (result.error) {
      show(result.error, 'error')
      return
    }
    show('已关闭', 'success')
    router.refresh()
  }

  async function handleReopen() {
    setLoading(true)
    const result = await reopenJob(jobId)
    setLoading(false)
    if (result.error) {
      show(result.error, 'error')
      return
    }
    show('已重新上架', 'success')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('永久删除这条广告？不可恢复。')) return
    setLoading(true)
    const result = await deleteJob(jobId)
    setLoading(false)
    if (result.error) {
      show(result.error, 'error')
      return
    }
    show('已删除', 'success')
    router.push('/jobs')
    router.refresh()
  }

  return (
    <div className="mt-8 pt-6 border-t border-brand-line flex flex-wrap gap-2">
      <span className="text-[11px] font-mono text-brand-muted tracking-wider uppercase mr-2 self-center">
        owner actions
      </span>
      {status === 'published' ? (
        <Button size="sm" variant="secondary" onClick={handleClose} loading={loading}>
          关闭广告
        </Button>
      ) : (
        <Button size="sm" variant="secondary" onClick={handleReopen} loading={loading}>
          重新上架
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        loading={loading}
        className="text-brand-danger"
      >
        删除
      </Button>
    </div>
  )
}
