import { useState, useCallback } from 'react'

export interface CartItem {
  serviceId: string
  title: string
  category: string
  price: number
  imageUrl: string | null
  partnerName: string
}

function storageKey(orderId: string) {
  return `upsell-cart-${orderId}`
}

function loadCart(orderId: string): CartItem[] {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey(orderId)) ?? '[]')
  } catch {
    return []
  }
}

function saveCart(orderId: string, items: CartItem[]) {
  sessionStorage.setItem(storageKey(orderId), JSON.stringify(items))
}

export function useUpsellCart(orderId: string) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart(orderId))

  const persist = useCallback((next: CartItem[]) => {
    setItems(next)
    saveCart(orderId, next)
  }, [orderId])

  const add = useCallback((item: CartItem) => {
    setItems(prev => {
      if (prev.find(i => i.serviceId === item.serviceId)) return prev
      const next = [...prev, item]
      saveCart(orderId, next)
      return next
    })
  }, [orderId])

  const remove = useCallback((serviceId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.serviceId !== serviceId)
      saveCart(orderId, next)
      return next
    })
  }, [orderId])

  const toggle = useCallback((item: CartItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.serviceId === item.serviceId)
      const next = exists
        ? prev.filter(i => i.serviceId !== item.serviceId)
        : [...prev, item]
      saveCart(orderId, next)
      return next
    })
  }, [orderId])

  const clear = useCallback(() => persist([]), [persist])

  const has = (serviceId: string) => !!items.find(i => i.serviceId === serviceId)
  const total = items.reduce((sum, i) => sum + i.price, 0)

  return { items, add, remove, toggle, clear, has, total }
}
