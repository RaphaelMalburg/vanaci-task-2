import { tool } from 'ai';
import { z } from 'zod';
import { getGlobalContext } from '../context';
import type { ToolResult, CartData, CartItem } from '../types';
import { CartService, Cart } from '@/lib/services/cart.service';
import { logger } from '@/lib/logger';

// Função auxiliar para gerar sessionId (fallback)
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Função para sincronizar carrinho com localStorage
function syncWithLocalStorage(cart: Cart): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart))
    }
  } catch (error) {
    logger.warn('Erro ao sincronizar carrinho com localStorage', { error })
  }
}

// Função para obter sessionId do contexto ou gerar um novo
function getSessionId(): string {
  try {
    const sessionId = getGlobalContext('sessionId');
    if (sessionId && typeof sessionId === 'string') {
      console.log(`🔑 [Cart Tool] SessionId obtido do contexto: ${sessionId}`);
      return sessionId;
    }
  } catch (error) {
    console.warn(`⚠️ [Cart Tool] Erro ao obter sessionId do contexto:`, error);
  }
  
  const fallbackSessionId = generateSessionId();
  console.log(`🔑 [Cart Tool] Usando sessionId fallback: ${fallbackSessionId}`);
  return fallbackSessionId;
}

// Função duplicada removida - usando a versão existente acima

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
  
  // Sincronizar com localStorage após operações bem-sucedidas
  if (result.cart) {
    syncWithLocalStorage(result.cart);
  }
  
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
    logger.info('Adicionando produto ao carrinho', { productId, quantity });
    
    try {
      const sessionId = getSessionId();
      const cartService = CartService.getInstance();
      const cart = await cartService.addItem(productId, quantity, sessionId);
      
      // Sincronizar com localStorage
      syncWithLocalStorage(cart);
      
      logger.info('Produto adicionado com sucesso', { 
        productId, 
        quantity, 
        totalItems: cart.itemCount, 
        total: cart.total 
      });
      
      return {
        success: true,
        message: `Produto adicionado ao carrinho com sucesso! Quantidade: ${quantity}`,
        data: cart,
      };
    } catch (error) {
      logger.error('Erro ao adicionar produto ao carrinho', { productId, quantity, error: error instanceof Error ? error.message : error });
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
    logger.info('Removendo produto do carrinho', { productId });
    
    try {
      const sessionId = getSessionId();
      const cartService = CartService.getInstance();
      const cart = await cartService.removeItem(productId, sessionId);
      
      // Sincronizar com localStorage
      syncWithLocalStorage(cart);
      
      logger.info('Produto removido com sucesso', { productId, totalItems: cart.itemCount });
      
      return {
        success: true,
        message: 'Produto removido do carrinho com sucesso!',
        data: cart,
      };
    } catch (error) {
      logger.error('Erro ao remover produto do carrinho', { productId, error: error instanceof Error ? error.message : error });
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
    logger.info('Atualizando quantidade do produto', { productId, quantity });
    
    try {
      const sessionId = getSessionId();
      const cartService = CartService.getInstance();
      
      if (quantity === 0) {
        // Se quantidade for 0, remover o item
        const cart = await cartService.removeItem(productId, sessionId);
        
        // Sincronizar com localStorage
        syncWithLocalStorage(cart);
        
        logger.info('Produto removido (quantidade 0)', { productId, totalItems: cart.itemCount });
        
        return {
          success: true,
          message: 'Produto removido do carrinho.',
          data: cart,
        };
      } else {
        // Atualizar quantidade
        const cart = await cartService.updateQuantity(productId, quantity, sessionId);
        
        // Sincronizar com localStorage
        syncWithLocalStorage(cart);
        
        logger.info('Quantidade atualizada com sucesso', { productId, quantity, totalItems: cart.itemCount });
        
        return {
          success: true,
          message: `Quantidade atualizada para ${quantity}.`,
          data: cart,
        };
      }
    } catch (error) {
      logger.error('Erro ao atualizar quantidade do produto', { productId, quantity, error: error instanceof Error ? error.message : error });
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
    logger.info('Visualizando carrinho');
    
    try {
      const sessionId = getSessionId();
      const cartService = CartService.getInstance();
      const cart = await cartService.getCart(sessionId);
      
      // Sincronizar com localStorage
      syncWithLocalStorage(cart);
      
      logger.info('Carrinho obtido com sucesso', { totalItems: cart.itemCount, total: cart.total });
      
      if (cart.items.length === 0) {
        return {
          success: true,
          message: 'Seu carrinho está vazio.',
          data: cart,
        };
      }
      
      const itemsList = cart.items
        .map(item => `- ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');
      
      return {
        success: true,
        message: `Carrinho (${cart.itemCount} itens):\n${itemsList}\n\nTotal: R$ ${cart.total.toFixed(2)}`,
        data: cart,
      };
    } catch (error) {
      logger.error('Erro ao visualizar carrinho', { error: error instanceof Error ? error.message : error });
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
    logger.info('Limpando carrinho');
    
    try {
      const sessionId = getSessionId();
      const cartService = CartService.getInstance();
      const cart = await cartService.clearCart(sessionId);
      
      // Sincronizar com localStorage
      syncWithLocalStorage(cart);
      
      logger.info('Carrinho limpo com sucesso');
      
      return {
        success: true,
        message: 'Carrinho limpo com sucesso! 🧹',
        data: cart,
      };
    } catch (error) {
      logger.error('Erro ao limpar carrinho', { error: error instanceof Error ? error.message : error });
      return {
        success: false,
        message: `Erro ao limpar carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
    console.log(`🔍 [DEBUG] === INICIANDO searchProductsTool ===`);
    console.log(`🔍 [DEBUG] Parâmetros recebidos:`, { query });
    console.log(`🔍 [DEBUG] Tipo da query: ${typeof query}`);
    console.log(`🔍 [DEBUG] Query length: ${query?.length || 0}`);
    
    try {
      console.log(`🔑 [DEBUG] Obtendo session ID...`);
      const sessionId = getSessionId();
      console.log(`🔑 [DEBUG] Session ID obtido: ${sessionId}`);
      
      const encodedQuery = encodeURIComponent(query);
      const endpoint = `/products/search?q=${encodedQuery}`;
      console.log(`🌐 [DEBUG] Endpoint construído: ${endpoint}`);
      console.log(`🌐 [DEBUG] Query encoded: ${encodedQuery}`);
      
      console.log(`📡 [DEBUG] Fazendo chamada para API...`);
      const result = await apiCall(endpoint, {
        method: 'GET',
      }, sessionId);
      
      console.log(`📥 [DEBUG] Resposta da API:`, JSON.stringify(result, null, 2));
      // Produtos encontrados para o carrinho
      
      const response = {
        success: true,
        message: `Encontrados ${result.products?.length || 0} produtos para "${query}"`,
        data: result.products || [],
      };
      console.log(`🎉 [DEBUG] Resultado final:`, JSON.stringify(response, null, 2));
      console.log(`🔍 [DEBUG] === FIM searchProductsTool (SUCESSO) ===`);
      return response;
    } catch (error) {
      console.error(`❌ [DEBUG] Erro na busca:`, error);
      console.error(`❌ [DEBUG] Stack trace:`, error instanceof Error ? error.stack : 'Sem stack trace');
      
      const errorResponse = {
        success: false,
        message: `Erro ao buscar produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        data: [],
      };
      console.log(`💥 [DEBUG] Resultado de erro:`, JSON.stringify(errorResponse, null, 2));
      console.log(`🔍 [DEBUG] === FIM searchProductsTool (ERRO) ===`);
      return errorResponse;
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