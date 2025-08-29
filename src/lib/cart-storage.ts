// Importar função de cálculo centralizada e serviço Redis
import { calculateCartTotal } from '@/lib/utils/api';
import { CartRedisService, Cart as RedisCart, CartItem as RedisCartItem } from '@/lib/redis';

// Tipos para os dados do carrinho (mantendo compatibilidade)
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

// Função utilitária para converter CartItem para RedisCartItem
function toRedisCartItem(item: CartItem): RedisCartItem {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.imagePath || undefined,
    description: item.category
  };
}

// Função utilitária para converter RedisCartItem para CartItem
function fromRedisCartItem(item: RedisCartItem): CartItem {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    imagePath: item.image || null,
    category: item.description || ''
  };
}

// Função utilitária para converter RedisCart para CartData
function fromRedisCart(redisCart: RedisCart): CartData {
  return {
    sessionId: redisCart.sessionId,
    items: redisCart.items.map(fromRedisCartItem),
    total: redisCart.total
  };
}

// Função utilitária para recalcular o total do carrinho
export function recalculateCartTotal(cart: CartData): number {
  return calculateCartTotal(cart.items);
}

// Função utilitária para obter ou criar um carrinho (agora usando Redis)
export async function getOrCreateCart(sessionId: string): Promise<CartData> {
  console.log(`🗄️ [Cart Storage Redis] getOrCreateCart chamado com sessionId: '${sessionId}'`);
  
  try {
    let redisCart = await CartRedisService.getCart(sessionId);
    
    if (!redisCart) {
      console.log(`➕ [Cart Storage Redis] Criando novo carrinho para sessionId: '${sessionId}'`);
      redisCart = await CartRedisService.createCart(sessionId);
      console.log(`✅ [Cart Storage Redis] Novo carrinho criado e salvo no Redis`);
    } else {
      console.log(`✅ [Cart Storage Redis] Carrinho existente encontrado no Redis:`, redisCart);
    }
    
    return fromRedisCart(redisCart);
  } catch (error) {
    console.error(`❌ [Cart Storage Redis] Erro ao buscar/criar carrinho:`, error);
    // Fallback: retornar carrinho vazio
    return {
      sessionId,
      items: [],
      total: 0
    };
  }
}

// Função utilitária para salvar carrinho (agora usando Redis)
export async function saveCart(cart: CartData): Promise<void> {
  console.log(`💾 [Cart Storage Redis] saveCart chamado para sessionId: '${cart.sessionId}'`);
  console.log(`💾 [Cart Storage Redis] Carrinho antes de salvar:`, cart);
  
  try {
    cart.total = recalculateCartTotal(cart);
    console.log(`💾 [Cart Storage Redis] Total recalculado: ${cart.total}`);
    
    // Converter para formato Redis
    const redisCart: RedisCart = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: cart.sessionId,
      items: cart.items.map(toRedisCartItem),
      total: cart.total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const success = await CartRedisService.saveCart(redisCart);
    
    if (success) {
      console.log(`✅ [Cart Storage Redis] Carrinho salvo no Redis com sucesso`);
    } else {
      console.error(`❌ [Cart Storage Redis] Falha ao salvar carrinho no Redis`);
    }
  } catch (error) {
    console.error(`❌ [Cart Storage Redis] Erro ao salvar carrinho:`, error);
  }
}

// Função utilitária para deletar carrinho (agora usando Redis)
export async function deleteCart(sessionId: string): Promise<boolean> {
  console.log(`🗑️ [Cart Storage Redis] deleteCart chamado para sessionId: '${sessionId}'`);
  
  try {
    const success = await CartRedisService.deleteCart(sessionId);
    
    if (success) {
      console.log(`✅ [Cart Storage Redis] Carrinho deletado do Redis com sucesso`);
    } else {
      console.error(`❌ [Cart Storage Redis] Falha ao deletar carrinho do Redis`);
    }
    
    return success;
  } catch (error) {
    console.error(`❌ [Cart Storage Redis] Erro ao deletar carrinho:`, error);
    return false;
  }
}