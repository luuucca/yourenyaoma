# Design

## Theme & Direction

**Editorial minimalism with neighborly warmth.** 白底为基础，Noto Serif SC 衬线大标题给重量感，单一品牌黄 `#F4C300` 作为高光，JetBrains Mono 做眉标 / 数据 / mini-label，保持 1px 细线 + pill 圆角。整体克制，但通过手绘 PNG 插画（chair / lamp / camera / sneaker / controller / guitar）+ Caveat 手写贴纸 + 黄色高光下划线注入活泼气息。

不是「playful chunky brutalism」，也不是「冷感 SaaS 极简」，是中间那个状态——**像高级生活方式杂志 + 邻居社区告示板的杂交**。

## Color Tokens

### Brand
| Name | Value | 用途 |
|---|---|---|
| `--brand-yellow` | `#F4C300` | 标题高光、CTA 强调、marquee 底色、收藏 pill、找师傅认证徽章 |
| `--brand-yellow-soft` | `#FFF8DB` | 分类块底色（找师傅/找搭子）、tag pill 浅底、礼物盒图标块 |
| `--brand-ink` | `#0d0d0d` | 主文字、Logo、主 CTA 按钮（发布闲置、我要、聊一聊） |
| `--brand-ink-soft` | `#444444` | 次级文字、nav 项默认色 |
| `--brand-muted` | `#888888` | 元信息、眉标颜色、placeholder |

### Surfaces
| Name | Value | 用途 |
|---|---|---|
| `--surface-paper` | `#ffffff` | 卡片底、nav 底、主背景 |
| `--surface-cream` | `#FAFAFA` | 分类块底、信任栏底、Hero 视频占位 |
| `--surface-warm` | `#FAF8F2` | 搬家甩卖 section 暖米色 full-bleed |
| `--surface-dark` | `#0d0d0d` | 安全交易 section 黑底反白 |
| `--surface-dark-card` | `#1a1a1a` | 安全交易卡片底 |
| `--line` | `#f0f0f0` | 主分隔线、卡片边、nav 底边 |
| `--line-2` | `#efefef` | 卡片边（次级）、moving-card 边 |

### Status (保留扩展)
| Name | Value | 用途 |
|---|---|---|
| `--free` | `#3DB36B` | 免费送特殊状态（极少用，主要还是黄章 `FREE`） |
| `--danger` | `#E03E3E` | 错误 / 删除 / 警示 |

不用紫蓝渐变。不用 neon。不用 glassmorphism。

## Typography

### Stacks
- **Headlines / Numbers**: `Noto Serif SC` (400-900) — 中英文都用
- **Body / UI**: `Noto Sans SC` (400-700) — 主正文
- **Mono / Eyebrows / Tags**: `JetBrains Mono` (400-700) — 眉标、tag、数字标签、code-like elements

All loaded via `next/font/google` in `app/layout.tsx`, exposed as `--font-serif` / `--font-noto` / `--font-mono` CSS variables.

### Scale
| Token | Size | Weight | Family | 用途 |
|---|---|---|---|---|
| `hero-headline` | 92px / 56px (mobile) | 600 | Serif | "你不要的，正好有人要" |
| `page-title` | 56px / 40px | 600 | Serif | 二级页面 H1（找师傅 / 找搭子页） |
| `section-h2` | 32px / 28px | 600 | Serif | 「附近的好物」「搬家甩卖专区」 |
| `card-title` | 19px | 600 | Serif | 卡片大标题（h3）|
| `card-title-sm` | 16px | 600 | Serif | 免费送卡标题 |
| `price` | 22px | 600 | Serif | 产品价格 |
| `body` | 14-16px | 400 | Sans | 正文段落 |
| `body-sm` | 13px | 400 | Sans | 描述、meta、副文字 |
| `meta` | 11-12px | 400 | Sans | 元信息、from-line |
| `eyebrow` | 11px | 500 | Mono | `— NEW · 邻居刚上架` |
| `tag` | 10-12px | 500-600 | Mono / Sans | tag pill、badge |
| `letter-spacing` | -0.005em (body) / -0.02em (display) | — | — | 紧凑感 |

### 中文优化
- `font-feature-settings: 'palt'` 全局生效（中文标点紧凑）
- 标点不用 `「」` 包大段，避免视觉断裂
- 中英混排时英文不强行翻译（如 "Gratis"、"Take it"、"video.coming"）

## Spacing & Layout

- **Container max**: `1360px` 居中 + 左右 64px padding（桌面）/ 16px（移动）
- **Section vertical rhythm**:
  - Section 间距：56-80px
  - Section head 到内容：28px
  - 卡片网格 gap：18-20px
- **Card padding**: 12px (product) / 18px (free) / 22px (hangout / pro / moving)
- **Touch target min**: 44×44px (CRITICAL)

## Radius

- `pill`: 9999px (按钮、tag、search bar、avatar 圆环)
- `card`: 16-18px (产品卡 / 师傅卡 / 搭子卡 / 免费送卡)
- `card-tight`: 10px (产品图占位)
- `category-tile`: 16px (分类图标方块)
- `square`: 4px (Logo 黄色小方块、focus-visible outline)

## Elevation

**Minimal elevation philosophy.** Hover 用 1px 边框变黑 + `translateY(-2px)` 提示交互，不用 box-shadow drop。仅以下例外：
- `focus-visible` outline 2px `#F4C300`，offset 2px

不用 glassmorphism。不用 layered shadows。不用 neumorphism。

## Components

### Buttons
| Variant | 视觉 | 用途 |
|---|---|---|
| `dark` | 黑底白字 pill `min-h-44px` | 主 CTA（发布闲置 / 我要 · Take it / 聊一聊 / 加入） |
| `outline-ink` | 1px 黑边白底 | 搜索框内置按钮 |
| `text-link` | underline-4 黑字 hover→ink | "去逛逛 →" / "查看全部 →" |
| `pill-tag` | 1px 灰边 hover→黑底白字 | 热门搜索 pill |
| `pill-tag-yellow` | 黄底浅 + 1px 黄边 + 黑字 | 搭子局 tag、找师傅认证条 |

### Cards
| Pattern | 视觉 | 用途 |
|---|---|---|
| Product card | 1px `#efefef` + 16px radius + 4:3 image area + 3px stripe pattern | 附近的好物 |
| Moving card | 1px `#efefef` + 18px radius + 16:9 preview + 暖米底 section | 搬家甩卖 |
| Hangout card | 1px `#efefef` + 16px radius + 黄底 tag + 衬线标题 + 时间地点行 + 黄 pill 缺位 | 找搭子 |
| Pro card | 圆头像（黄底浅 + 1px 黄边）+ 黑底黄字 ✓ 已认证 + 3 列 meta 边线 | 找师傅 |
| Free card | 18px radius + 黄章 `FREE` + 🎁 黄底块 + 衬线标题 + 黑底「Take it」 | 免费送 |
| Safety step | 1a 深灰底 + 2a 边 + 56px 衬线数字（黄 40%）| 安全交易 3 步 |

### Section Header
固定模式：mono 眉标（`— TYPE · 中文描述`）+ 衬线 32px h2 + 灰色描述 + 右上 underline 「查看全部 →」。共享组件 `<SectionHead>`。

### Logo
serif 22px 700 「有人要吗」 + 黄色 8×8 圆角方块 dot（vertical translate -2px）。

### Marquee
黄底黑字 + 6 条消息 42s linear infinite + dot 分隔。`prefers-reduced-motion` 暂停。

## Iconography

混合策略：
- **手绘 PNG 插画**（来自设计稿）：chair / lamp / camera / bag / sneaker / controller / guitar / tools / buddies-icon — 用于分类入口、空状态。这些是品牌核心视觉资产。
- **System emoji**：🕛 📍 🎁 ♡ ✓ — 用于卡片内 inline 元信息（成本低、跨平台一致）
- **SVG inline**：放大镜（搜索）、video play (hero 占位)、checkmark (认证) — 用于强交互元素

不要 lucide / heroicons 系列灰色单色图标，会冲淡品牌温度。

## Motion

### Easing
- 默认 `ease-out` (Tailwind 默认)
- 卡片 hover：`transition-all duration-200`
- Marquee：`linear 42s infinite`

### 不用
- `bounce` / `elastic` 缓动（cheap 感）
- 自动旋转 carousel（除 marquee 外）
- 默认 framer-motion spring（除非用 ease-out-quart 等手动 cubic-bezier）

### 强制
- `@media (prefers-reduced-motion: reduce)` 全局降到 0.01ms

## Voice & Tone (UI Copy)

- 标题：陈述句 / 邀请句（"附近的好物"、"找搭子"），不用「最新 / 热门 / 推荐」这类功能词
- 按钮：2-4 字白话（我要 · Take it / 聊一聊 / 我要加入），不用「立即」「点击」
- Section 描述：一句话讲透（"3 km 以内 · 实时刷新 · 站内 IM 聊价 · 公共场所自取"），用 `·` 分隔
- Marquee：邻居告示板感（"搬家季 · 5 月专题 · 整屋打包好物上线"），不要"限时秒杀"
- 空状态：邻居语气（"还没有人发布闲置 — 来做第一个吧"），不要"暂无数据"

## Diagonal Announcement Marquee — 邻里告示板

**Position**: Between `CategoryGrid` and `LatestListings` — serves as the *"first scroll moment"* visual hook (per web-design skill 首页爆点原则二).

**Construction**:
- **Outer clipper**: `relative overflow-hidden`, generous vertical padding (`py-10 md:py-16`) — reserves space for the tilted band's top-left and bottom-right corners.
- **Tilted band**: `rotate-[-3deg]` applied to the SAME div that carries the background + borders. Width extends `-mx-[10%]` on each side so both ends bleed off the viewport edges. Background `bg-brand-ink` (black), top + bottom borders `border-y-[4px] border-brand-yellow`.
- **Marquee track**: Two copies of the items in a single `flex` container. Animation translates `0 → -50%` for a perfectly seamless loop (the second copy slides exactly into the first copy's start position).

**Token usage**:
- `bg-brand-ink` (#0d0d0d) — band fill
- `border-brand-yellow` (#F4C300) — top + bottom 4px rules
- `text-white` — message text
- `bg-brand-yellow` rotated diamond — message separator
- Font: **Noto Sans SC bold 700** at `text-[22px] md:text-[28px]` — "大字 marquee" per web-design skill principle

**Motion**:
- Duration `50s linear infinite`
- Pauses on hover (`group-hover:[animation-play-state:paused]`)
- Fully halted under `prefers-reduced-motion`
- Tilt is purely transform — no layout reflow

**Anti-patterns avoided**:
- ❌ `absolute` positioning hacks (loses natural document flow)
- ❌ Horizontal black bar with rotated text only inside (band edges stay horizontal — wrong)
- ❌ `pl-[100%]` + `translateX(-100%)` (creates a visible gap each loop)
- ✅ Duplicated content + `translateX(-50%)` (perfect seamless loop)

## Hero Particulars

**Hero 是品牌门面，特殊对待**：
- Eyebrow: `OVERSEAS · 海外华人邻里社区` mono 11px tracked 0.18em
- H1: serif 92px / 600 / `letter-spacing: -0.02em` — "你不要的，<br/>正好有人要" 后半段加黄色 highlighter 62%-86% gradient
- Sub: 19px sans / 行高 1.6 / 480px max-width
- Search: 1px 黑边 pill + 18px 放大镜 + placeholder「搜沙发 · 找翻译 · 约球友 · 免费送…」+ 黑底搜索按钮
- 6 热门搜索 pill (IKEA 沙发 / 搬家甩卖 / 自行车 / MacBook / 中文书 / 免费送)
- 右侧：1:1 视频占位框 (`#FAFAFA` + 1px 边 + 黑底黄字 `[ video.coming ]` 标签)
