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
  console.log(`🗄️ [Cart Storage] getOrCreateCart chamado com sessionId: '${sessionId}'`);
  console.log(`🗄️ [Cart Storage] Chaves existentes no Map:`, Array.from(cartStorage.keys()));
  console.log(`🗄️ [Cart Storage] Total de carrinhos no Map: ${cartStorage.size}`);
  
  let cart = cartStorage.get(sessionId)
  if (!cart) {
    console.log(`➕ [Cart Storage] Criando novo carrinho para sessionId: '${sessionId}'`);
    cart = {
      sessionId,
      items: [],
      total: 0
    }
    cartStorage.set(sessionId, cart)
    console.log(`✅ [Cart Storage] Novo carrinho criado e salvo`);
  } else {
    console.log(`✅ [Cart Storage] Carrinho existente encontrado:`, cart);
  }
  return cart
}

// Função utilitária para salvar carrinho
export function saveCart(cart: CartData): void {
  console.log(`💾 [Cart Storage] saveCart chamado para sessionId: '${cart.sessionId}'`);
  console.log(`💾 [Cart Storage] Carrinho antes de salvar:`, cart);
  cart.total = recalculateCartTotal(cart)
  console.log(`💾 [Cart Storage] Total recalculado: ${cart.total}`);
  cartStorage.set(cart.sessionId, cart)
  console.log(`✅ [Cart Storage] Carrinho salvo no Map`);
  console.log(`🗄️ [Cart Storage] Chaves no Map após salvar:`, Array.from(cartStorage.keys()));
}