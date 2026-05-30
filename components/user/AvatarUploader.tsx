'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import Avatar from '@/components/ui/Avatar'

/**
 * 头像上传。选图后立即：中心方形裁剪 → 压到 512 webp → 传 avatars/{uid}/
 * → 写回 profiles.avatar_url → 删除旧头像文件。即时保存（不等表单提交）。
 */

const BUCKET = 'avatars'
const SIZE = 512 // 输出方形边长
const MAX_BYTES = 5 * 1024 * 1024 // 选图前的原图上限 5MB

/** 中心方形裁剪 + 缩放到 SIZE，输出 webp blob */
async function toSquareWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2d 不可用')
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('图片处理失败'))),
      'image/webp',
      0.85,
    )
  })
}

/** 从公开 URL 反解出存储路径（…/avatars/{uid}/{file} → {uid}/{file}） */
function pathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = `/${BUCKET}/`
  const i = url.indexOf(marker)
  if (i === -1) return null
  return url.slice(i + marker.length).split('?')[0] || null
}

export default function AvatarUploader({
  initialUrl,
  nickname,
}: {
  initialUrl?: string | null
  nickname?: string | null
}) {
  const { show } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState<string | null>(initialUrl ?? null)
  const [uploading, setUploading] = useState(false)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = '' // 允许重复选同一张
    if (!file) return
    if (!file.type.startsWith('image/')) {
      show('请选择图片文件', 'error')
      return
    }
    if (file.size > MAX_BYTES) {
      show('图片太大了，请选 5MB 以内的', 'error')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setUploading(false)
      show('请先登录', 'error')
      return
    }

    try {
      const blob = await toSquareWebp(file)
      const path = `${user.id}/${crypto.randomUUID()}.webp`
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: 'image/webp', upsert: false })
      if (upErr) throw upErr

      const newUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: newUrl })
        .eq('id', user.id)
      if (dbErr) throw dbErr

      // 删旧头像（best-effort，失败不影响）
      const oldPath = pathFromPublicUrl(url)
      if (oldPath && oldPath !== path) {
        await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {})
      }

      setUrl(newUrl)
      show('头像已更新', 'success')
    } catch (err: any) {
      show(`上传失败：${err?.message || '未知错误'}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={url} name={nickname} size={72} />
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-pill border border-brand-ink px-4 py-2 text-[13px] font-medium hover:bg-brand-ink hover:text-white active:translate-y-px transition-all disabled:opacity-50"
        >
          {uploading ? '上传中…' : url ? '更换头像' : '上传头像'}
        </button>
        <p className="text-[12px] text-brand-muted mt-1.5">支持 JPG / PNG，自动裁成方形</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
    </div>
  )
}
