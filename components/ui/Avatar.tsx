import Image from 'next/image'

/**
 * 统一头像组件。
 * - 有 avatar_url → 显示上传的头像图
 * - 没有 → 显示昵称首字（黄底圆形占位）
 *
 * 纯展示组件，服务端/客户端都能用。size 同时控制宽高（圆形）。
 */
export default function Avatar({
  src,
  name,
  size = 40,
  className = '',
}: {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
}) {
  const letter = (name ?? '').trim().charAt(0) || '?'
  // 首字大小随直径缩放，约 0.42×
  const fontSize = Math.round(size * 0.42)

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-brand-yellow-soft flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name ? `${name} 的头像` : '头像'}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span className="font-medium text-brand-ink leading-none" style={{ fontSize }}>
          {letter}
        </span>
      )}
    </div>
  )
}
