import { tool } from 'ai';
import { z } from 'zod';
import { getGlobalContext } from '../context';
import type { ToolResult, CartData, CartItem } from '../types';

// Função auxiliar para gerar sessionId (fallback)
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

// Função auxiliar para sincronizar com localStorage
function syncWithLocalStorage(cartData: any) {
  if (typeof window !== 'undefined') {
    try {
      const localStorageKey = 'cart-storage';
      const existingData = localStorage.getItem(localStorageKey);
      
      let localCart = {
        state: {
          items: [],
          total: 0,
          itemCount: 0
        },
        version: 0
      };
      
      if (existingData) {
        localCart = JSON.parse(existingData);
      }
      
      // Atualizar localStorage com dados do backend
      localCart.state = {
        items: cartData.items || [],
        total: cartData.total || 0,
        itemCount: cartData.itemCount || 0
      };
      
      localStorage.setItem(localStorageKey, JSON.stringify(localCart));
      console.log(`💾 [Cart Tool] LocalStorage sincronizado:`, localCart.state);
      
      // Disparar evento para notificar componentes React
      window.dispatchEvent(new StorageEvent('storage', {
        key: localStorageKey,
        newValue: JSON.stringify(localCart),
        storageArea: localStorage
      }));
      
    } catch (error) {
      console.error(`❌ [Cart Tool] Erro ao sincronizar localStorage:`, error);
    }
  }
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
    console.log(`🛒 [CART DEBUG] addToCartTool executado com productId: ${productId}, quantity: ${quantity}`);
    console.log(`🛒 [DEBUG] === INICIANDO addToCartTool ===`);
    console.log(`🛒 [DEBUG] Parâmetros recebidos:`, { productId, quantity });
    console.log(`🛒 [DEBUG] Tipo do productId: ${typeof productId}`);
    console.log(`🛒 [DEBUG] Tipo da quantity: ${typeof quantity}`);
    
    try {
      console.log(`🔑 [DEBUG] Obtendo session ID...`);
      const sessionId = getSessionId();
      console.log(`🔑 [DEBUG] Session ID obtido: ${sessionId}`);
      
      const requestBody = { sessionId, productId, quantity };
      console.log(`📤 [DEBUG] Request body:`, JSON.stringify(requestBody, null, 2));
      
      console.log(`🌐 [CART DEBUG] Fazendo requisição POST para /api/cart`);
      console.log(`🌐 [DEBUG] Fazendo chamada para API...`);
      const result = await apiCall('/cart', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }, sessionId);

      console.log(`📡 [CART DEBUG] Resposta da API: status success`);
      console.log(`✅ [CART DEBUG] Produto adicionado com sucesso:`, result);
      console.log(`✅ [DEBUG] Resposta da API:`, JSON.stringify(result, null, 2));
      const response = {
        success: true,
        message: `Produto adicionado ao carrinho com sucesso! Quantidade: ${quantity}`,
        data: result.cart,
      };
      console.log(`🎉 [DEBUG] Resultado final:`, JSON.stringify(response, null, 2));
      console.log(`🛒 [DEBUG] === FIM addToCartTool (SUCESSO) ===`);
      return response;
    } catch (error) {
      console.log(`💥 [CART DEBUG] Erro ao adicionar produto:`, error);
      console.error(`❌ [DEBUG] Erro ao adicionar produto:`, error);
      console.error(`❌ [DEBUG] Stack trace:`, error instanceof Error ? error.stack : 'Sem stack trace');
      const errorResponse = {
        success: false,
        message: `Erro ao adicionar produto ao carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
      console.log(`💥 [DEBUG] Resultado de erro:`, JSON.stringify(errorResponse, null, 2));
      console.log(`🛒 [DEBUG] === FIM addToCartTool (ERRO) ===`);
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
    console.log(`🗑️ [CART DEBUG] removeFromCartTool executado com productId: ${productId}`);
    try {
      const sessionId = getSessionId();
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
    console.log(`📝 [CART DEBUG] updateCartQuantityTool executado com productId: ${productId}, quantity: ${quantity}`);
    try {
      const sessionId = getSessionId();
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
    console.log(`👀 [CART DEBUG] viewCartTool executado`);
    console.log(`👁️ [View Cart Tool] INICIANDO execução`);
    
    try {
      const sessionId = getSessionId();
      console.log(`[AI Agent] Visualizando carrinho ${sessionId}`);
      
      // Adicionar sessionId como query parameter
      const cartData: CartData = await apiCall(`/cart?sessionId=${encodeURIComponent(sessionId)}`, {
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
    console.log(`🧹 [CART DEBUG] clearCartTool executado`);
    try {
      const sessionId = getSessionId();
      console.log(`[AI Agent] Limpando carrinho ${sessionId}`);
      
      const result = await apiCall('/cart', {
        method: 'DELETE',
        body: JSON.stringify({ sessionId }),
      }, sessionId);

      return {
        success: true,
        message: 'Carrinho limpo com sucesso! 🧹',
        data: result,
      };
    } catch (error) {
      throw new Error(`Erro ao limpar carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
      console.log(`📊 [DEBUG] Número de produtos encontrados: ${result.products?.length || 0}`);
      
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