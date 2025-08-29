import { tool } from 'ai';
import { z } from 'zod';
import { getAllGlobalContext, setGlobalContext } from '../context';
import type { ToolResult } from '../types';
import { logger } from '@/lib/logger';

// Função para obter session ID do contexto global
function getSessionId(): string {
  const context = getAllGlobalContext();
  if (!context.sessionId) {
    throw new Error('SessionId não encontrado no contexto global. Certifique-se de que o AI Agent definiu o sessionId antes de usar as tools.');
  }
  return context.sessionId;
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
      console.log('🚀 [addToCartTool] INICIANDO execução');
      console.log('📦 [addToCartTool] Parâmetros recebidos:', { productId, quantity });
      
      const sessionId = getSessionId();
      console.log('🔑 [addToCartTool] SessionId obtido:', sessionId);
      
      logger.info('Adicionando produto ao carrinho via API', { productId, quantity, sessionId });
      
      const requestBody = {
        sessionId,
        productId,
        quantity
      };
      console.log('📋 [addToCartTool] Body da requisição:', JSON.stringify(requestBody, null, 2));
      
      console.log('🌐 [addToCartTool] Fazendo chamada para API /cart');
      const cart = await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      console.log('✅ [addToCartTool] Resposta da API recebida:', JSON.stringify(cart, null, 2));
      
      return {
        success: true,
        message: `Produto adicionado ao carrinho! Quantidade: ${quantity}`,
        data: cart,
      } as ToolResult;
    } catch (error) {
      console.error('❌ [addToCartTool] ERRO capturado:', error);
      console.error('❌ [addToCartTool] Stack trace:', error instanceof Error ? error.stack : 'N/A');
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
    console.log(`🛠️ [AI Agent removeFromCartTool] INICIANDO remoção do produto: ${productId}`);
    
    try {
      const sessionId = getSessionId();
      console.log(`🔑 [AI Agent removeFromCartTool] SessionId obtido: ${sessionId}`);
      logger.info('Removendo produto do carrinho via API', { productId, sessionId });
      
      console.log(`📡 [AI Agent removeFromCartTool] Fazendo chamada DELETE para /cart`);
      const cart = await apiCall('/cart', {
        method: 'DELETE',
        body: JSON.stringify({
          sessionId,
          productId
        })
      });
      
      console.log(`✅ [AI Agent removeFromCartTool] Produto removido com sucesso:`, cart);
      
      return {
        success: true,
        message: 'Produto removido do carrinho!',
        data: cart,
      } as ToolResult;
    } catch (error) {
      console.log(`❌ [AI Agent removeFromCartTool] ERRO ao remover produto:`, error);
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

// Tool: Buscar produtos
export const searchProductsTool = tool({
  description: 'Busca produtos no catálogo',
  inputSchema: z.object({
    query: z.string().describe('Termo de busca para encontrar produtos'),
  }),
  execute: async ({ query }: { query: string }) => {
    try {
      logger.info('Buscando produtos via API', { query });
      
      const products = await apiCall(`/products?search=${encodeURIComponent(query)}`, {
        method: 'GET'
      });
      
      if (!products || products.length === 0) {
        return {
          success: true,
          message: `Nenhum produto encontrado para "${query}". Tente termos diferentes.`,
          data: [],
        } as ToolResult;
      }
      
      const productList = products.map((p: any) => 
        `- ${p.name} (€${p.price}) - ${p.category}${p.prescription ? ' [Receita]' : ''}`
      ).join('\n');
      
      return {
        success: true,
        message: `Encontrei ${products.length} produto(s) para "${query}":\n${productList}`,
        data: products,
      } as ToolResult;
    } catch (error) {
      logger.error('Erro ao buscar produtos', { error, query });
      return {
        success: false,
        message: `Erro ao buscar produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        data: null,
      } as ToolResult;
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
  search_products: searchProductsTool,
};