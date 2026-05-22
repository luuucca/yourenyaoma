// 客户端图片压缩。在 ImageUploader 中调用。
export async function compressImage(
  file: File,
  { maxSize = 1600, quality = 0.82, mime = 'image/webp' as 'image/webp' | 'image/jpeg' } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * ratio)
  const h = Math.round(bitmap.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2d 不可用')
  ctx.drawImage(bitmap, 0, 0, w, h)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('图片压缩失败'))),
      mime,
      quality,
    )
  })
}
