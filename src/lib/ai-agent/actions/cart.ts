import { tool } from "ai";
import { z } from "zod";
import { getAllGlobalContext, setGlobalContext, getGlobalContext } from "../context";
import type { ToolResult } from "../types";
import { logger } from "@/lib/logger";
import { getUserFromLocalStorage, getTokenFromLocalStorage, generateJWTToken } from "@/lib/auth-utils";

// Função para obter dados do usuário do contexto global ou localStorage
function getUser(): { id: string; username: string } | null {
  // Primeiro tenta obter do contexto global (definido pelo AI agent)
  const contextUser = getGlobalContext("user");
  if (contextUser) {
    console.log("🔑 [Cart Tool] Usando usuário do contexto global:", contextUser.username);
    return contextUser;
  }

  // Fallback para localStorage se não estiver no contexto (apenas no browser)
  if (typeof window !== 'undefined') {
    const fallbackUser = getUserFromLocalStorage();
    if (fallbackUser) {
      console.log("⚠️ [Cart Tool] Usando usuário fallback do localStorage:", fallbackUser.username);
      return fallbackUser;
    }
  }

  console.log("ℹ️ [Cart Tool] Nenhum usuário autenticado encontrado - usando carrinho de sessão");
  return null;
}

// Função auxiliar para fazer chamadas à API com autenticação
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_APP_URL || "https://farmacia-vanaci.vercel.app" : "http://localhost:3007";

  // Obter token do usuário para autenticação
  const user = getUser();
  
  // Se há usuário autenticado, usar API de carrinho de usuário
  if (user) {
    // Tentar obter token JWT do localStorage primeiro (apenas no browser)
    let token = null;
    if (typeof window !== 'undefined') {
      token = getTokenFromLocalStorage();
    }

    // Se não houver token no localStorage, gerar um novo JWT
    if (!token) {
      console.log("🔑 [Cart Tool] Gerando novo token JWT para usuário:", user.username);
      token = generateJWTToken(user);
    }

    const response = await fetch(`${baseUrl}/api${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Cart Tool] API Error:", response.status, errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  } else {
    // Se não há usuário autenticado, usar API de carrinho simples com sessionId
    const sessionId = getGlobalContext("sessionId");
    if (!sessionId) {
      throw new Error("Session ID não encontrado no contexto global");
    }

    const response = await fetch(`${baseUrl}/api/cart-simple`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
      body: options.body ? JSON.stringify({
        ...JSON.parse(options.body as string),
        sessionId
      }) : JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [Cart Tool] Simple Cart API Error:", response.status, errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Helper function to find product by name or ID
async function findProductByNameOrId(productIdentifier: string): Promise<{ id: string; name: string } | null> {
  try {
    // First try to find by exact ID
    const productByIdResult = await apiCall(`/products?q=${encodeURIComponent(productIdentifier)}`, {
      method: "GET",
    });
    
    if (productByIdResult && Array.isArray(productByIdResult)) {
      // Check if any product has the exact ID
      const exactIdMatch = productByIdResult.find((p: any) => p.id === productIdentifier);
      if (exactIdMatch) {
        return { id: exactIdMatch.id, name: exactIdMatch.name };
      }
      
      // If no exact ID match, search by name (case insensitive)
      const nameMatch = productByIdResult.find((p: any) => 
        p.name.toLowerCase().includes(productIdentifier.toLowerCase()) ||
        productIdentifier.toLowerCase().includes(p.name.toLowerCase())
      );
      
      if (nameMatch) {
        return { id: nameMatch.id, name: nameMatch.name };
      }
    }
    
    return null;
  } catch (error) {
    logger.error("Error finding product", { error, productIdentifier });
    return null;
  }
}

// Tool: Adicionar produto ao carrinho
export const addToCartTool = tool({
  description: "Adiciona um produto ao carrinho de compras. Pode usar o ID do produto ou o nome do produto.",
  inputSchema: z.object({
    productId: z.string().describe("ID ou nome do produto a ser adicionado (ex: 'cmfb675a10002vb7gsu4jeaf8' ou 'Aspirina Express')"),
    quantity: z.number().min(1).describe("Quantidade do produto"),
  }),
  execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
    try {
      const user = getUser();
      const sessionId = getGlobalContext("sessionId");
      
      console.log("🛒 [Cart Tool] Adicionando produto ao carrinho", { 
        productId, 
        quantity, 
        hasUser: !!user, 
        sessionId: sessionId?.substring(0, 8) + "..." 
      });

      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        return {
          success: false,
          message: `Produto não encontrado: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;

      if (user) {
        logger.info("Adicionando produto ao carrinho de usuário via API", { productId: actualProductId, quantity, userId: user.id });
        
        const cart = await apiCall("/cart", {
          method: "POST",
          body: JSON.stringify({
            productId: actualProductId,
            quantity,
          }),
        });

        return {
          success: true,
          message: `${productName} adicionado ao carrinho! Quantidade: ${quantity}`,
          data: cart,
        } as ToolResult;
      } else {
        logger.info("Adicionando produto ao carrinho de sessão via API", { productId: actualProductId, quantity, sessionId });
        
        const result = await apiCall("/cart-simple", {
          method: "POST",
          body: JSON.stringify({
            productId: actualProductId,
            quantity,
          }),
        });

        return {
          success: true,
          message: `${productName} adicionado ao carrinho! Quantidade: ${quantity}`,
          data: result.cart,
        } as ToolResult;
      }
    } catch (error) {
      logger.error("Erro ao adicionar produto ao carrinho", { error, productId, quantity });
      return {
        success: false,
        message: `Erro ao adicionar produto ao carrinho: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Remover produto do carrinho
export const removeFromCartTool = tool({
  description: "Remove um produto do carrinho de compras. Pode usar o ID do produto ou o nome do produto.",
  inputSchema: z.object({
    productId: z.string().describe("ID ou nome do produto a ser removido (ex: 'cmfb675a10002vb7gsu4jeaf8' ou 'Aspirina Express')"),
  }),
  execute: async ({ productId }: { productId: string }) => {
    try {
      const user = getUser();
      
      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        return {
          success: false,
          message: `Produto não encontrado: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;
      
      logger.info("Removendo produto do carrinho via API", { productId: actualProductId, userId: user?.id || 'session' });

      const cart = await apiCall("/cart", {
        method: "DELETE",
        body: JSON.stringify({
          productId: actualProductId,
        }),
      });

      return {
        success: true,
        message: `${productName} removido do carrinho!`,
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Erro ao remover produto do carrinho", { error, productId });
      return {
        success: false,
        message: `Erro ao remover produto do carrinho: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Atualizar quantidade no carrinho
export const updateCartQuantityTool = tool({
  description: "Atualiza a quantidade de um produto no carrinho. Pode usar o ID do produto ou o nome do produto.",
  inputSchema: z.object({
    productId: z.string().describe("ID ou nome do produto (ex: 'cmfb675a10002vb7gsu4jeaf8' ou 'Aspirina Express')"),
    quantity: z.number().min(0).describe("Nova quantidade (0 para remover)"),
  }),
  execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
    try {
      const user = getUser();
      
      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        return {
          success: false,
          message: `Produto não encontrado: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;
      
      logger.info("Atualizando quantidade no carrinho via API", { productId: actualProductId, quantity, userId: user?.id || 'session' });

      const cart = await apiCall("/cart", {
        method: "PUT",
        body: JSON.stringify({
          productId: actualProductId,
          quantity,
        }),
      });

      return {
        success: true,
        message: quantity === 0 ? `${productName} removido do carrinho!` : `Quantidade de ${productName} atualizada para ${quantity}!`,
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Erro ao atualizar quantidade no carrinho", { error, productId, quantity });
      return {
        success: false,
        message: `Erro ao atualizar quantidade: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Visualizar carrinho
export const viewCartTool = tool({
  description: "Visualiza o conteúdo atual do carrinho de compras",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const user = getUser();
      
      logger.info("Visualizando carrinho via API", { userId: user?.id || 'session' });

      const cart = await apiCall("/cart", {
        method: "GET",
      });

      return {
        success: true,
        message: "Carrinho carregado com sucesso!",
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Erro ao carregar carrinho", { error });
      return {
        success: false,
        message: `Erro ao carregar carrinho: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Limpar carrinho
export const clearCartTool = tool({
  description: "Remove todos os produtos do carrinho de compras",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const user = getUser();
      
      logger.info("Limpando carrinho via API", { userId: user?.id || 'session' });

      const cart = await apiCall("/cart/clear", {
        method: "POST",
      });

      return {
        success: true,
        message: "Carrinho limpo com sucesso!",
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Erro ao limpar carrinho", { error });
      return {
        success: false,
        message: `Erro ao limpar carrinho: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        data: null,
      } as ToolResult;
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
