'use client'

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

function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function getStoredCart(): CartData {
  if (typeof window === 'undefined') {
    return {
      sessionId: generateSessionId(),
      items: [],
      total: 0
    }
  }

  const stored = localStorage.getItem('pharmacy_cart')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return {
        sessionId: parsed.sessionId || generateSessionId(),
        items: parsed.items || [],
        total: parsed.total || 0
      }
    } catch {
      // Se houver erro no parse, criar novo carrinho
    }
  }

  return {
    sessionId: generateSessionId(),
    items: [],
    total: 0
  }
}

function saveCart(cartData: CartData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cartData))
  }
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

export function useCart() {
  const [cart, setCart] = useState<CartData>(() => getStoredCart())

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.id === product.id)
      
      let newItems: CartItem[]
      if (existingItem) {
        newItems = prevCart.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...prevCart.items, { ...product, quantity: 1 }]
      }

      const newTotal = calculateTotal(newItems)
      
      return {
        ...prevCart,
        items: newItems,
        total: newTotal
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== productId)
      const newTotal = calculateTotal(newItems)
      
      return {
        ...prevCart,
        items: newItems,
        total: newTotal
      }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
      const newTotal = calculateTotal(newItems)
      
      return {
        ...prevCart,
        items: newItems,
        total: newTotal
      }
    })
  }

  const clearCart = () => {
    setCart({
      sessionId: generateSessionId(),
      items: [],
      total: 0
    })
  }

  const getItemCount = (productId?: string) => {
    if (productId) {
      const item = cart.items.find(item => item.id === productId)
      return item ? item.quantity : 0
    }
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    sessionId: cart.sessionId
  }
}