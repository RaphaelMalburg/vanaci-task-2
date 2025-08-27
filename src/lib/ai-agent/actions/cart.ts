import { tool } from 'ai';
import { z } from 'zod';
import type { ToolResult, CartData, CartItem } from '../types';

// Função auxiliar para gerar sessionId
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Função auxiliar para fazer chamadas à API
async function apiCall(endpoint: string, options: RequestInit = {}, sessionId?: string) {
  const defaultSessionId = sessionId || generateSessionId();
  
  // Usar URL absoluta para funcionar no contexto do servidor
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3007';
  
  const response = await fetch(`${baseUrl}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.statusText} - ${errorText}`);
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
      const sessionId = generateSessionId();
      console.log(`[AI Agent] Adicionando produto ${productId} (qty: ${quantity}) ao carrinho ${sessionId}`);
      
      const result = await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify({ sessionId, productId, quantity }),
      }, sessionId);

      console.log(`[AI Agent] Produto adicionado com sucesso:`, result);
      return {
        success: true,
        message: `Produto adicionado ao carrinho com sucesso! Quantidade: ${quantity}`,
        data: result.cart,
      };
    } catch (error) {
      console.error(`[AI Agent] Erro ao adicionar produto:`, error);
      return {
        success: false,
        message: `Erro ao adicionar produto ao carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
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
      const sessionId = generateSessionId();
      console.log(`[AI Agent] Removendo produto ${productId} do carrinho ${sessionId}`);
      
      const result = await apiCall('/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({ sessionId, productId }),
      }, sessionId);

      console.log(`[AI Agent] Produto removido com sucesso:`, result);
      return {
        success: true,
        message: 'Produto removido do carrinho com sucesso!',
        data: result.cart,
      };
    } catch (error) {
      console.error(`[AI Agent] Erro ao remover produto:`, error);
      return {
        success: false,
        message: `Erro ao remover produto do carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
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
      const sessionId = generateSessionId();
      console.log(`[AI Agent] Atualizando quantidade do produto ${productId} para ${quantity} no carrinho ${sessionId}`);
      
      if (quantity === 0) {
        // Se quantidade for 0, remover o item
        const result = await apiCall('/cart/remove', {
          method: 'DELETE',
          body: JSON.stringify({ sessionId, productId }),
        }, sessionId);

        console.log(`[AI Agent] Produto removido (qty=0):`, result);
        return {
          success: true,
          message: 'Produto removido do carrinho.',
          data: result.cart,
        };
      } else {
        // Atualizar quantidade
        const result = await apiCall('/cart', {
          method: 'PUT',
          body: JSON.stringify({ sessionId, productId, quantity }),
        }, sessionId);

        console.log(`[AI Agent] Quantidade atualizada:`, result);
        return {
          success: true,
          message: `Quantidade atualizada para ${quantity}.`,
          data: result.cart,
        };
      }
    } catch (error) {
      console.error(`[AI Agent] Erro ao atualizar quantidade:`, error);
      return {
        success: false,
        message: `Erro ao atualizar quantidade do produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Tool: Visualizar carrinho
export const viewCartTool = tool({
  description: 'Visualiza o conteúdo atual do carrinho de compras',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const sessionId = generateSessionId();
      console.log(`[AI Agent] Visualizando carrinho ${sessionId}`);
      
      const cartData: CartData = await apiCall('/cart', {
        method: 'GET',
      }, sessionId);
      
      console.log(`[AI Agent] Carrinho carregado:`, cartData);
      
      if (cartData.items.length === 0) {
        return {
          success: true,
          message: 'Seu carrinho está vazio.',
          data: cartData,
        };
      }
      
      const itemsList = cartData.items
        .map(item => `- ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');
      
      return {
        success: true,
        message: `Carrinho (${cartData.itemCount} itens):\n${itemsList}\n\nTotal: R$ ${cartData.total.toFixed(2)}`,
        data: cartData,
      };
    } catch (error) {
      console.error(`[AI Agent] Erro ao carregar carrinho:`, error);
      return {
        success: false,
        message: `Erro ao visualizar carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
      const sessionId = generateSessionId();
      console.log(`[AI Agent] Limpando carrinho ${sessionId}`);
      
      const result = await apiCall('/cart/clear', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      }, sessionId);
      
      console.log(`[AI Agent] Carrinho limpo:`, result);
      return {
        success: true,
        message: 'Carrinho limpo com sucesso!',
        data: result.cart,
      };
    } catch (error) {
      console.error(`[AI Agent] Erro ao limpar carrinho:`, error);
      return {
        success: false,
        message: `Erro ao limpar carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Exportar todas as tools do carrinho
export const cartTools = {
  add_to_cart: addToCartTool,
  remove_from_cart: removeFromCartTool,
  update_cart_quantity: updateCartQuantityTool,
  view_cart: viewCartTool,
  clear_cart: clearCartTool,
};