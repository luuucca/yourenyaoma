'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import { CATEGORIES } from '@/lib/constants/categories'
import { CONDITIONS } from '@/lib/constants/conditions'
import { DISTRICTS } from '@/lib/constants/districts'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'

export function ListingFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [cat, setCat] = useState(params.get('cat') ?? '')
  const [district, setDistrict] = useState(params.get('district') ?? '')
  const [cond, setCond] = useState(params.get('cond') ?? '')
  const [min, setMin] = useState(params.get('min') ?? '')
  const [max, setMax] = useState(params.get('max') ?? '')
  const [free, setFree] = useState(params.get('free') === '1')
  const [pickup, setPickup] = useState(params.get('pickup') === '1')
  const [sort, setSort] = useState(params.get('sort') ?? 'latest')

  function apply(e?: React.FormEvent) {
    e?.preventDefault()
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (cat) sp.set('cat', cat)
    if (district) sp.set('district', district)
    if (cond) sp.set('cond', cond)
    if (min) sp.set('min', min)
    if (max) sp.set('max', max)
    if (free) sp.set('free', '1')
    if (pickup) sp.set('pickup', '1')
    if (sort !== 'latest') sp.set('sort', sort)
    router.push(`${pathname}?${sp.toString()}`)
  }

  function reset() {
    setQ('')
    setCat('')
    setDistrict('')
    setCond('')
    setMin('')
    setMax('')
    setFree(false)
    setPickup(false)
    setSort('latest')
    router.push(pathname)
  }

  return (
    <form
      onSubmit={apply}
      className="card p-5 space-y-4 lg:sticky lg:top-20 h-fit"
    >
      <Input
        label="关键词"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="书名、品牌…"
      />
      <Select
        label="分类"
        value={cat}
        onChange={(e) => setCat(e.target.value)}
        placeholder="全部分类"
        options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
      />
      <Select
        label="区域"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        placeholder="全部区域"
        options={DISTRICTS.map((d) => ({ value: d.id, label: d.label }))}
      />
      <Select
        label="成色"
        value={cond}
        onChange={(e) => setCond(e.target.value)}
        placeholder="不限"
        options={CONDITIONS.map((c) => ({ value: c.id, label: c.label }))}
      />
      <div>
        <span className="block text-sm font-medium mb-1.5">价格区间（€）</span>
        <div className="flex gap-2">
          <Input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="最低"
            min={0}
          />
          <Input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="最高"
            min={0}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={free}
          onChange={(e) => setFree(e.target.checked)}
          className="rounded accent-brand-yellow"
        />
        只看免费送
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={pickup}
          onChange={(e) => setPickup(e.target.checked)}
          className="rounded accent-brand-yellow"
        />
        只看可自取
      </label>
      <Select
        label="排序"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        options={[
          { value: 'latest', label: '最新发布' },
          { value: 'price_asc', label: '价格从低到高' },
          { value: 'price_desc', label: '价格从高到低' },
        ]}
      />
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">应用筛选</Button>
        <Button type="button" variant="secondary" onClick={reset}>重置</Button>
      </div>
    </form>
  )
}
