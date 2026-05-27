'use client'

import { useRef, type MutableRefObject } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'

/**
 * Apple 风钉屏滚动 hero：5 个场景按 scroll progress 渐变切换。
 *
 * 工作原理：
 * - 外层 section 高度 = 场景数 × 100vh（5 场 = 500vh）
 * - 内层 sticky top-0 h-screen，在用户滚动这段 500vh 时一直钉在视口
 * - useScroll 跟踪 scroll 在 section 内的进度（0 → 1）
 * - 每个场景的 opacity 根据其在序列中的位置映射到 scrollYProgress 区段
 * - 场景 i 的活跃范围：[i/n, (i+1)/n]，加上 ±5% 的淡入淡出 padding
 *
 * 添加视频流程：
 * 1. 用户把视频放到 public/hero-01.mp4 ... hero-05.mp4
 * 2. 把对应 SCENES[i].video 从 null 改成 '/hero-01.mp4' 即可
 * 3. 视频元素自带 autoplay/muted/loop，落到场景时就开始播
 */

type Scene = {
  num: number
  file: string
  /** 设为视频路径 (如 '/hero-01.mp4') 就启用 video；null 时显示占位 */
  video: string | null
}

const SCENES: Scene[] = [
  { num: 1, file: 'HERO1.mp4', video: '/HERO1.mp4' },
  { num: 2, file: 'HERO2.mp4', video: '/HERO2.mp4' },
  { num: 3, file: 'HERO3.mp4', video: '/HERO3.mp4' },
  { num: 4, file: 'HERO4.mp4', video: null },
  { num: 5, file: 'HERO5.mp4', video: null },
]

export default function HeroScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef as MutableRefObject<HTMLDivElement>,
    offset: ['start start', 'end end'],
  })

  return (
    <section
      ref={containerRef}
      style={{ height: `${SCENES.length * 100}vh` }}
      className="relative"
      aria-label="品牌滚动故事 — 5 个镜头"
    >
      {/* Pinned stage：在 500vh 滚动期间一直钉在视口 */}
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        {/* 顶部 mono 标 */}
        <div className="absolute top-8 left-8 md:top-10 md:left-16 z-20 font-mono text-[12px] tracking-[0.18em] text-brand-muted uppercase font-medium">
          OVERSEAS · 海外华人邻里社区
        </div>

        {/* 场景叠层 */}
        {SCENES.map((scene, i) => (
          <SceneFrame
            key={scene.num}
            scene={scene}
            index={i}
            total={SCENES.length}
            scrollYProgress={scrollYProgress}
          />
        ))}

        {/* 右侧进度指示器（5 个圆点） */}
        <ProgressDots scrollYProgress={scrollYProgress} total={SCENES.length} />

        {/* 底部「向下滚」hint，开始滚就淡掉 */}
        <ScrollHint scrollYProgress={scrollYProgress} />
      </div>
    </section>
  )
}

function SceneFrame({
  scene,
  index,
  total,
  scrollYProgress,
}: {
  scene: Scene
  index: number
  total: number
  scrollYProgress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const pad = 0.04 // 4% 的淡入淡出缓冲

  // 第一帧从全可见开始（避免空白），最后一帧到底也保持可见
  const fromOpacity = index === 0 ? 1 : 0
  const toOpacity = index === total - 1 ? 1 : 0

  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, start - pad), start + pad, end - pad, Math.min(1, end + pad)],
    [fromOpacity, 1, 1, toOpacity]
  )

  // 轻微的 zoom-out effect 增加深度感
  const scale = useTransform(
    scrollYProgress,
    [Math.max(0, start - pad), (start + end) / 2, Math.min(1, end + pad)],
    [1.05, 1, 0.96]
  )

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-6"
      style={{ opacity }}
      aria-hidden={index !== 0}
    >
      {scene.video ? (
        <motion.video
          src={scene.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="max-w-full max-h-full object-contain"
          style={{ scale }}
          aria-label={`镜头 ${scene.num}`}
        />
      ) : (
        <motion.div
          style={{ scale }}
          className="flex flex-col items-center gap-8 text-center"
        >
          <div className="font-mono text-[11px] tracking-[0.25em] text-brand-muted-soft uppercase">
            scene {String(scene.num).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </div>
          <div className="font-serif font-bold text-[140px] md:text-[220px] text-brand-ink leading-none tracking-[-0.05em]">
            {String(scene.num).padStart(2, '0')}
          </div>
          <div className="font-mono text-[11px] text-brand-muted tracking-[0.12em] mt-2">
            // 等待文件 <span className="text-brand-ink font-semibold">/{scene.file}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function ProgressDots({
  scrollYProgress,
  total,
}: {
  scrollYProgress: MotionValue<number>
  total: number
}) {
  return (
    <div
      className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20"
      aria-hidden
    >
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} scrollYProgress={scrollYProgress} index={i} total={total} />
      ))}
    </div>
  )
}

function Dot({
  scrollYProgress,
  index,
  total,
}: {
  scrollYProgress: MotionValue<number>
  index: number
  total: number
}) {
  const start = index / total
  const end = (index + 1) / total

  // 当前活跃 dot 放大到 1.8x，背景变实色品牌黑
  const scale = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.04), start + 0.02, end - 0.02, Math.min(1, end + 0.04)],
    [1, 1.8, 1.8, 1]
  )
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.04), start + 0.02, end - 0.02, Math.min(1, end + 0.04)],
    [0.25, 1, 1, 0.25]
  )

  return (
    <motion.div
      style={{ scale, opacity }}
      className="w-2 h-2 rounded-full bg-brand-ink"
    />
  )
}

function ScrollHint({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0, 0.04], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.04], [0, 12])

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
    >
      <span className="font-mono text-[11px] tracking-[0.2em] text-brand-muted uppercase">
        scroll
      </span>
      <span className="block w-px h-8 bg-brand-ink/40 animate-pulse" />
    </motion.div>
  )
}
