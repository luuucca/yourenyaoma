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
      />
    </div>
  )
}
