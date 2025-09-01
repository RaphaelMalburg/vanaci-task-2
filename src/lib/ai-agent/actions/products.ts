import { tool } from 'ai';
import { z } from 'zod';
import { ProductService } from '@/lib/services/product.service';
import { logger } from '@/lib/logger';
import type { ToolResult, Product, Category, SearchResult } from '../types';

// Tool: Buscar produtos
export const searchProductsTool = tool({
  description: 'Busca produtos por nome, descrição ou categoria',
  inputSchema: z.object({
    query: z.string().describe('Termo de busca para encontrar produtos'),
    category: z.string().optional().describe('Filtrar por categoria específica'),
    limit: z.number().min(1).max(50).default(10).describe('Número máximo de resultados'),
  }),
  execute: async ({ query, category, limit }: {
    query: string;
    category?: string;
    limit: number;
  }) => {
    logger.info('Buscando produtos', { query, category, limit })
    
    try {
      const productService = ProductService.getInstance()
      const products = await productService.getAllProducts({
        search: query,
        category,
        limit
      })
      
      logger.info('Produtos encontrados', { count: products.length })
      
      if (products.length === 0) {
        return {
          success: true,
          message: `Nenhum produto encontrado para "${query}".`,
          data: { products: [], total: 0, query },
        };
      }
      
      const productsList = products
        .map(product => `- ${product.name} - €${product.price.toFixed(2)} (ID: ${product.id})`)
        .join('\n');
      
      return {
        success: true,
        message: `Encontrados ${products.length} produtos para "${query}":\n${productsList}`,
        data: { products, total: products.length, query },
      };
    } catch (error) {
      logger.error('Erro ao buscar produtos', { query, error: error instanceof Error ? error.message : error })
      throw new Error(`Erro ao buscar produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Obter detalhes do produto
export const getProductDetailsTool = tool({
  description: 'Obtém informações detalhadas de um produto específico',
  inputSchema: z.object({
    productId: z.string().describe('ID do produto'),
  }),
  execute: async ({ productId }: {
    productId: string;
  }) => {
    logger.info('Buscando detalhes do produto', { productId })
    
    try {
      const productService = ProductService.getInstance()
      const product = await productService.getProductById(productId)
      
      if (!product) {
        logger.warn('Produto não encontrado', { productId })
        return {
          success: false,
          message: `Produto com ID ${productId} não encontrado.`,
        }
      }
      
      logger.info('Detalhes do produto obtidos', { productId, name: product.name })
      
      return {
        success: true,
        message: `Produto: ${product.name}\nPreço: €${product.price.toFixed(2)}\nDescrição: ${product.description || 'Sem descrição'}\nCategoria: ${product.category || 'Sem categoria'}`,
        data: product,
      };
    } catch (error) {
      logger.error('Erro ao buscar detalhes do produto', { productId, error: error instanceof Error ? error.message : error })
      return {
        success: false,
        message: `Produto não encontrado ou erro ao buscar detalhes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Tool: Listar categorias
export const listCategoriesTool = tool({
  description: 'Lista todas as categorias de produtos disponíveis',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    logger.info('Listando categorias de produtos')
    
    try {
      const productService = ProductService.getInstance()
      const products = await productService.getAllProducts({ limit: 1000 })
      
      // Extrair categorias únicas dos produtos
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
      
      logger.info('Categorias encontradas', { count: categories.length })
      
      if (categories.length === 0) {
        return {
          success: true,
          message: 'Nenhuma categoria encontrada.',
          data: { categories: [] },
        };
      }
      
      const categoriesList = categories
        .map(category => `- ${category}`)
        .join('\n');
      
      return {
        success: true,
        message: `Categorias disponíveis:\n${categoriesList}`,
        data: { categories },
      };
    } catch (error) {
      logger.error('Erro ao listar categorias', { error: error instanceof Error ? error.message : error })
      throw new Error(`Erro ao listar categorias: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Recomendar produtos por sintoma ou necessidade
export const listRecommendedProductsTool = tool({
  description: 'Recomenda produtos baseado em sintomas ou necessidades específicas',
  inputSchema: z.object({
    symptomOrNeed: z.string().describe('Sintoma ou necessidade do usuário (ex: "dor de cabeça", "vitaminas", "gripe")'),
    limit: z.number().min(1).max(20).default(5).describe('Número máximo de recomendações'),
  }),
  execute: async ({ symptomOrNeed, limit }: {
    symptomOrNeed: string;
    limit: number;
  }) => {
    logger.info('Buscando produtos recomendados', { symptomOrNeed, limit })
    
    try {
      const productService = ProductService.getInstance()
      const products = await productService.getAllProducts({ search: symptomOrNeed, limit })
      
      logger.info('Produtos recomendados encontrados', { count: products.length })
      
      if (products.length === 0) {
        return {
          success: true,
          message: `Não encontrei produtos específicos para "${symptomOrNeed}". Recomendo consultar um farmacêutico ou médico para orientação adequada.`,
          data: { products: [], symptomOrNeed },
        };
      }
      
      const productsList = products
        .map(product => `• ${product.name} - €${product.price.toFixed(2)} (ID: ${product.id})`)
        .join('\n');
      
      return {
        success: true,
        message: `Produtos recomendados para "${symptomOrNeed}":\n\n${productsList}\n\n⚠️ Importante: Consulte sempre um profissional de saúde antes de usar medicamentos.`,
        data: { products, symptomOrNeed },
      };
    } catch (error) {
      logger.error('Erro ao buscar recomendações', { symptomOrNeed, error: error instanceof Error ? error.message : error })
      throw new Error(`Erro ao buscar recomendações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Produtos em promoção
export const getPromotionalProductsTool = tool({
  description: 'Lista produtos em promoção ou com desconto',
  inputSchema: z.object({
    limit: z.number().min(1).max(20).default(10).describe('Número máximo de produtos'),
  }),
  execute: async ({ limit }) => {
    logger.info('Buscando produtos promocionais', { limit })
    
    try {
      const productService = ProductService.getInstance()
      const products = await productService.getAllProducts({ limit: limit * 2 })
      
      // Simular produtos em promoção (ordenar por preço e pegar os mais baratos)
      const promotionalProducts = products
        .sort((a, b) => a.price - b.price)
        .slice(0, limit)
      
      logger.info('Produtos promocionais encontrados', { count: promotionalProducts.length })
      
      if (promotionalProducts.length === 0) {
        return {
          success: true,
          message: 'Não há produtos em promoção no momento.',
          data: { products: [] },
        };
      }
      
      const productsList = promotionalProducts
        .map(product => `• ${product.name} - €${product.price.toFixed(2)} (ID: ${product.id})`)
        .join('\n');
      
      return {
        success: true,
        message: `🏷️ Produtos em destaque (${promotionalProducts.length}):\n\n${productsList}`,
        data: { products: promotionalProducts },
      };
    } catch (error) {
      logger.error('Erro ao buscar produtos promocionais', { error: error instanceof Error ? error.message : error })
      throw new Error(`Erro ao buscar promoções: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Exportar todas as tools de produtos
export const productTools = {
  search_products: searchProductsTool,
  get_product_details: getProductDetailsTool,
  list_categories: listCategoriesTool,
  list_recommended_products: listRecommendedProductsTool,
  get_promotional_products: getPromotionalProductsTool,
};