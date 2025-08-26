'use client'

import { useCartStore } from '@/stores/cart-store'
import { useState } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imagePath?: string
  category: string
}

interface CartData {
  sessionId: string
  items: CartItem[]
  total: number
}

function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export function useCart() {
  // Use Zustand store for global state management
  const { items, total, itemCount, addItem, removeItem, updateQuantity, clearCart, getItemCount } = useCartStore()
  
  // Keep session ID in local state as it's component-specific
  const [sessionId] = useState(() => generateSessionId())

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    addItem(product, 1)
  }

  const removeFromCart = (productId: string) => {
    removeItem(productId)
  }

  const getItemCountForProduct = (productId?: string) => {
    if (productId) {
      const item = items.find(item => item.id === productId)
      return item ? item.quantity : 0
    }
    return getItemCount()
  }

  // Create cart object for backward compatibility
  const cart: CartData = {
    sessionId,
    items,
    total
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount: getItemCountForProduct,
    sessionId
  }
}