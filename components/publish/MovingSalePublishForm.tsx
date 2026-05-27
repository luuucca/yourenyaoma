'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/compressImage'
import { ImageUploader } from './ImageUploader'
import { CATEGORIES } from '@/lib/constants/categories'
import { CONDITIONS } from '@/lib/constants/conditions'
import { DISTRICTS } from '@/lib/constants/districts'
import { publishMovingSale } from '@/app/(user)/publish/moving/actions'

type ItemDraft = {
  /** local key — 拿来当 React key */
  k: string
  title: string
  description: string
  priceText: string // 空字符串 = bundle_only
  category: string
  condition: string
  imagePath: string // 空 = 没图
}

function newItem(): ItemDraft {
  return {
    k: crypto.randomUUID(),
    title: '',
    description: '',
    priceText: '',
    category: 'furniture',
    condition: '80',
    imagePath: '',
  }
}

export function MovingSalePublishForm({
  defaultDistrict,
}: {
  defaultDistrict?: string | null
}) {
  const router = useRouter()
  const { show } = useToast()

  // 父信息
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [district, setDistrict] = useState(defaultDistrict ?? '')
  const [totalPriceText, setTotalPriceText] = useState('')
  const [pickup, setPickup] = useState(true)
  const [parentImages, setParentImages] = useState<string[]>([])

  // 子物品 — 默认 0 件，用户按需添加
  const [items, setItems] = useState<ItemDraft[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function updateItem(k: string, patch: Partial<ItemDraft>) {
    setItems((prev) => prev.map((it) => (it.k === k ? { ...it, ...patch } : it)))
  }
  function removeItem(k: string) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((it) => it.k !== k)))
  }
  function addItem() {
    setItems((prev) => [...prev, newItem()])
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    const payload = {
      parent: {
        title,
        description,
        district,
        total_price: totalPriceText ? Number(totalPriceText) : null,
        pickup_available: pickup,
        image_paths: parentImages,
      },
      items: items.map((it) => ({
        title: it.title,
        description: it.description,
        price: it.priceText ? Number(it.priceText) : null,
        category: it.category,
        condition: it.condition,
        bundle_only: it.priceText === '',
        image_path: it.imagePath || undefined,
      })),
    }
    const result = await publishMovingSale(payload as any)
    setLoading(false)
    if (result.error && !result.parentId) {
      setErr(result.error)
      return
    }
    if (result.error) {
      show(result.error, 'error')
    }
    show('搬家甩卖已发布', 'success')
    router.push(`/listing/${result.parentId}`)
    router.refresh()
  }

  const individualCount = items.filter((it) => it.priceText !== '').length
  const bundleOnlyCount = items.length - individualCount

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {/* ============================= 父 bundle 信息 ============================= */}
      <section className="space-y-5">
        <div className="text-[12px] font-mono tracking-[0.18em] text-brand-muted uppercase">
          ① 整体信息
        </div>
        <ImageUploader
          paths={parentImages}
          onChange={setParentImages}
          error={parentImages.length === 0 ? '请至少上传 1 张总封面图' : undefined}
        />
        <Input
          label="搬家甩卖标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：1110 区两房整屋甩卖 · 11/15 前出清"
          maxLength={60}
          required
        />
        <Textarea
          label="整体说明"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="搬家/回国的背景、可议价、配送/搬运、试用时间窗口等"
          maxLength={2000}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="所在区"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="请选择"
            options={DISTRICTS.map((d) => ({ value: d.id, label: d.label }))}
            required
          />
          <Input
            type="number"
            min={0}
            step={1}
            label="包圆价（€，选填）"
            value={totalPriceText}
            onChange={(e) => setTotalPriceText(e.target.value)}
            placeholder="留空 = 按件单算"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pickup}
            onChange={(e) => setPickup(e.target.checked)}
            className="accent-brand-yellow"
          />
          可自取
        </label>
      </section>

      {/* ============================= 子物品列表 (可选) ============================= */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-[12px] font-mono tracking-[0.18em] text-brand-muted uppercase">
            ② 物品清单 ({items.length}) · 选填
          </div>
          {items.length > 0 && (
            <span className="text-[11px] text-brand-muted">
              {individualCount} 件单独售 · {bundleOnlyCount} 件仅在套装内
            </span>
          )}
        </div>

        {items.length === 0 && (
          <p className="text-[12px] text-brand-muted leading-relaxed border border-dashed border-brand-line rounded-2xl px-4 py-3 bg-brand-cream">
            可以不加单件物品直接发布，整屋总图 + 描述就够了。
            如果想让某件单独可买/能被买家点开看图 — 下面加单件。
          </p>
        )}

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div
              key={it.k}
              className="border border-brand-line rounded-2xl p-4 space-y-3 bg-white relative"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] font-mono text-brand-muted">
                  Item #{String(idx + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(it.k)}
                  className="text-[11px] text-brand-danger hover:underline"
                >
                  移除
                </button>
              </div>

              <div className="flex gap-3">
                <ItemImagePicker
                  imagePath={it.imagePath}
                  onChange={(p) => updateItem(it.k, { imagePath: p })}
                />
                <div className="flex-1 min-w-0">
                  <Input
                    label="物品名"
                    value={it.title}
                    onChange={(e) => updateItem(it.k, { title: e.target.value })}
                    placeholder="例：北欧三人沙发"
                    maxLength={60}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="分类"
                  value={it.category}
                  onChange={(e) => updateItem(it.k, { category: e.target.value })}
                  options={CATEGORIES.filter((c) => c.id !== 'moving' && c.id !== 'free').map(
                    (c) => ({ value: c.id, label: c.label }),
                  )}
                />
                <Select
                  label="成色"
                  value={it.condition}
                  onChange={(e) => updateItem(it.k, { condition: e.target.value })}
                  options={CONDITIONS.map((c) => ({ value: c.id, label: c.label }))}
                />
                <Input
                  type="number"
                  min={0}
                  step={1}
                  label="单价（留空=仅套装内）"
                  value={it.priceText}
                  onChange={(e) => updateItem(it.k, { priceText: e.target.value })}
                  placeholder="€"
                />
              </div>
              <Textarea
                label="说明（选填）"
                value={it.description}
                onChange={(e) => updateItem(it.k, { description: e.target.value })}
                placeholder="尺寸、品牌、用了多久……"
                maxLength={500}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="w-full border-2 border-dashed border-brand-line rounded-2xl py-3 text-[13px] text-brand-muted hover:border-brand-yellow hover:text-brand-ink transition-colors"
        >
          + 添加单件物品
        </button>
      </section>

      <p className="text-xs text-brand-muted leading-relaxed">
        填了单价的物品 — 会同时出现在 /浏览 普通分类里（独立可买）。
        留空的物品 — 只出现在这个搬家甩卖详情页内（套装内打包）。
      </p>

      {err && (
        <div className="text-[13px] text-brand-danger bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {err}
        </div>
      )}

      <Button type="submit" size="lg" loading={loading} className="w-full">
        {items.length > 0
          ? `发布搬家甩卖（含 ${items.length} 件）`
          : '发布搬家甩卖（整屋一图）'}
      </Button>
    </form>
  )
}

/** 单件小封面 — 64×64 方框，点上传，上传成功后显示缩略图 */
function ItemImagePicker({
  imagePath,
  onChange,
}: {
  imagePath: string
  onChange: (path: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    setUploading(true)
    try {
      const blob = await compressImage(file)
      const filename = `${user.id}/${crypto.randomUUID()}.webp`
      const { error } = await supabase.storage
        .from('listings')
        .upload(filename, blob, { contentType: 'image/webp', upsert: false })
      if (!error) onChange(filename)
    } catch (e) {
      console.error('item upload failed', e)
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {imagePath ? (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-brand-cream border border-brand-line">
          <Image
            src={`${supabaseUrl}/storage/v1/object/public/listings/${imagePath}`}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white text-[11px] rounded-bl-md"
            aria-label="移除"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-16 h-16 rounded-xl border-2 border-dashed border-brand-line text-brand-muted hover:border-brand-yellow hover:text-brand-ink text-[10px] flex flex-col items-center justify-center gap-0.5"
        >
          {uploading ? <span>…</span> : <><span className="text-base leading-none">+</span><span>图</span></>}
        </button>
      )}
    </div>
  )
}
