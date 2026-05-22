import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ReportActions } from '@/components/admin/ReportActions'
import { REPORT_REASONS } from '@/lib/constants/reportReasons'
import { formatRelativeTime } from '@/lib/utils/formatDate'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = { title: '举报列表' }

const reasonLabel = Object.fromEntries(REPORT_REASONS.map((r) => [r.id, r.label]))

export default async function AdminReportsPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('reports')
    .select(
      'id, reason, description, status, created_at, listing_id, reporter_id, listings(title, status), profiles!reports_reporter_id_fkey(nickname)',
    )
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="container-page py-6 max-w-3xl">
      <h1 className="font-display text-2xl mb-5">举报列表</h1>
      {!data || data.length === 0 ? (
        <div className="card p-12 text-center text-brand-muted">还没有举报</div>
      ) : (
        <ul className="space-y-3">
          {data.map((r: any) => (
            <li key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`chip ${
                        r.status === 'open'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {r.status === 'open'
                        ? '待处理'
                        : r.status === 'resolved'
                          ? '已处理'
                          : '已忽略'}
                    </span>
                    <span className="text-xs text-brand-muted">
                      {formatRelativeTime(r.created_at)}
                    </span>
                  </div>
                  <Link
                    href={`/listing/${r.listing_id}`}
                    target="_blank"
                    className="font-medium hover:underline"
                  >
                    {r.listings?.title ?? '(商品已被删除)'}
                  </Link>
                  <div className="text-sm mt-1">
                    <span className="text-brand-danger font-medium">
                      {reasonLabel[r.reason] ?? r.reason}
                    </span>
                    {r.description && (
                      <span className="text-brand-muted ml-2">— {r.description}</span>
                    )}
                  </div>
                  <div className="text-xs text-brand-muted mt-1">
                    举报人：{r.profiles?.nickname ?? '匿名'}
                  </div>
                </div>
                {r.status === 'open' && (
                  <ReportActions reportId={r.id} listingId={r.listing_id} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
