'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { ImageUploader } from './ImageUploader'
import { CATEGORIES } from '@/lib/constants/categories'
import { CONDITIONS } from '@/lib/constants/conditions'
import { DISTRICTS } from '@/lib/constants/districts'
import { listingSchema } from '@/lib/validations/listing'
import { publishListing } from '@/app/(user)/publish/actions'

export function PublishForm({ defaultDistrict }: { defaultDistrict?: string | null }) {
  const router = useRouter()
  const { show } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [district, setDistrict] = useState(defaultDistrict ?? '')
  const [pickup, setPickup] = useState(true)
  const [imagePaths, setImagePaths] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    const input = {
      title,
      description,
      price: Number(price || 0),
      category,
      condition,
      district,
      pickup_available: pickup,
      image_paths: imagePaths,
    }
    const parsed = listingSchema.safeParse(input)
    if (!parsed.success) {
      const fe: Record<string, string> = {}
      parsed.error.errors.forEach((err) => {
        fe[err.path[0] as string] = err.message
      })
      setErrors(fe)
      return
    }
    setLoading(true)
    const result = await publishListing(parsed.data)
    setLoading(false)
    if (result.error) {
      show(result.error, 'error')
      return
    }
    if (result.status === 'pending') {
      show('已提交，等待审核', 'success')
      router.push('/me/listings')
    } else {
      show('发布成功', 'success')
      router.push(`/listing/${result.id}`)
    }
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <ImageUploader paths={imagePaths} onChange={setImagePaths} error={errors.image_paths} />
      <Input
        label="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="一句话说清楚是什么"
        maxLength={60}
      />
      <Textarea
        label="描述"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        placeholder="尺寸、成色、购买年份、闲置原因等"
        maxLength={2000}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="number"
          min={0}
          step={1}
          label="价格（€，免费送填 0）"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          error={errors.price}
          placeholder="0"
        />
        <Select
          label="分类"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="请选择"
          error={errors.category}
          options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
        />
        <Select
          label="成色"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="请选择"
          error={errors.condition}
          options={CONDITIONS.map((c) => ({ value: c.id, label: c.label }))}
        />
        <Select
          label="所在区"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="请选择"
          error={errors.district}
          options={DISTRICTS.map((d) => ({ value: d.id, label: d.label }))}
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
      <p className="text-xs text-brand-muted leading-relaxed">
        发布即代表同意我们的<a href="/rules" className="underline">规则</a>。
        新用户的前 3 件商品会进入人工审核，触发敏感词的商品也会进入审核队列。
      </p>
      <Button type="submit" size="lg" loading={loading} className="w-full">
        发布闲置
      </Button>
    </form>
  )
}
