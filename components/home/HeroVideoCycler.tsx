'use client'

import { useState } from 'react'

/**
 * Hero 右侧视频循环播放器。
 * - 按顺序播放 VIDEOS 列表里的每个视频
 * - 当前视频播完 (onEnded) 自动切到下一个
 * - 最后一个播完循环回第一个
 * - 用 key={src} 让 React 在 src 切换时重挂载 video 元素，触发 autoplay
 *
 * 要新增/移除视频：直接编辑 VIDEOS 数组。
 * 文件放在 public/ 下，路径加前导 `/`。
 */

const VIDEOS = ['/HERO1.mp4', '/HERO2.mp4', '/HERO3.mp4']

export default function HeroVideoCycler() {
  const [index, setIndex] = useState(0)

  function handleEnded() {
    setIndex((i) => (i + 1) % VIDEOS.length)
  }

  return (
    <div className="relative aspect-video">
      <video
        key={VIDEOS[index]}
        src={VIDEOS[index]}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onEnded={handleEnded}
        aria-label={`有人要吗 品牌视频 ${index + 1}/${VIDEOS.length}`}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
}
