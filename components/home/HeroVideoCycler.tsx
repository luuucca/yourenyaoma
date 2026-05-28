'use client'

import { useState } from 'react'

/**
 * Hero 右侧视频播放器。
 * - 单个视频 → 用原生 loop 无缝循环（无重挂载闪烁）
 * - 多个视频 → onEnded 顺序切换循环
 *
 * 要换视频：编辑 VIDEOS。文件放 public/ 下，路径加前导 `/`。
 */

const VIDEOS = ['/HERONEW.mp4']

export default function HeroVideoCycler() {
  const [index, setIndex] = useState(0)
  const single = VIDEOS.length === 1

  function handleEnded() {
    if (!single) setIndex((i) => (i + 1) % VIDEOS.length)
  }

  // 视频四角是纯白(#fff)，但边界处有压缩纹理 + 中间淡冷调，跟页面纯白对接有发丝级色差。
  // 给四边各羽化 14px 到透明 → 边缘透出页面白(#fff，与视频边缘同色)，接缝彻底消失。
  // 用两层 linear-gradient 交集，只羽化外缘，中心 100% 清晰、不切主体。
  const feather =
    'linear-gradient(to right, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%), ' +
    'linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%)'

  return (
    <div className="relative aspect-video">
      <video
        key={VIDEOS[index]}
        src={VIDEOS[index]}
        autoPlay
        muted
        playsInline
        loop={single}
        preload="metadata"
        onEnded={handleEnded}
        aria-label="有人要吗 品牌视频"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          WebkitMaskImage: feather,
          maskImage: feather,
          WebkitMaskComposite: 'source-in',
          maskComposite: 'intersect',
        }}
      />
    </div>
  )
}
