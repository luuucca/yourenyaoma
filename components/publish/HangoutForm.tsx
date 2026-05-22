'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createHangout } from '@/app/(user)/buddies/new/actions'
import { HANGOUT_TAGS } from '@/lib/validations/hangout'

type TimeMode = 'once' | 'weekly' | 'ongoing'
type LocationMode = 'offline' | 'online'

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const

// JS Date.getDay() returns 0=Sunday..6=Saturday — map to our Chinese label
function chineseWeekday(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const idx = (d.getDay() + 6) % 7 // shift to Mon=0..Sun=6
  return WEEKDAYS[idx]
}

export default function HangoutForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState<(typeof HANGOUT_TAGS)[number]>('饭搭子')

  // Time
  const [timeMode, setTimeMode] = useState<TimeMode>('once')
  const [date, setDate] = useState('') // for 'once'
  const [weekday, setWeekday] = useState<(typeof WEEKDAYS)[number]>('周六') // for 'weekly'
  const [time, setTime] = useState('') // HH:MM for 'once' + 'weekly'

  // Location
  const [locationMode, setLocationMode] = useState<LocationMode>('offline')
  const [offlineAddress, setOfflineAddress] = useState('')
  const [onlinePlatform, setOnlinePlatform] = useState('')

  const [totalSpots, setTotalSpots] = useState(4)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Compute the final when_text + region strings the DB expects
  const whenText = useMemo(() => {
    if (timeMode === 'ongoing') return '长期有效'
    if (timeMode === 'once') {
      if (!date) return ''
      const wd = chineseWeekday(date)
      return `${date} ${wd} ${time || ''}`.trim()
    }
    // weekly
    return `每${weekday} ${time || ''}`.trim()
  }, [timeMode, date, weekday, time])

  const region = useMemo(() => {
    if (locationMode === 'online') {
      return onlinePlatform.trim() ? `线上 · ${onlinePlatform.trim()}` : ''
    }
    return offlineAddress.trim() ? `线下 · ${offlineAddress.trim()}` : ''
  }, [locationMode, offlineAddress, onlinePlatform])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Client-side gates for the structured inputs
    if (timeMode === 'once' && !date) {
      setError('请选一个日期')
      return
    }
    if ((timeMode === 'once' || timeMode === 'weekly') && !time) {
      setError('请选一个时间')
      return
    }
    if (locationMode === 'offline' && offlineAddress.trim().length < 2) {
      setError('线下活动必须写具体地址（餐厅 / 球场 / 公园等）')
      return
    }
    if (locationMode === 'online' && onlinePlatform.trim().length < 2) {
      setError('线上活动请写明平台或链接')
      return
    }

    setSubmitting(true)
    const r = await createHangout({
      title: title.trim(),
      tag,
      when_text: whenText,
      region,
      total_spots: Number(totalSpots),
      description: description.trim() || undefined,
    })
    setSubmitting(false)
    if (r.error) {
      setError(r.error)
      return
    }
    router.push(`/buddies/${r.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="标题" hint="例：周六篮球局 · 中央公园">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          className="w-full h-11 px-4 rounded-pill border border-brand-line bg-white outline-none focus:border-brand-ink"
        />
      </Field>

      <Field label="分类">
        <div className="flex flex-wrap gap-2">
          {HANGOUT_TAGS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTag(t)}
              className={
                'h-9 px-4 rounded-pill text-sm transition-colors ' +
                (tag === t
                  ? 'bg-brand-ink text-white'
                  : 'bg-white border border-brand-line hover:border-brand-ink')
              }
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      {/* TIME */}
      <Field label="时间" hint="选一个最贴近你这个活动的">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'once', label: '单次活动' },
              { id: 'weekly', label: '每周定期' },
              { id: 'ongoing', label: '长期有效' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setTimeMode(m.id as TimeMode)}
                className={
                  'h-9 px-4 rounded-pill text-sm transition-colors ' +
                  (timeMode === m.id
                    ? 'bg-brand-ink text-white'
                    : 'bg-white border border-brand-line hover:border-brand-ink')
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          {timeMode === 'once' && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="h-11 px-4 rounded-pill border border-brand-line bg-white outline-none focus:border-brand-ink text-sm"
              />
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                step={300}
                className="h-11 px-4 rounded-pill border border-brand-line bg-white outline-none focus:border-brand-ink text-sm"
              />
            </div>
          )}

          {timeMode === 'weekly' && (
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setWeekday(d)}
                    className={
                      'h-9 px-3 rounded-pill text-sm transition-colors min-w-[44px] ' +
                      (weekday === d
                        ? 'bg-brand-yellow text-brand-ink font-medium'
                        : 'bg-white border border-brand-line hover:border-brand-ink')
                    }
                  >
                    {d.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                step={300}
                className="h-9 px-3 rounded-pill border border-brand-line bg-white outline-none focus:border-brand-ink text-sm"
              />
            </div>
          )}

          {timeMode === 'ongoing' && (
            <div className="text-[13px] text-brand-muted bg-brand-cream rounded-2xl px-4 py-3 border border-brand-line">
              选择「长期有效」表示这是一个**没有固定时间**的活动，比如「随时可以约的火锅局」「常驻找队友打游戏」等。
            </div>
          )}

          {whenText && (
            <div className="text-[12px] text-brand-muted">
              发布时显示：<span className="font-medium text-brand-ink">{whenText}</span>
            </div>
          )}
        </div>
      </Field>

      {/* LOCATION */}
      <Field label="地点" hint="线下必须写具体地址，线上写平台或链接">
        <div className="space-y-3">
          <div className="flex gap-2">
            {[
              { id: 'offline', label: '🏠 线下' },
              { id: 'online', label: '💻 线上' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setLocationMode(m.id as LocationMode)}
                className={
                  'h-9 px-4 rounded-pill text-sm transition-colors ' +
                  (locationMode === m.id
                    ? 'bg-brand-ink text-white'
                    : 'bg-white border border-brand-line hover:border-brand-ink')
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          {locationMode === 'offline' ? (
            <input
              required
              value={offlineAddress}
              onChange={(e) => setOfflineAddress(e.target.value)}
              maxLength={70}
              placeholder="例：海底捞 Mariahilfer Straße · 1070 Wien"
              className="w-full h-11 px-4 rounded-pill border border-brand-line bg-white outline-none focus:border-brand-ink text-sm"
            />
          ) : (
            <input
              required
              value={onlinePlatform}
              onChange={(e) => setOnlinePlatform(e.target.value)}
              maxLength={70}
              placeholder="例：王者荣耀国服 / Zoom 链接 / Discord 服务器"
              className="w-full h-11 px-4 rounded-pill border border-brand-line bg-white outline-none focus:border-brand-ink text-sm"
            />
          )}

          {region && (
            <div className="text-[12px] text-brand-muted">
              发布时显示：<span className="font-medium text-brand-ink">{region}</span>
            </div>
          )}
        </div>
      </Field>

      <Field label="总人数" hint="包含发起人，1-200 人">
        <input
          type="number"
          required
          min={1}
          max={200}
          value={totalSpots}
          onChange={(e) => setTotalSpots(Number(e.target.value))}
          className="w-full md:max-w-[200px] h-11 px-4 rounded-pill border border-brand-line bg-white outline-none focus:border-brand-ink"
        />
      </Field>

      <Field label="活动安排" hint="写清楚费用、装备、集合方式、注意事项等">
        <textarea
          rows={6}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例：AA 制 €15/人 · 海底捞底料 · 不喝酒&#10;集合地点：Marienplatz 地铁口 18:25 等齐人一起走"
          className="w-full px-4 py-3 rounded-2xl border border-brand-line bg-white outline-none focus:border-brand-ink"
        />
      </Field>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-ink text-white rounded-pill px-7 py-3 text-[13px] font-medium hover:opacity-85 active:translate-y-px transition-all disabled:opacity-50"
        >
          {submitting ? '发布中…' : '发起活动'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[13px] text-brand-ink-soft underline underline-offset-4 hover:text-brand-ink"
        >
          取消
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-3">
        <label className="text-[13px] font-medium text-brand-ink">{label}</label>
        {hint && <span className="text-[11px] text-brand-muted text-right">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
