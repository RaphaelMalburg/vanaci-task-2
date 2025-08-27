import { tool } from 'ai';
import { z } from 'zod';
import type { ToolResult, Product, Category, SearchResult } from '../types';

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

// Tool: Buscar produtos
export const searchProductsTool = tool({
  description: 'Busca produtos por nome, descrição ou categoria',
  inputSchema: z.object({
    query: z.string().describe('Termo de busca para encontrar produtos'),
    category: z.string().optional().describe('Filtrar por categoria específica'),
    limit: z.number().min(1).max(50).default(10).describe('Número máximo de resultados'),
  }),
  execute: async ({ query, category, limit }) => {
    try {
      const searchParams = new URLSearchParams({
        search: query,
        limit: limit.toString(),
      });
      
      if (category) {
        searchParams.append('category', category);
      }
      
      const products: Product[] = await apiCall(`/products?${searchParams.toString()}`);
      
      if (products.length === 0) {
        return {
          success: true,
          message: `Nenhum produto encontrado para "${query}".`,
          data: { products: [], total: 0, query },
        };
      }
      
      const productsList = products
        .map(product => `- ${product.name} - R$ ${product.price.toFixed(2)} (ID: ${product.id})`)
        .join('\n');
      
      return {
        success: true,
        message: `Encontrados ${products.length} produtos para "${query}":\n${productsList}`,
        data: { products, total: products.length, query },
      };
    } catch (error) {
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
  execute: async ({ productId }) => {
    try {
      const product: Product = await apiCall(`/products/${productId}`);
      
      const details = [
        `**${product.name}**`,
        `Preço: R$ ${product.price.toFixed(2)}`,
        `Categoria: ${product.category}`,
        `Estoque: ${product.stock} unidades`,
        `Descrição: ${product.description}`,
      ];
      
      if (product.symptoms && product.symptoms.length > 0) {
        details.push(`Indicado para: ${product.symptoms.join(', ')}`);
      }
      
      return {
        success: true,
        message: details.join('\n'),
        data: product,
      };
    } catch (error) {
      throw new Error(`Erro ao obter detalhes do produto: ${error instanceof Error ? error.message : 'Produto não encontrado'}`);
    }
  },
});

// Tool: Listar categorias
export const listCategoriesTool = tool({
  description: 'Lista todas as categorias de produtos disponíveis',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      // Como não temos endpoint específico para categorias, vamos extrair das produtos
      const products: Product[] = await apiCall('/products?limit=1000');
      
      const categories = [...new Set(products.map(p => p.category))]
        .filter(Boolean)
        .sort();
      
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
  execute: async ({ symptomOrNeed, limit }) => {
    try {
      // Buscar produtos que contenham o sintoma/necessidade na descrição ou sintomas
      const products: Product[] = await apiCall(`/products?limit=1000`);
      
      const searchTerm = symptomOrNeed.toLowerCase();
      
      const recommendedProducts = products
        .filter(product => {
          const nameMatch = product.name.toLowerCase().includes(searchTerm);
          const descMatch = product.description.toLowerCase().includes(searchTerm);
          const symptomsMatch = product.symptoms?.some(symptom => 
            symptom.toLowerCase().includes(searchTerm)
          );
          const needsMatch = product.needs?.some(need => 
            need.toLowerCase().includes(searchTerm)
          );
          
          return nameMatch || descMatch || symptomsMatch || needsMatch;
        })
        .slice(0, limit);
      
      if (recommendedProducts.length === 0) {
        return {
          success: true,
          message: `Nenhum produto recomendado encontrado para "${symptomOrNeed}". Tente buscar por termos mais gerais.`,
          data: { products: [], symptomOrNeed },
        };
      }
      
      const productsList = recommendedProducts
        .map(product => `- ${product.name} - R$ ${product.price.toFixed(2)} (ID: ${product.id})\n  ${product.description.substring(0, 100)}...`)
        .join('\n\n');
      
      return {
        success: true,
        message: `Produtos recomendados para "${symptomOrNeed}":\n\n${productsList}`,
        data: { products: recommendedProducts, symptomOrNeed },
      };
    } catch (error) {
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
    try {
      const products: Product[] = await apiCall(`/products?limit=${limit * 2}`);
      
      // Simular produtos em promoção (produtos com preço menor que R$ 50 ou que contenham "desconto" na descrição)
      const promotionalProducts = products
        .filter(product => 
          product.price < 50 || 
          product.description.toLowerCase().includes('desconto') ||
          product.description.toLowerCase().includes('promoção')
        )
        .slice(0, limit);
      
      if (promotionalProducts.length === 0) {
        return {
          success: true,
          message: 'Nenhum produto em promoção no momento.',
          data: { products: [] },
        };
      }
      
      const productsList = promotionalProducts
        .map(product => `- ${product.name} - R$ ${product.price.toFixed(2)} (ID: ${product.id})`)
        .join('\n');
      
      return {
        success: true,
        message: `Produtos em promoção:\n${productsList}`,
        data: { products: promotionalProducts },
      };
    } catch (error) {
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