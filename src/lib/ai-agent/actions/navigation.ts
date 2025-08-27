import { tool } from 'ai';
import { z } from 'zod';
import type { NavigationResult } from '../types';

// Tool: Redirecionar para produto
export const redirectToProductTool = tool({
  description: 'Redireciona o usuário para a página de um produto específico',
  inputSchema: z.object({
    productId: z.string().describe('ID do produto'),
  }),
  execute: async ({ productId }): Promise<NavigationResult> => {
    try {
      // Verificar se o produto existe
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        return {
          success: false,
          message: `Produto com ID "${productId}" não encontrado.`,
        };
      }
      
      const product = await response.json();
      
      return {
        success: true,
        message: `Redirecionando para o produto: ${product.name}`,
        redirectUrl: `/products/${productId}`,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao acessar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Tool: Redirecionar para categoria
export const redirectToCategoryTool = tool({
  description: 'Redireciona o usuário para uma categoria de produtos',
  inputSchema: z.object({
    categoryId: z.string().describe('Nome ou ID da categoria'),
  }),
  execute: async ({ categoryId }): Promise<NavigationResult> => {
    try {
      // Verificar se a categoria existe buscando produtos
      const response = await fetch(`/api/products?category=${encodeURIComponent(categoryId)}&limit=1`);
      
      if (!response.ok) {
        return {
          success: false,
          message: `Erro ao acessar categoria "${categoryId}".`,
        };
      }
      
      const products = await response.json();
      
      if (products.length === 0) {
        return {
          success: false,
          message: `Categoria "${categoryId}" não encontrada ou sem produtos.`,
        };
      }
      
      return {
        success: true,
        message: `Redirecionando para a categoria: ${categoryId}`,
        redirectUrl: `/category/${encodeURIComponent(categoryId)}`,
        data: { category: categoryId, productCount: products.length },
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao acessar categoria: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Tool: Redirecionar para home
export const redirectToHomeTool = tool({
  description: 'Redireciona o usuário para a página inicial',
  inputSchema: z.object({}),
  execute: async (): Promise<NavigationResult> => {
    return {
      success: true,
      message: 'Redirecionando para a página inicial',
      redirectUrl: '/',
    };
  },
});

// Tool: Redirecionar para checkout
export const redirectToCheckoutTool = tool({
  description: 'Redireciona o usuário para a página de checkout',
  inputSchema: z.object({}),
  execute: async (): Promise<NavigationResult> => {
    try {
      // Verificar se há itens no carrinho
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        return {
          success: false,
          message: 'Erro ao verificar carrinho.',
        };
      }
      
      const cartData = await response.json();
      
      if (cartData.items.length === 0) {
        return {
          success: false,
          message: 'Seu carrinho está vazio. Adicione produtos antes de ir para o checkout.',
        };
      }
      
      return {
        success: true,
        message: `Redirecionando para checkout (${cartData.itemCount} itens)`,
        redirectUrl: '/checkout',
        data: cartData,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao acessar checkout: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Tool: Redirecionar para carrinho
export const redirectToCartTool = tool({
  description: 'Redireciona o usuário para a página do carrinho',
  inputSchema: z.object({}),
  execute: async (): Promise<NavigationResult> => {
    try {
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        return {
          success: false,
          message: 'Erro ao acessar carrinho.',
        };
      }
      
      const cartData = await response.json();
      
      return {
        success: true,
        message: cartData.items.length > 0 
          ? `Redirecionando para carrinho (${cartData.itemCount} itens)`
          : 'Redirecionando para carrinho (vazio)',
        redirectUrl: '/cart',
        data: cartData,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao acessar carrinho: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Tool: Buscar página
export const searchPageTool = tool({
  description: 'Redireciona para a página de busca com um termo específico',
  inputSchema: z.object({
    query: z.string().describe('Termo de busca'),
  }),
  execute: async ({ query }): Promise<NavigationResult> => {
    return {
      success: true,
      message: `Redirecionando para busca: "${query}"`,
      redirectUrl: `/search?q=${encodeURIComponent(query)}`,
      data: { query },
    };
  },
});

// Exportar todas as tools de navegação
export const navigationTools = {
  redirect_to_product: redirectToProductTool,
  redirect_to_category: redirectToCategoryTool,
  redirect_to_home: redirectToHomeTool,
  redirect_to_checkout: redirectToCheckoutTool,
  redirect_to_cart: redirectToCartTool,
  search_page: searchPageTool,
};