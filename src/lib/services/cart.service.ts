/**
 * CartService - Serviço unificado para operações de carrinho
 * 
 * Este serviço centraliza todas as operações de carrinho, servindo como
 * única interface entre o frontend e o backend, garantindo consistência
 * e facilitando manutenção.
 */

import { sessionManager } from './session-manager';
import { useCartStore } from '@/stores/cart-store';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { getTokenFromLocalStorage } from '@/lib/auth-utils';
import type { CartItem, CartData } from '@/lib/types';

export interface CartOperationResult {
  success: boolean;
  message: string;
  data?: CartData;
  error?: string;
}

export class CartService {
  private static instance: CartService;
  private readonly baseUrl = '/api/cart';
  private isClient = typeof window !== 'undefined';
  private carts: Map<string, CartData> = new Map();

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  /**
   * Obtém o carrinho para uma sessão específica (backend)
   */
  private getCartForSession(sessionId: string): CartData {
    if (!this.carts.has(sessionId)) {
      this.carts.set(sessionId, {
        items: [],
        total: 0,
        itemCount: 0
      });
    }
    return this.carts.get(sessionId)!;
  }

  /**
   * Cria headers com autenticação para requisições HTTP
   */
  private getAuthHeaders(): HeadersInit {
    const token = getTokenFromLocalStorage();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Atualiza os totais do carrinho
   */
  private updateCartTotals(cart: CartData): void {
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Obtém o carrinho atual (método unificado)
   */
  async getCart(sessionId?: string): Promise<CartOperationResult> {
    try {
      const currentSessionId = sessionId || sessionManager.getSessionId();
      logger.info('Buscando carrinho', { sessionId: currentSessionId });

      // Se estamos no servidor, usar dados em memória
      if (!this.isClient) {
        const cart = this.getCartForSession(currentSessionId);
        return {
          success: true,
          message: 'Carrinho carregado com sucesso',
          data: cart
        };
      }

      // Se estamos no cliente, fazer requisição HTTP
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const cartData: CartData = await response.json();
      
      // Atualizar store local
      this.updateLocalStore(cartData);
      
      logger.info('Carrinho obtido com sucesso', { itemCount: cartData.items.length });
      
      return {
        success: true,
        message: 'Carrinho carregado com sucesso',
        data: cartData
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('Erro ao buscar carrinho', { error: errorMessage });
      
      return {
        success: false,
        message: 'Erro ao carregar carrinho',
        error: errorMessage
      };
    }
  }

  /**
   * Adiciona um item ao carrinho (método unificado)
   */
  async addItem(productId: string, quantity: number = 1, sessionId?: string): Promise<CartOperationResult> {
    try {
      const currentSessionId = sessionId || sessionManager.getSessionId();
      logger.info('Adicionando item ao carrinho', { productId, quantity, sessionId: currentSessionId });

      // Se estamos no servidor, usar Prisma diretamente
      if (!this.isClient) {
        const product = await prisma.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          throw new Error(`Produto com ID ${productId} não encontrado`);
        }

        const cart = this.getCartForSession(currentSessionId);
        const existingItemIndex = cart.items.findIndex(item => item.id === productId);
        
        if (existingItemIndex >= 0) {
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          cart.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            imagePath: product.image || undefined,
            quantity
          });
        }

        this.updateCartTotals(cart);
        
        logger.info('Item adicionado com sucesso (servidor)', { productId });
        
        return {
          success: true,
          message: `${product.name} adicionado ao carrinho`,
          data: cart
        };
      }

      // Se estamos no cliente, fazer optimistic update + requisição HTTP
      const store = useCartStore.getState();
      const originalItems = [...store.items];
      
      // Buscar dados do produto para optimistic update
      const productResponse = await fetch(`/api/products/${productId}`);
      if (!productResponse.ok) {
        throw new Error('Produto não encontrado');
      }
      const product = await productResponse.json();

      // Optimistic update no store local
      store.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        imagePath: product.imagePath
      }, quantity);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      if (!response.ok) {
        // Rollback optimistic update
        store.clearCart();
        originalItems.forEach(originalItem => {
          store.addItem(originalItem, originalItem.quantity);
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const cartData: CartData = result.cart;
      
      // Sincronizar com dados do backend
      this.updateLocalStore(cartData);
      
      logger.info('Item adicionado com sucesso (cliente)', { productId });
      
      return {
        success: true,
        message: `${product.name} adicionado ao carrinho`,
        data: cartData
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('Erro ao adicionar item', { error: errorMessage, productId });
      
      return {
        success: false,
        message: 'Erro ao adicionar item ao carrinho',
        error: errorMessage
      };
    }
  }

  /**
   * Remove um item do carrinho (método unificado)
   */
  async removeItem(productId: string, sessionId?: string): Promise<CartOperationResult> {
    try {
      const currentSessionId = sessionId || sessionManager.getSessionId();
      logger.info('Removendo item do carrinho', { productId, sessionId: currentSessionId });

      // Se estamos no servidor
      if (!this.isClient) {
        const cart = this.getCartForSession(currentSessionId);
        cart.items = cart.items.filter(item => item.id !== productId);
        this.updateCartTotals(cart);
        
        logger.info('Item removido com sucesso (servidor)', { productId });
        
        return {
          success: true,
          message: 'Item removido do carrinho',
          data: cart
        };
      }

      // Se estamos no cliente
      const store = useCartStore.getState();
      const originalItems = [...store.items];
      store.removeItem(productId);

      const response = await fetch(this.baseUrl, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          productId
        })
      });

      if (!response.ok) {
        // Rollback optimistic update
        store.clearCart();
        originalItems.forEach(originalItem => {
          store.addItem(originalItem, originalItem.quantity);
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const cartData: CartData = result.cart;
      
      // Sincronizar com dados do backend
      this.updateLocalStore(cartData);
      
      logger.info('Item removido com sucesso (cliente)', { productId });
      
      return {
        success: true,
        message: 'Item removido do carrinho',
        data: cartData
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('Erro ao remover item', { error: errorMessage, productId });
      
      return {
        success: false,
        message: 'Erro ao remover item do carrinho',
        error: errorMessage
      };
    }
  }

  /**
   * Atualiza a quantidade de um item (método unificado)
   */
  async updateQuantity(productId: string, quantity: number, sessionId?: string): Promise<CartOperationResult> {
    try {
      const currentSessionId = sessionId || sessionManager.getSessionId();
      logger.info('Atualizando quantidade', { productId, quantity, sessionId: currentSessionId });

      // Se estamos no servidor
      if (!this.isClient) {
        const cart = this.getCartForSession(currentSessionId);
        const item = cart.items.find(item => item.id === productId);
        
        if (item) {
          if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.id !== productId);
          } else {
            item.quantity = quantity;
          }
          this.updateCartTotals(cart);
        }
        
        logger.info('Quantidade atualizada com sucesso (servidor)', { productId, quantity });
        
        return {
          success: true,
          message: 'Quantidade atualizada',
          data: cart
        };
      }

      // Se estamos no cliente
      const store = useCartStore.getState();
      const originalItems = [...store.items];
      store.updateQuantity(productId, quantity);

      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      if (!response.ok) {
        // Rollback optimistic update
        store.clearCart();
        originalItems.forEach(originalItem => {
          store.addItem(originalItem, originalItem.quantity);
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const cartData: CartData = result.cart;
      
      // Sincronizar com dados do backend
      this.updateLocalStore(cartData);
      
      logger.info('Quantidade atualizada com sucesso (cliente)', { productId, quantity });
      
      return {
        success: true,
        message: 'Quantidade atualizada',
        data: cartData
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('Erro ao atualizar quantidade', { error: errorMessage, productId });
      
      return {
        success: false,
        message: 'Erro ao atualizar quantidade',
        error: errorMessage
      };
    }
  }

  /**
   * Limpa o carrinho (método unificado)
   */
  async clearCart(sessionId?: string): Promise<CartOperationResult> {
    try {
      const currentSessionId = sessionId || sessionManager.getSessionId();
      logger.info('Limpando carrinho', { sessionId: currentSessionId });

      // Se estamos no servidor
      if (!this.isClient) {
        const cart = this.getCartForSession(currentSessionId);
        cart.items = [];
        this.updateCartTotals(cart);
        
        logger.info('Carrinho limpo com sucesso (servidor)');
        
        return {
          success: true,
          message: 'Carrinho limpo',
          data: cart
        };
      }

      // Se estamos no cliente
      const store = useCartStore.getState();
      const originalItems = [...store.items];
      store.clearCart();

      const response = await fetch(this.baseUrl, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // Rollback optimistic update
        originalItems.forEach(originalItem => {
          store.addItem(originalItem, originalItem.quantity);
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const cartData: CartData = result.cart;
      
      // Sincronizar com dados do backend
      this.updateLocalStore(cartData);
      
      logger.info('Carrinho limpo com sucesso (cliente)');
      
      return {
        success: true,
        message: 'Carrinho limpo',
        data: cartData
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('Erro ao limpar carrinho', { error: errorMessage });
      
      return {
        success: false,
        message: 'Erro ao limpar carrinho',
        error: errorMessage
      };
    }
  }

  /**
   * Sincroniza o carrinho com o backend
   */
  async syncCart(sessionId?: string): Promise<CartOperationResult> {
    return this.getCart(sessionId);
  }

  /**
   * Atualiza o store local com dados do backend
   */
  private updateLocalStore(cartData: CartData): void {
    if (!this.isClient) return;

    const store = useCartStore.getState();
    
    // Limpar store atual
    store.clearCart();
    
    // Adicionar itens do backend
    cartData.items.forEach(item => {
      store.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        imagePath: item.imagePath || undefined
      }, item.quantity);
    });
  }

  /**
   * Obtém dados do carrinho local (sem fazer requisição)
   */
  getLocalCartData(): CartData {
    const store = useCartStore.getState();
    return {
      items: store.items,
      total: store.total,
      itemCount: store.itemCount
    };
  }
}

// Hook para usar o CartService
export function useCartService() {
  const cartService = CartService.getInstance();
  
  return {
    getCart: (sessionId?: string) => cartService.getCart(sessionId),
    addItem: (productId: string, quantity?: number, sessionId?: string) => cartService.addItem(productId, quantity, sessionId),
    removeItem: (productId: string, sessionId?: string) => cartService.removeItem(productId, sessionId),
    updateQuantity: (productId: string, quantity: number, sessionId?: string) => cartService.updateQuantity(productId, quantity, sessionId),
    clearCart: (sessionId?: string) => cartService.clearCart(sessionId),
    syncCart: (sessionId?: string) => cartService.syncCart(sessionId),
    getLocalCartData: () => cartService.getLocalCartData()
  };
}

// Instância global para uso direto
export const cartService = CartService.getInstance();

// Alias para compatibilidade
export type Cart = CartData;