import Link from 'next/link'

type Props = {
  eyebrow: string
  title: string
  desc?: string
  moreHref?: string
  moreLabel?: string
  invertOnDark?: boolean
  /** Brand-accent the title. Used on homepage section heads for stronger
   *  yellow identity; secondary pages stick with default ink. */
  tint?: 'ink' | 'yellow'
}

// Shared section header: mono eyebrow + Noto Serif SC h2 + muted desc + underline "more" link.
// Matches the Playful Homepage spec — eyebrow uppercase JetBrains Mono 11px tracked,
// h2 32px serif semibold, desc 13px #888, more underlined #444.
export default function SectionHead({
  eyebrow,
  title,
  desc,
  moreHref,
  moreLabel = '查看全部 →',
  invertOnDark = false,
  tint = 'ink',
}: Props) {
  return (
    <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
      <div className="flex items-baseline gap-4 flex-wrap">
        <span
          className={
            'font-mono text-[11px] tracking-[0.2em] uppercase font-medium ' +
            (invertOnDark ? 'text-brand-yellow' : 'text-brand-muted')
          }
        >
          {eyebrow}
        </span>
        {/* bolder: 32→40px desktop + tighter tracking + heavier weight for stronger hierarchy.
            tint='yellow' wraps the title in a black-on-yellow-highlighter span so the
            text stays readable on white (yellow text on white was the problem). */}
        <h2
          className={
            'font-serif text-[28px] md:text-[40px] font-bold m-0 tracking-[-0.025em] leading-[1.05] ' +
            (invertOnDark ? 'text-white' : 'text-brand-ink')
          }
        >
          {tint === 'yellow' ? (
            <span className="text-highlight-yellow">{title}</span>
          ) : (
            title
          )}
        </h2>
        {desc && (
          <span className={'text-[13px] ' + (invertOnDark ? 'text-[#aaa]' : 'text-brand-muted')}>
            {desc}
          </span>
        )}
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className={
            'group text-[13px] underline underline-offset-4 transition-all ' +
            (invertOnDark ? 'text-[#aaa] hover:text-white' : 'text-brand-ink-soft hover:text-brand-ink')
          }
        >
          {moreLabel.replace('→', '')}
          <span className="inline-block transition-transform group-hover:translate-x-1 ml-1" aria-hidden>
            →
          </span>
        </Link>
      )}
    </div>
  )
}
