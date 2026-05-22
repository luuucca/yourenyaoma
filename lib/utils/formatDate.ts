import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN })
}

export function formatAbsoluteDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'yyyy-MM-dd HH:mm')
}
