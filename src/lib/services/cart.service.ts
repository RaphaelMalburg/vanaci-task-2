import { prisma } from '@/lib/prisma'
import { Product } from '@prisma/client'
import { logger } from '@/lib/logger'
import type { CartItem, CartData } from '@/lib/types'

// Alias para compatibilidade
export type Cart = CartData

export class CartService {
  private static instance: CartService
  private carts: Map<string, Cart> = new Map()

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService()
    }
    return CartService.instance
  }

  private getCartForSession(sessionId: string): Cart {
    if (!this.carts.has(sessionId)) {
      this.carts.set(sessionId, {
        items: [],
        total: 0,
        itemCount: 0
      })
    }
    return this.carts.get(sessionId)!
  }

  async addItem(productId: string, quantity: number = 1, sessionId: string = 'default'): Promise<Cart> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new Error(`Produto com ID ${productId} não encontrado`)
      }

      const cart = this.getCartForSession(sessionId)
      const existingItemIndex = cart.items.findIndex(item => item.id === productId)
      
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity
      } else {
        cart.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.imagePath || undefined,
          category: product.category
        })
      }

      this.updateCartTotals(cart)
      return cart
    } catch (error) {
      logger.error('Erro ao adicionar item ao carrinho:', {
        productId,
        quantity,
        sessionId,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      })
      throw error
    }
  }

  async removeItem(productId: string, sessionId: string = 'default'): Promise<Cart> {
    const cart = this.getCartForSession(sessionId)
    cart.items = cart.items.filter(item => item.id !== productId)
    this.updateCartTotals(cart)
    return cart
  }

  async updateQuantity(productId: string, quantity: number, sessionId: string = 'default'): Promise<Cart> {
    if (quantity <= 0) {
      return this.removeItem(productId, sessionId)
    }

    const cart = this.getCartForSession(sessionId)
    const itemIndex = cart.items.findIndex(item => item.id === productId)
    if (itemIndex >= 0) {
      cart.items[itemIndex].quantity = quantity
      this.updateCartTotals(cart)
    }
    return cart
  }

  async getCart(sessionId: string = 'default'): Promise<Cart> {
    return this.getCartForSession(sessionId)
  }

  async clearCart(sessionId: string = 'default'): Promise<Cart> {
    const cart = {
      items: [],
      total: 0,
      itemCount: 0
    }
    this.carts.set(sessionId, cart)
    return cart
  }

  private updateCartTotals(cart: Cart): void {
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }
}