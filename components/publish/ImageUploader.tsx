'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/compressImage'
import { useToast } from '@/components/ui/Toast'

const MAX_IMAGES = 9

export function ImageUploader({
  paths,
  onChange,
  error,
  onFirstImageUploaded,
}: {
  paths: string[]
  onChange: (paths: string[]) => void
  error?: string
  /** 用户成功上传第一张图后触发（用于触发 AI 识别建议） */
  onFirstImageUploaded?: (path: string) => void
}) {
  const { show } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const remaining = MAX_IMAGES - paths.length
    if (files.length > remaining) {
      show(`最多 ${MAX_IMAGES} 张图片`, 'error')
    }
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      show('请先登录', 'error')
      return
    }
    setUploading(true)
    const newPaths: string[] = []
    for (const file of files.slice(0, remaining)) {
      try {
        const blob = await compressImage(file)
        const filename = `${user.id}/${crypto.randomUUID()}.webp`
        const { error: upErr } = await supabase.storage
          .from('listings')
          .upload(filename, blob, { contentType: 'image/webp', upsert: false })
        if (upErr) {
          show(`上传失败：${upErr.message}`, 'error')
          continue
        }
        newPaths.push(filename)
      } catch (e: any) {
        show(`处理图片失败：${e?.message || '未知错误'}`, 'error')
      }
    }
    setUploading(false)
    onChange([...paths, ...newPaths])
    if (inputRef.current) inputRef.current.value = ''
    // 第一张图上传完毕 → 触发 AI 识别（如果调用方注册了 handler）
    if (paths.length === 0 && newPaths.length > 0 && onFirstImageUploaded) {
      onFirstImageUploaded(newPaths[0])
    }
  }

  function remove(idx: number) {
    onChange(paths.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="text-sm font-medium mb-2">
        商品图片
        <span className="text-brand-muted font-normal ml-1">
          ({paths.length}/{MAX_IMAGES})
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {paths.map((p, i) => (
          <div
            key={p}
            className="relative aspect-square rounded-xl overflow-hidden bg-brand-cream"
          >
            <Image
              src={`${supabaseUrl}/storage/v1/object/public/listings/${p}`}
              alt=""
              fill
              className="object-cover"
              sizes="120px"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs leading-none hover:bg-black"
              aria-label="移除"
            >
              ×
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-brand-yellow text-brand-ink text-[10px] px-1.5 py-0.5 rounded">
                封面
              </span>
            )}
          </div>
        ))}
        {paths.length < MAX_IMAGES && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-brand-line bg-white hover:border-brand-yellow flex flex-col items-center justify-center gap-1 text-sm text-brand-muted disabled:opacity-50"
          >
            <span className="text-2xl">＋</span>
            <span>{uploading ? '上传中…' : '添加图片'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />
      <p className="text-xs text-brand-muted mt-2">
        第 1 张作为封面，会自动压缩到合适大小
      </p>
      {error && <p className="text-xs text-brand-danger mt-1">{error}</p>}
    </div>
  )
}
