import { tool } from 'ai';
import { z } from 'zod';
import type { ToolResult, CartData, CartItem } from '../types';

// Função auxiliar para fazer chamadas à API
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`/api${endpoint}`, {
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
  execute: async ({ productId, quantity }) => {
    try {
      const result = await apiCall('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });

      return {
        ...result,
        message: `Produto adicionado ao carrinho com sucesso! Quantidade: ${quantity}`,
      };
    } catch (error) {
      throw new Error(`Erro ao adicionar produto ao carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Remover produto do carrinho
export const removeFromCartTool = tool({
  description: 'Remove um produto do carrinho de compras',
  inputSchema: z.object({
    productId: z.string().describe('ID do produto a ser removido'),
  }),
  execute: async ({ productId }) => {
    try {
      const result = await apiCall('/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({ productId }),
      });

      return {
        ...result,
        message: 'Produto removido do carrinho com sucesso!',
      };
    } catch (error) {
      throw new Error(`Erro ao remover produto do carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
  execute: async ({ productId, quantity }) => {
    try {
      if (quantity === 0) {
        // Se quantidade for 0, remover o item
        const result = await apiCall('/cart/remove', {
          method: 'DELETE',
          body: JSON.stringify({ productId }),
        });

        return {
          ...result,
          message: 'Produto removido do carrinho.',
        };
      } else {
        // Atualizar quantidade
        const result = await apiCall('/cart/update', {
          method: 'PUT',
          body: JSON.stringify({ productId, quantity }),
        });

        return {
          ...result,
          message: `Quantidade atualizada para ${quantity}.`,
        };
      }
    } catch (error) {
      throw new Error(`Erro ao atualizar quantidade do produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Visualizar carrinho
export const viewCartTool = tool({
  description: 'Mostra o conteúdo atual do carrinho de compras',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const cartData: CartData = await apiCall('/cart');
      
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
      return {
        success: false,
        message: `Erro ao visualizar carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Tool: Limpar carrinho
export const clearCartTool = tool({
  description: 'Remove todos os produtos do carrinho',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const result = await apiCall('/cart/clear', {
        method: 'POST',
      });
      
      return {
        success: true,
        message: 'Carrinho limpo com sucesso!',
        data: result,
      };
    } catch (error) {
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