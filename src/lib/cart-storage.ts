// Importar função de cálculo centralizada
import { calculateCartTotal } from '@/lib/utils/api';

// Tipos para os dados do carrinho
export interface CartItem {
  id: string
  name: string
  price: number
  imagePath: string | null
  category: string
  quantity: number
}

export interface CartData {
  sessionId: string
  items: CartItem[]
  total: number
}

// Armazenamento compartilhado em memória para o carrinho
// Em produção, usar Redis ou banco de dados
export const cartStorage = new Map<string, CartData>()

// Função utilitária para recalcular o total do carrinho
export function recalculateCartTotal(cart: CartData): number {
  return calculateCartTotal(cart.items);
}

// Função utilitária para obter ou criar um carrinho
export function getOrCreateCart(sessionId: string): CartData {
  let cart = cartStorage.get(sessionId)
  if (!cart) {
    cart = {
      sessionId,
      items: [],
      total: 0
    }
    cartStorage.set(sessionId, cart)
  }
  return cart
}

// Função utilitária para salvar carrinho
export function saveCart(cart: CartData): void {
  cart.total = recalculateCartTotal(cart)
  cartStorage.set(cart.sessionId, cart)
}