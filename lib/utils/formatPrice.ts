export function formatPrice(value: number): string {
  if (value === 0) return '免费送'
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}
