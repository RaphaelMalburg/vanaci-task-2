import { tool } from "ai";
import { z } from "zod";
import { getAllGlobalContext, setGlobalContext, getGlobalContext } from "../context";
import type { ToolResult } from "../types";
import { logger } from "@/lib/logger";
import { getUserFromLocalStorage, getTokenFromLocalStorage, generateJWTToken } from "@/lib/auth-utils";
import { setCartQuantity } from "@/lib/cart-storage-user";

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
  description: "Adiciona um produto ao carrinho de compras. Se o produto já existe no carrinho, INCREMENTA a quantidade existente. Use quando o usuário disser 'adicionar', 'quero mais', 'adicionar mais X'. IMPORTANTE: Use SEMPRE o ID exato do produto retornado pela busca (ex: 'cmfy0qxy10001vbb4pgxb5ovb'), não invente IDs.",
  inputSchema: z.object({
    productId: z.string().describe("ID EXATO do produto retornado pela busca (ex: 'cmfy0qxy10001vbb4pgxb5ovb'). NUNCA invente ou modifique IDs."),
    quantity: z.number().min(1).describe("Quantidade do produto"),
  }),
  execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
    try {
      console.log(`🤖 [AI Agent] Adicionando ao carrinho: productId=${productId}, quantity=${quantity}`);
      
      const user = getUser();
      const sessionId = getGlobalContext("sessionId");
      
      console.log(`🤖 [AI Agent] Usuário: ${user ? `autenticado (${user.id})` : 'não autenticado'}`);
      console.log("🛒 [Cart Tool] Adicionando produto ao carrinho", { 
        productId, 
        quantity, 
        hasUser: !!user, 
        sessionId: sessionId?.substring(0, 8) + "..." 
      });

      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        console.log(`🤖 [AI Agent] Produto não encontrado: ${productId}`);
        return {
          success: false,
          message: `Produto não encontrado: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;
      console.log(`🤖 [AI Agent] Produto encontrado: ${productName} (ID: ${actualProductId})`);

      if (user) {
        console.log(`🤖 [AI Agent] Usando carrinho de usuário autenticado`);
        logger.info("Adicionando produto ao carrinho de usuário via API", { productId: actualProductId, quantity, userId: user.id });
        
        const cart = await apiCall("/cart", {
          method: "POST",
          body: JSON.stringify({
            productId: actualProductId,
            quantity,
          }),
        });

        console.log(`🤖 [AI Agent] Carrinho atualizado: ${cart.items?.length || 0} itens, total: R$ ${cart.total || 0}`);
        return {
          success: true,
          message: `${productName} adicionado ao carrinho! Quantidade: ${quantity}`,
          data: cart,
        } as ToolResult;
      } else {
        console.log(`🤖 [AI Agent] Usando carrinho simples (sessão)`);
        logger.info("Adicionando produto ao carrinho de sessão via API", { productId: actualProductId, quantity, sessionId });
        
        const result = await apiCall("/cart-simple", {
          method: "POST",
          body: JSON.stringify({
            productId: actualProductId,
            quantity,
          }),
        });

        console.log(`🤖 [AI Agent] Carrinho atualizado: ${result.cart?.items?.length || 0} itens, total: R$ ${result.cart?.total || 0}`);
        return {
          success: true,
          message: `${productName} adicionado ao carrinho! Quantidade: ${quantity}`,
          data: result.cart,
        } as ToolResult;
      }
    } catch (error) {
      console.error('🤖 [AI Agent] Erro ao adicionar produto ao carrinho:', error);
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

// Tool: Incrementar quantidade de produto no carrinho
export const incrementCartTool = tool({
  description: "Incrementa a quantidade de um produto já existente no carrinho. Use quando o usuário disser 'adicionar mais X' ou 'mais X unidades'.",
  inputSchema: z.object({
    productId: z.string().describe("ID ou nome do produto (ex: 'cmfb675a10002vb7gsu4jeaf8' ou 'Benuron')"),
    incrementBy: z.number().min(1).describe("Quantidade a incrementar (ex: 2 para 'adicionar mais 2')"),
  }),
  execute: async ({ productId, incrementBy }: { productId: string; incrementBy: number }) => {
    try {
      console.log(`🤖 [AI Agent] Incrementando carrinho: productId=${productId}, incrementBy=${incrementBy}`);
      
      const user = getUser();
      console.log(`🤖 [AI Agent] Usuário: ${user ? `autenticado (${user.id})` : 'não autenticado'}`);
      
      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        console.log(`🤖 [AI Agent] Produto não encontrado: ${productId}`);
        return {
          success: false,
          message: `Produto não encontrado: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;
      console.log(`🤖 [AI Agent] Produto encontrado: ${productName} (ID: ${actualProductId})`);

      // First get current cart to check existing quantity
      const currentCart = await apiCall("/cart", { method: "GET" });
      const existingItem = currentCart.items?.find((item: any) => item.id === actualProductId);
      
      if (!existingItem) {
        // If item doesn't exist, add it with the increment quantity
        console.log(`🤖 [AI Agent] Item não existe no carrinho, adicionando ${incrementBy} unidades`);
        
        // Call the add to cart logic directly
        if (user) {
          const cart = await apiCall("/cart", {
            method: "POST",
            body: JSON.stringify({
              productId: actualProductId,
              quantity: incrementBy,
            }),
          });
          return {
            success: true,
            message: `${productName} adicionado ao carrinho! Quantidade: ${incrementBy}`,
            data: cart,
          } as ToolResult;
        } else {
          const result = await apiCall("/cart-simple", {
            method: "POST",
            body: JSON.stringify({
              productId: actualProductId,
              quantity: incrementBy,
            }),
          });
          return {
            success: true,
            message: `${productName} adicionado ao carrinho! Quantidade: ${incrementBy}`,
            data: result.cart,
          } as ToolResult;
        }
      }

      const newQuantity = existingItem.quantity + incrementBy;
      console.log(`🤖 [AI Agent] Incrementando de ${existingItem.quantity} para ${newQuantity}`);
      
      logger.info("Incrementando quantidade no carrinho via API", { 
        productId: actualProductId, 
        currentQuantity: existingItem.quantity,
        incrementBy,
        newQuantity,
        userId: user?.id || 'session' 
      });

      const cart = await apiCall("/cart", {
        method: "PUT",
        body: JSON.stringify({
          productId: actualProductId,
          quantity: newQuantity,
        }),
      });

      console.log(`🤖 [AI Agent] Carrinho atualizado: ${cart.items?.length || 0} itens, total: R$ ${cart.total || 0}`);
      return {
        success: true,
        message: `${productName} incrementado! Agora você tem ${newQuantity} unidades no carrinho.`,
        data: cart,
      } as ToolResult;
    } catch (error) {
      console.error('🤖 [AI Agent] Erro ao incrementar produto no carrinho:', error);
      logger.error("Erro ao incrementar produto no carrinho", { error, productId, incrementBy });
      return {
        success: false,
        message: `Erro ao incrementar produto no carrinho: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Definir quantidade específica no carrinho
export const setCartQuantityTool = tool({
  description: "Define uma quantidade específica total para um produto no carrinho (substitui a quantidade atual). Use quando o usuário disser 'quero 4 no total', 'alterar para 3', 'deixar apenas 2'. Diferente de incrementar, esta função DEFINE a quantidade final.",
  inputSchema: z.object({
    productId: z.string().describe("ID ou nome do produto (ex: 'cmfb675a10002vb7gsu4jeaf8' ou 'Benuron')"),
    quantity: z.number().min(1).describe("Quantidade total desejada no carrinho (ex: 4 para 'quero 4 no total')"),
  }),
  execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
    try {
      console.log(`🤖 [AI Agent] Definindo quantidade específica: productId=${productId}, quantity=${quantity}`);
      
      const user = getUser();
      console.log(`🤖 [AI Agent] Usuário: ${user ? `autenticado (${user.id})` : 'não autenticado'}`);
      
      if (!user) {
        return {
          success: false,
          message: "Você precisa estar logado para alterar quantidades no carrinho.",
          data: null,
        } as ToolResult;
      }
      
      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        console.log(`🤖 [AI Agent] Produto não encontrado: ${productId}`);
        return {
          success: false,
          message: `Produto não encontrado: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;
      console.log(`🤖 [AI Agent] Produto encontrado: ${productName} (ID: ${actualProductId})`);

      // Use the new setCartQuantity function directly for authenticated users
      const updatedCart = await setCartQuantity(user.id, actualProductId, quantity);
      
      console.log(`🤖 [AI Agent] Quantidade definida com sucesso: ${quantity} unidades de ${productName}`);
      return {
        success: true,
        message: `${productName} atualizado! Agora você tem ${quantity} unidades no carrinho.`,
        data: updatedCart,
      } as ToolResult;
    } catch (error) {
      console.error('🤖 [AI Agent] Erro ao definir quantidade no carrinho:', error);
      logger.error("Erro ao definir quantidade no carrinho", { error, productId, quantity });
      return {
        success: false,
        message: `Erro ao definir quantidade no carrinho: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Redirecionar para carrinho ou checkout
export const redirectToCartTool = tool({
  description: "Redireciona o usuário para a página do carrinho ou checkout quando solicitado",
  inputSchema: z.object({
    destination: z.enum(["cart", "checkout"]).describe("Destino: 'cart' para página do carrinho, 'checkout' para finalizar compra"),
  }),
  execute: async ({ destination }: { destination: "cart" | "checkout" }) => {
    try {
      console.log(`🤖 [AI Agent] Redirecionando para: ${destination}`);
      
      const redirectUrl = destination === "cart" ? "/cart" : "/cart"; // Both go to cart page for now
      
      // Set a global context to trigger redirect
      setGlobalContext("redirectTo", redirectUrl);
      
      const message = destination === "cart" 
        ? "Redirecionando você para o carrinho de compras..." 
        : "Redirecionando você para finalizar a compra...";
      
      return {
        success: true,
        message,
        data: { redirectUrl },
      } as ToolResult;
    } catch (error) {
      console.error('🤖 [AI Agent] Erro ao redirecionar:', error);
      return {
        success: false,
        message: `Erro ao redirecionar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool search_products removido daqui - está definido em products.ts

// Export all cart tools
export const cartTools = {
  add_to_cart: addToCartTool,
  remove_from_cart: removeFromCartTool,
  update_cart_quantity: updateCartQuantityTool,
  set_cart_quantity: setCartQuantityTool,
  view_cart: viewCartTool,
  clear_cart: clearCartTool,
  increment_cart: incrementCartTool,
  redirect_to_cart: redirectToCartTool,
};
