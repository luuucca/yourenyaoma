'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

// Compact mobile bottom nav. 7 items — odd count so 「发布」 sits truly center,
// 3 items on each side. 「发布」 is the visual anchor: black filled circle with
// yellow plus, raised above the rail.
//
// Icons are inline lucide-style line SVGs (1.7px stroke) — no emoji, no
// raster icon library. Stays on brand and crisp on hi-dpi.
type Item = {
  href: string
  label: string
  icon: React.ReactNode
  /** Highlights as primary CTA */
  primary?: boolean
}

const items: Item[] = [
  { href: '/', label: '首页', icon: <IconHome /> },
  { href: '/browse', label: '浏览', icon: <IconCompass /> },
  { href: '/buddies', label: '搭子', icon: <IconUsers /> },
  { href: '/publish', label: '发布', icon: <IconPlus />, primary: true },
  { href: '/pros', label: '师傅', icon: <IconWrench /> },
  { href: '/jobs', label: '工作', icon: <IconBriefcase /> },
  { href: '/me', label: '我的', icon: <IconUser /> },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="底部导航"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-brand-line pb-[max(env(safe-area-inset-bottom,0px),0px)]"
    >
      <div className="grid grid-cols-7">
        {items.map((it) => {
          const active =
            pathname === it.href || (it.href !== '/' && pathname.startsWith(it.href))
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center pt-2 pb-1.5 gap-0.5 text-[10px] font-medium transition-colors',
                active ? 'text-brand-ink' : 'text-brand-muted',
                'hover:text-brand-ink active:opacity-80',
              )}
            >
              {it.primary ? (
                // Raised primary CTA — black pill with yellow plus
                <span className="-mt-3 mb-0.5 w-11 h-11 rounded-full bg-brand-ink text-brand-yellow flex items-center justify-center shadow-pill">
                  {it.icon}
                </span>
              ) : (
                <span className="w-6 h-6 flex items-center justify-center">{it.icon}</span>
              )}
              <span>{it.label}</span>
              {/* Tiny black indicator dot under active label */}
              {active && !it.primary && (
                <span
                  className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-ink"
                  aria-hidden
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// === Icons (lucide-style, 24x24 viewBox, stroke 1.6) ====================

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={22}
      height={22}
      aria-hidden
    >
      {children}
    </svg>
  )
}

function IconHome() {
  return (
    <Svg>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </Svg>
  )
}

function IconCompass() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2.1 5L8.5 15.5l2.1-5z" />
    </Svg>
  )
}

function IconUsers() {
  return (
    <Svg>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 19c.5-3 3.4-5 6.5-5s6 2 6.5 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 14c2.6 0 4.7 1.6 5 4" />
    </Svg>
  )
}

function IconWrench() {
  return (
    <Svg>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L15 12l-3-3z" />
    </Svg>
  )
}

function IconPlus() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      width={22}
      height={22}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconUser() {
  return (
    <Svg>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4 20c.8-3.8 4.2-6 8-6s7.2 2.2 8 6" />
    </Svg>
  )
}

function IconBriefcase() {
  return (
    <Svg>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </Svg>
  )
}
