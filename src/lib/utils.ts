import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getActiveTier(tiers: { price_ars: number; active: boolean; starts_at: string; ends_at: string }[]): { price_ars: number } | null {
  if (!tiers?.length) return null
  const now = new Date()
  const active = tiers.filter(t =>
    t.active &&
    new Date(t.starts_at) <= now &&
    now <= new Date(t.ends_at),
  )
  if (!active.length) return null
  return active.sort((a, b) => a.price_ars - b.price_ars)[0]
}
