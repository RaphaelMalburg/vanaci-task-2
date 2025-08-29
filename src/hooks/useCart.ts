'use client'

import { useCartStore } from '@/stores/cart-store'
import { useCartSync } from '@/lib/services/cart-sync.service'
import { useState, useEffect } from 'react'

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

export function useCart() {
  // Use Zustand store for global state management
  const { items, total, itemCount, addItem, removeItem, updateQuantity, clearCart, getItemCount } = useCartStore()
  
  // Use cart sync service
  const { syncFromBackend, startAutoSync, stopAutoSync, getSessionId } = useCartSync()
  
  // Get session ID from sync service
  const sessionId = getSessionId()
  
  // Start auto-sync when component mounts
  useEffect(() => {
    // Initial sync from backend
    syncFromBackend()
    
    // Start auto-sync every 10 seconds
    startAutoSync(10000)
    
    // Cleanup on unmount
    return () => {
      stopAutoSync()
    }
  }, [])

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