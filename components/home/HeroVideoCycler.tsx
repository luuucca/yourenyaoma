'use client'

import { useState } from 'react'

/**
 * Hero 右侧视频播放器。
 * - 单个视频 → 用原生 loop 无缝循环（无重挂载闪烁）
 * - 多个视频 → 播完一个 onEnded 顺序切下一个，循环
 *
 * 切换靠 key 重挂载触发 autoPlay；再用 onCanPlay 补一发 play() 兜底
 * （iOS / 部分移动端 remount 后偶尔不自动播）。onError 直接跳下一个，
 * 避免某个文件解码失败把整个轮播卡死。
 *
 * 注意：HERONEW.mp4 约 15s、HERONEW2.mp4 约 10s —— 是「播完再切」不是同时播，
 * 所以第二个视频要等第一个放完才出现。要换视频：编辑 VIDEOS（路径加前导 `/`）。
 */

const VIDEOS = ['/HERONEW.mp4', '/HERONEW2.mp4']

export default function HeroVideoCycler() {
  const [index, setIndex] = useState(0)
  const single = VIDEOS.length === 1

  function next() {
    if (!single) setIndex((i) => (i + 1) % VIDEOS.length)
  }

  // 视频四角是纯白(#fff)，但边界处有压缩纹理 + 中间淡冷调，跟页面纯白对接有发丝级色差。
  // 给四边各羽化 24px 到透明 → 边缘透出页面白(#fff，与视频边缘同色)，接缝彻底消失。
  // 用两层 linear-gradient 交集，只羽化外缘，中心 100% 清晰、不切主体。
  const feather =
    'linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%), ' +
    'linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)'

  return (
    <div className="relative aspect-video">
      <video
        key={VIDEOS[index]}
        src={VIDEOS[index]}
        autoPlay
        muted
        playsInline
        loop={single}
        preload="auto"
        onEnded={next}
        onError={next}
        onCanPlay={(e) => {
          // remount 后偶尔不自动播 → 补一发，确保第二个视频也会动
          const v = e.currentTarget
          if (v.paused) v.play().catch(() => {})
        }}
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
