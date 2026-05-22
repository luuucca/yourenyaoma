import type { Config } from 'tailwindcss'

const config: Config = {
  // Tailwind needs to scan lib/ too — hangoutCover.ts holds gradient class
  // strings like `bg-gradient-to-br from-[#1a1a2e] to-[#3d1e3d]` that
  // otherwise get tree-shaken out of the compiled CSS.
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F4C300',
          'yellow-soft': '#FFF8DB',
          'yellow-line': 'rgba(244, 195, 0, 0.33)', // #F4C30055 equivalent
          cream: '#FAFAFA',
          paper: '#ffffff',
          ink: '#0d0d0d',
          'ink-soft': '#444444',
          'ink-mid': '#555555',
          muted: '#777777', // tightened from #888 for better AA on 11-12px text
          'muted-soft': '#999999',
          line: '#f0f0f0',
          'line-2': '#efefef',
          'line-3': '#e5e5e5',
          fill: '#F6F6F4', // product card image placeholder
          warm: '#FAF8F2',
          dark: '#0d0d0d',
          'dark-card': '#1a1a1a',
          'dark-border': '#2a2a2a',
          free: '#3DB36B',
          danger: '#E03E3E',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'Noto Sans SC', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Noto Serif SC', 'serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-serif)', 'Noto Serif SC', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        pill: '0 2px 8px rgba(255,200,61,0.35)',
      },
      borderRadius: {
        pill: '9999px',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 42s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
