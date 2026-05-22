import { cn } from '@/lib/utils/cn'

type Variant =
  | 'default'
  | 'yellow'
  | 'free'
  | 'sold'
  | 'pending'
  | 'rejected'
  | 'hidden'
  | 'urgent'
  | 'featured'

const variants: Record<Variant, string> = {
  default: 'bg-brand-cream text-brand-ink border border-brand-line',
  yellow: 'bg-brand-yellow text-brand-ink',
  free: 'bg-brand-free text-white',
  sold: 'bg-brand-muted text-white',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-700',
  hidden: 'bg-gray-200 text-gray-600',
  urgent: 'bg-brand-danger text-white',
  featured: 'bg-brand-yellow text-brand-ink',
}

export function Badge({
  variant = 'default',
  children,
  className,
}: {
  variant?: Variant
  children: React.ReactNode
  className?: string
}) {
  return <span className={cn('chip', variants[variant], className)}>{children}</span>
}
