# Hero Video Prompt — 有人要吗

放在首页 Hero 右侧 1:1 视频位（替换 `[ video.coming ]` 占位框）。

---

## 🎬 推荐方向 · 极简纸艺定格（与品牌手绘 PNG 完美呼应）

### English prompt（Sora / Veo 3 / Runway Gen-3 / Pika）

```
A single cardboard moving box sits centered on a warm cream-paper
(#FAF8F2) surface, photographed from a slight three-quarter overhead
angle. The box flaps are open. Over 8 seconds, everyday secondhand
objects rise out of the box one by one in slow, weightless motion —
a small green velvet dining chair, a brass desk lamp, a vintage film
camera, a teal canvas sneaker, a black game controller, a small
handbag, an acoustic guitar — drifting upward and gently rotating in
mid-air, then settling back into the box at the end of the loop.
The final frame matches the first frame exactly for seamless looping.

Aesthetic: editorial minimalism in the spirit of MUJI catalogs and
Pentagram editorial covers. Soft diffused daylight from the upper
left. Faint paper-grain texture across the entire frame. Muted color
palette: warm cream (#FAF8F2), charcoal black (#0d0d0d), and a single
mustard yellow (#F4C300) accent that appears only on a small
handwritten "要吗?" paper sticker resting on one box flap. Shallow
depth of field with the box in sharp focus and items slightly softer
when at the apex of their rise.

Items render like illustrated paper cutouts with stop-motion parallax
— hand-crafted feel, not glossy 3D. Calm, hypnotic, deliberate pacing.

Negatives: no glossy 3D render, no purple/blue gradient, no
glassmorphism, no neon, no oversaturated colors, no AI-typical
hyperreal faces or hands, no chaotic motion, no on-screen text or
watermarks, no music, no voiceover, no people.

Format: 1:1 square aspect ratio · 1440×1440 resolution · 8 seconds ·
24fps · designed for seamless looping (last frame === first frame).
```

### 中文版（可灵 Kling / 海螺 / 即梦 / Vidu）

```
一个开着盖的瓦楞纸箱放在温柔米白色 (#FAF8F2) 的纯净台面中央，
从轻微俯视的三分之一角度拍摄。8 秒钟内，箱子里的二手好物一件件
从箱口缓慢、失重地浮起 —— 一把小巧的绿色绒面餐椅、一盏黄铜台灯、
一台复古胶片相机、一只青色帆布运动鞋、一个黑色游戏手柄、一只小手提包、
一把木质吉他，每件物品在空中轻轻旋转后又平稳落回箱中，
最后一帧完全等同于第一帧，可以无缝循环。

视觉风格：无印良品产品手册式的编辑部极简、柔和的漫射自然光从左上方
打来、隐约的纸张颗粒质感、暖米色 (#FAF8F2) + 炭黑 (#0d0d0d) +
一点芥末黄 (#F4C300) 的克制色板 —— 黄色只出现在箱口贴着的一张
手写小贴纸「要吗?」上。轻微景深，纸箱锐利、物品到达顶点时略微
柔焦。

物品呈现为定格停格动画中的纸艺剪影感，手工质感不要光面 3D 渲染。
慢节奏、催眠感、不抖。

不要：3D 高光渲染、紫蓝渐变、玻璃拟态、霓虹色、过饱和色、
AI 典型过度真实人脸/手、混乱抖动、字幕水印、音乐解说、人物入镜。

输出参数：1:1 正方形、1440×1440、8 秒、24fps、首尾帧一致便于无缝循环。
```

---

## 🎛 关键技术参数

| 项 | 建议 | 原因 |
|---|---|---|
| 时长 | 8 秒 | 比 5 秒有呼吸感；超过 12 秒用户已读完文字 |
| 比例 | **1:1** | 现 Hero 视频位就是 aspect-square |
| fps | 24 | 比 30/60 更"电影感"、更克制 |
| 音频 | 无 | Hero autoplay 必须 muted，省去切换逻辑 |
| 循环点 | 首=尾帧 | 用 "seamless loop / loops perfectly" 关键词强化 |
| 导出 | MP4 (H.264) 主流 + WebM (VP9) 备份 | 跨浏览器兼容 |

---

## 🔄 备选方向（如果主推不喜欢）

1. **极简光影** — 全屏暖米色背景，只有一束柔黄光从画面外缓慢扫过，
   纸箱阴影渐显渐隐。比纸艺更高冷、更杂志风。
2. **手部演绎** — 真人手（特写，无脸）从画面外伸入，把一件件二手
   物品轻轻放进开盖的纸箱里，自然光、暖色调。比纸艺更有人情味，
   但风险是 AI 模型出"假手"。
3. **大字 mask reveal** — 全屏文字"你不要的"逐字消解成像素，
   重组为"正好有人要"。冲击力强但偏 SaaS 演示腔。

---

## 📥 拿到视频后接到代码里

视频文件丢到 `public/hero-video.mp4`（再来一份 `.webm` 备份更稳），
然后告诉我"视频做好了"，我把 `Hero.tsx` 里的占位框换成：

```tsx
<video
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  poster="/hero-video-poster.jpg"
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/hero-video.webm" type="video/webm" />
  <source src="/hero-video.mp4" type="video/mp4" />
</video>
```

`poster` 是视频未加载时显示的静态图（你可以用任一帧截图）。
