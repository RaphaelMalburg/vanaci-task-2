import { tool } from 'ai';
import { z } from 'zod';
import { getAllGlobalContext, setGlobalContext } from '../context';
import type { ToolResult } from '../types';
import { logger } from '@/lib/logger';
import { sessionManager } from '@/lib/services/session-manager';

// Função para obter sessionId usando SessionManager
function getSessionId(): string {
  return sessionManager.getSessionId();
}

// Função auxiliar para fazer chamadas à API
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_APP_URL || 'https://farmacia-vanaci.vercel.app'
    : 'http://localhost:3007';
  
  const response = await fetch(`${baseUrl}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// Tool: Adicionar produto ao carrinho
export const addToCartTool = tool({
  description: 'Adiciona um produto ao carrinho de compras',
  inputSchema: z.object({
    productId: z.string().describe('ID do produto a ser adicionado'),
    quantity: z.number().min(1).describe('Quantidade do produto'),
  }),
  execute: async ({ productId, quantity }: {
    productId: string;
    quantity: number;
  }) => {
    try {
      const sessionId = getSessionId();
      logger.info('Adicionando produto ao carrinho via API', { productId, quantity, sessionId });
      
      const cart = await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          productId,
          quantity
        })
      });
      
      // Forçar sincronização imediata com o frontend
      try {
        // Trigger uma sincronização do carrinho no frontend
        // Isso será capturado pelo polling do CartSyncService
        logger.info('Produto adicionado com sucesso, sincronização será feita pelo polling', { productId, quantity, sessionId });
      } catch (syncError) {
        logger.warn('Erro na sincronização imediata, mas item foi adicionado', { syncError });
      }
      
      return {
        success: true,
        message: `Produto adicionado ao carrinho! Quantidade: ${quantity}`,
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error('Erro ao adicionar produto ao carrinho', { error, productId, quantity });
      return {
        success: false,
        message: `Erro ao adicionar produto ao carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Remover produto do carrinho
export const removeFromCartTool = tool({
  description: 'Remove um produto do carrinho de compras',
  inputSchema: z.object({
    productId: z.string().describe('ID do produto a ser removido'),
  }),
  execute: async ({ productId }: {
    productId: string;
  }) => {
    try {
      const sessionId = getSessionId();
      logger.info('Removendo produto do carrinho via API', { productId, sessionId });
      
      const cart = await apiCall('/cart', {
        method: 'DELETE',
        body: JSON.stringify({
          sessionId,
          productId
        })
      });
      
      return {
        success: true,
        message: 'Produto removido do carrinho!',
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error('Erro ao remover produto do carrinho', { error, productId });
      return {
        success: false,
        message: `Erro ao remover produto do carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Atualizar quantidade no carrinho
export const updateCartQuantityTool = tool({
  description: 'Atualiza a quantidade de um produto no carrinho',
  inputSchema: z.object({
    productId: z.string().describe('ID do produto'),
    quantity: z.number().min(0).describe('Nova quantidade (0 para remover)'),
  }),
  execute: async ({ productId, quantity }: {
    productId: string;
    quantity: number;
  }) => {
    try {
      const sessionId = getSessionId();
      logger.info('Atualizando quantidade no carrinho via API', { productId, quantity, sessionId });
      
      const cart = await apiCall('/cart', {
        method: 'PUT',
        body: JSON.stringify({
          sessionId,
          productId,
          quantity
        })
      });
      
      const message = quantity === 0 
        ? 'Produto removido do carrinho!' 
        : `Quantidade atualizada para ${quantity}!`;
      
      return {
        success: true,
        message,
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error('Erro ao atualizar quantidade no carrinho', { error, productId, quantity });
      return {
        success: false,
        message: `Erro ao atualizar quantidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Visualizar carrinho
export const viewCartTool = tool({
  description: 'Visualiza o conteúdo atual do carrinho de compras',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const sessionId = getSessionId();
      logger.info('Visualizando carrinho via API', { sessionId });
      
      const cart = await apiCall(`/cart?sessionId=${sessionId}`, {
        method: 'GET'
      });
      
      const itemCount = cart.items?.length || 0;
      const total = cart.total || 0;
      
      let message = 'Carrinho vazio.';
      if (itemCount > 0) {
        const itemsText = cart.items.map((item: any) => 
          `${item.name} (${item.quantity}x - €${(item.price * item.quantity).toFixed(2)})`
        ).join(', ');
        message = `Carrinho: ${itemsText}. Total: €${total.toFixed(2)}`;
      }
      
      return {
        success: true,
        message,
        data: cart,
      };
    } catch (error) {
      logger.error('Erro ao visualizar carrinho', { error });
      return {
        success: false,
        message: `Erro ao visualizar carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        data: null,
      };
    }
  },
});

// Tool: Limpar carrinho
export const clearCartTool = tool({
  description: 'Remove todos os produtos do carrinho de compras',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const sessionId = getSessionId();
      logger.info('Limpando carrinho via API', { sessionId });
      
      const cart = await apiCall('/cart', {
        method: 'DELETE',
        body: JSON.stringify({
          sessionId,
          clearAll: true
        })
      });
      
      return {
        success: true,
        message: 'Carrinho limpo com sucesso! 🧹',
        data: cart,
      };
    } catch (error) {
      logger.error('Erro ao limpar carrinho', { error });
      return {
        success: false,
        message: `Erro ao limpar carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        data: null,
      };
    }
  },
});

// Tool search_products removido daqui - está definido em products.ts

// Exportar todas as tools do carrinho
export const cartTools = {
  add_to_cart: addToCartTool,
  remove_from_cart: removeFromCartTool,
  update_cart_quantity: updateCartQuantityTool,
  view_cart: viewCartTool,
  clear_cart: clearCartTool,
};