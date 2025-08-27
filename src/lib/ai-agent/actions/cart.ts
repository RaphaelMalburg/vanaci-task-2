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
  
  const fullUrl = `${baseUrl}/api${endpoint}`;
  console.log(`🌐 [Cart Tool] Fazendo chamada para: ${fullUrl}`);
  console.log(`📋 [Cart Tool] Opções da requisição:`, {
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body
  });
  
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  console.log(`📡 [Cart Tool] Status da resposta: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ [Cart Tool] Erro na API:`, {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText
    });
    throw new Error(`API Error: ${response.statusText} - ${errorText}`);
  }
  
  const result = await response.json();
  console.log(`✅ [Cart Tool] Resposta da API:`, result);
  return result;
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
    console.log(`🛒 [Add to Cart Tool] INICIANDO execução`);
    console.log(`📦 [Add to Cart Tool] Parâmetros recebidos:`, { productId, quantity });
    
    try {
      const sessionId = generateSessionId();
      console.log(`🔑 [Add to Cart Tool] SessionId gerado: ${sessionId}`);
      console.log(`[AI Agent] Adicionando produto ${productId} (qty: ${quantity}) ao carrinho ${sessionId}`);
      
      const result = await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify({ sessionId, productId, quantity }),
      }, sessionId);

      console.log(`✅ [Add to Cart Tool] Produto adicionado com sucesso:`, result);
      const response = {
        success: true,
        message: `Produto adicionado ao carrinho com sucesso! Quantidade: ${quantity}`,
        data: result.cart,
      };
      console.log(`📤 [Add to Cart Tool] Retornando resposta:`, response);
      return response;
    } catch (error) {
      console.error(`❌ [Add to Cart Tool] Erro ao adicionar produto:`, error);
      console.error(`🔍 [Add to Cart Tool] Stack trace:`, error instanceof Error ? error.stack : 'N/A');
      const errorResponse = {
        success: false,
        message: `Erro ao adicionar produto ao carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
      console.log(`📤 [Add to Cart Tool] Retornando erro:`, errorResponse);
      return errorResponse;
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
    console.log(`👁️ [View Cart Tool] INICIANDO execução`);
    
    try {
      const sessionId = generateSessionId();
      console.log(`🔑 [View Cart Tool] SessionId gerado: ${sessionId}`);
      console.log(`[AI Agent] Visualizando carrinho ${sessionId}`);
      
      const cartData: CartData = await apiCall('/cart', {
        method: 'GET',
      }, sessionId);
      
      console.log(`✅ [View Cart Tool] Carrinho carregado:`, cartData);
      console.log(`📊 [View Cart Tool] Total de itens: ${cartData.items.length}`);
      
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