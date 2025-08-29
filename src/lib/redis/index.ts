import { Redis } from '@upstash/redis';

// Configuração do cliente Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Tipos para o carrinho
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

export interface Cart {
  id: string;
  sessionId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Classe para gerenciar operações do carrinho no Redis
export class CartRedisService {
  private static getCartKey(sessionId: string): string {
    return `cart:${sessionId}`;
  }

  // Buscar carrinho por sessionId
  static async getCart(sessionId: string): Promise<Cart | null> {
    try {
      const cartKey = this.getCartKey(sessionId);
      const cartData = await redis.get(cartKey);
      
      if (!cartData) {
        return null;
      }
      
      return cartData as Cart;
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error);
      return null;
    }
  }

  // Criar ou atualizar carrinho
  static async saveCart(cart: Cart): Promise<boolean> {
    try {
      const cartKey = this.getCartKey(cart.sessionId);
      cart.updatedAt = new Date().toISOString();
      
      // Salvar no Redis com TTL de 24 horas (86400 segundos)
      await redis.setex(cartKey, 86400, cart);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
      return false;
    }
  }

  // Criar novo carrinho
  static async createCart(sessionId: string): Promise<Cart> {
    const newCart: Cart = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      items: [],
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveCart(newCart);
    return newCart;
  }

  // Adicionar item ao carrinho
  static async addItem(sessionId: string, item: Omit<CartItem, 'quantity'>): Promise<Cart> {
    let cart = await this.getCart(sessionId);
    
    if (!cart) {
      cart = await this.createCart(sessionId);
    }

    // Verificar se o item já existe no carrinho
    const existingItemIndex = cart.items.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Se existe, incrementar quantidade
      cart.items[existingItemIndex].quantity += 1;
    } else {
      // Se não existe, adicionar novo item
      cart.items.push({ ...item, quantity: 1 });
    }

    // Recalcular total
    cart.total = cart.items.reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0);
    
    await this.saveCart(cart);
    return cart;
  }

  // Remover item do carrinho
  static async removeItem(sessionId: string, itemId: string): Promise<Cart> {
    let cart = await this.getCart(sessionId);
    
    if (!cart) {
      cart = await this.createCart(sessionId);
      return cart;
    }

    // Remover item do carrinho
    cart.items = cart.items.filter(item => item.id !== itemId);
    
    // Recalcular total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await this.saveCart(cart);
    return cart;
  }

  // Atualizar quantidade de um item
  static async updateItemQuantity(sessionId: string, itemId: string, quantity: number): Promise<Cart> {
    let cart = await this.getCart(sessionId);
    
    if (!cart) {
      cart = await this.createCart(sessionId);
      return cart;
    }

    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Se quantidade é 0 ou negativa, remover item
        cart.items.splice(itemIndex, 1);
      } else {
        // Atualizar quantidade
        cart.items[itemIndex].quantity = quantity;
      }
    }

    // Recalcular total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await this.saveCart(cart);
    return cart;
  }

  // Limpar carrinho
  static async clearCart(sessionId: string): Promise<Cart> {
    let cart = await this.getCart(sessionId);
    
    if (!cart) {
      cart = await this.createCart(sessionId);
    } else {
      cart.items = [];
      cart.total = 0;
      await this.saveCart(cart);
    }
    
    return cart;
  }

  // Deletar carrinho
  static async deleteCart(sessionId: string): Promise<boolean> {
    try {
      const cartKey = this.getCartKey(sessionId);
      await redis.del(cartKey);
      return true;
    } catch (error) {
      console.error('Erro ao deletar carrinho:', error);
      return false;
    }
  }
}

export default redis;