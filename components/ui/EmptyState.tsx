import Image from 'next/image'

export function EmptyState({
  image = '/illustrations/chair.png',
  title,
  action,
  size = 'md',
}: {
  image?: string
  title: string
  action?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: { box: 'w-20 h-20', card: 'py-8' },
    md: { box: 'w-28 h-28', card: 'py-12' },
    lg: { box: 'w-36 h-36', card: 'py-16' },
  }
  return (
    <div className={`card text-center ${sizes[size].card} px-4`}>
      <div className={`${sizes[size].box} mx-auto relative opacity-80`}>
        <Image
          src={image}
          alt=""
          fill
          className="object-contain"
          sizes="160px"
        />
      </div>
      <p className="text-brand-muted mt-4 text-sm">{title}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
