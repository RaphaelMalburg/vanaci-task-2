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
        .map(product => {
          const imageInfo = product.image ? ` 📷 [Imagem: ${product.image}]` : '';
          return `- ${product.name} - €${product.price.toFixed(2)}${imageInfo} (ID: ${product.id})`;
        })
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
      
      const imageInfo = product.image ? `\n📷 Imagem: ${product.image}` : '';
      
      return {
        success: true,
        message: `Produto: ${product.name}\nPreço: €${product.price.toFixed(2)}\nDescrição: ${product.description || 'Sem descrição'}\nCategoria: ${product.category || 'Sem categoria'}${imageInfo}`,
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
      
      // Mapear sintomas/necessidades para termos de busca mais específicos
      const searchTerms = getSearchTermsForSymptom(symptomOrNeed.toLowerCase());
      
      let allProducts: any[] = [];
      
      // Buscar por cada termo
      for (const term of searchTerms) {
        const products = await productService.getAllProducts({ search: term, limit: limit * 2 });
        allProducts.push(...products);
      }
      
      // Remover duplicatas e limitar resultados
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      ).slice(0, limit);
      
      logger.info('Produtos recomendados encontrados', { count: uniqueProducts.length, searchTerms })
      
      if (uniqueProducts.length === 0) {
        return {
          success: true,
          message: `Não foram encontrados produtos específicos recomendados para "${symptomOrNeed}". É importante considerar consultar um farmacêutico ou um médico para obter orientações adequadas sobre que tomar nesse caso. Se precisar de mais alguma informação ou ajuda, estou à disposição!`,
          data: { products: [], symptomOrNeed },
        };
      }
      
      const productsList = uniqueProducts
        .map(product => {
          const imageInfo = product.image ? ` 📷 [Imagem: ${product.image}]` : '';
          return `• ${product.name} - €${product.price.toFixed(2)}${imageInfo} (ID: ${product.id})`;
        })
        .join('\n');
      
      return {
        success: true,
        message: `Produtos recomendados para "${symptomOrNeed}":\n\n${productsList}\n\n⚠️ Importante: Consulte sempre um profissional de saúde antes de usar medicamentos.`,
        data: { products: uniqueProducts, symptomOrNeed },
      };
    } catch (error) {
      logger.error('Erro ao buscar recomendações', { symptomOrNeed, error: error instanceof Error ? error.message : error })
      throw new Error(`Erro ao buscar recomendações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Função auxiliar para mapear sintomas para termos de busca
function getSearchTermsForSymptom(symptom: string): string[] {
  const symptomMap: Record<string, string[]> = {
    // Dores
    'dor': ['dor', 'analgésico', 'paracetamol', 'ibuprofeno'],
    'dor de cabeça': ['dor', 'analgésico', 'paracetamol', 'ibuprofeno', 'aspirina'],
    'dor no joelho': ['dor', 'anti-inflamatório', 'ibuprofeno', 'voltaren', 'momendol'],
    'dor muscular': ['dor', 'anti-inflamatório', 'ibuprofeno', 'voltaren', 'momendol'],
    'dor nas costas': ['dor', 'anti-inflamatório', 'ibuprofeno', 'voltaren'],
    'dor articular': ['dor', 'anti-inflamatório', 'ibuprofeno', 'voltaren'],
    'dor de garganta': ['garganta', 'strepsils', 'anti-inflamatório'],
    
    // Gripes e constipações
    'gripe': ['gripe', 'constipação', 'ben-u-gripe', 'griponal'],
    'constipação': ['gripe', 'constipação', 'ben-u-gripe', 'griponal'],
    'tosse': ['tosse', 'gripe', 'antigrippine'],
    'febre': ['febre', 'paracetamol', 'ibuprofeno', 'dor'],
    
    // Digestivo
    'enjoo': ['enjoo', 'vomidrine', 'digestivo'],
    'náusea': ['enjoo', 'vomidrine', 'digestivo'],
    'diarreia': ['diarreia', 'imodium', 'digestivo'],
    'obstipação': ['obstipação', 'laevolac', 'dulcolax'],
    'prisão de ventre': ['obstipação', 'laevolac', 'dulcolax'],
    
    // Pele
    'acne': ['acne', 'borbulhas', 'pasta', 'sérum'],
    'borbulhas': ['acne', 'borbulhas', 'pasta', 'sérum'],
    'pele oleosa': ['oleosa', 'acne', 'gel', 'sérum'],
    
    // Promoções
    'promoção': ['promoção', 'desconto', 'oferta'],
    'promoções': ['promoção', 'desconto', 'oferta'],
    'desconto': ['promoção', 'desconto', 'oferta'],
    'ofertas': ['promoção', 'desconto', 'oferta'],
  };
  
  // Buscar correspondências exatas primeiro
  for (const [key, terms] of Object.entries(symptomMap)) {
    if (symptom.includes(key)) {
      return terms;
    }
  }
  
  // Se não encontrar correspondência, usar o termo original
  return [symptom];
}

// Tool: Produtos mais vendidos (best sellers)
export const getBestSellersTool = tool({
  description: 'Lista os produtos mais vendidos da farmácia',
  inputSchema: z.object({
    limit: z.number().min(1).max(20).default(10).describe('Número máximo de produtos'),
  }),
  execute: async ({ limit }) => {
    logger.info('Buscando produtos mais vendidos', { limit })
    
    try {
      const productService = ProductService.getInstance()
      const allProducts = await productService.getAllProducts({ limit: 100 })
      
      // Lista hardcoded de produtos mais vendidos (IDs ou nomes)
      const bestSellerNames = [
        'Dipirona',
        'Paracetamol',
        'Ibuprofeno',
        'Vitamina C',
        'Vitamina D',
        'Álcool',
        'Termômetro',
        'Protetor Solar',
        'Hidratante',
        'Soro Fisiológico'
      ];
      
      // Filtrar produtos que correspondem aos mais vendidos
      const bestSellers = allProducts
        .filter(product => 
          bestSellerNames.some(name => 
            product.name.toLowerCase().includes(name.toLowerCase())
          )
        )
        .slice(0, limit);
      
      // Se não encontrar produtos suficientes, pegar os primeiros produtos disponíveis
      if (bestSellers.length < limit) {
        const remainingProducts = allProducts
          .filter(product => !bestSellers.find(bs => bs.id === product.id))
          .slice(0, limit - bestSellers.length);
        bestSellers.push(...remainingProducts);
      }
      
      logger.info('Produtos mais vendidos encontrados', { count: bestSellers.length })
      
      if (bestSellers.length === 0) {
        return {
          success: true,
          message: 'Não há informações sobre produtos mais vendidos no momento.',
          data: { products: [] },
        };
      }
      
      const productsList = bestSellers
        .map((product, index) => `${index + 1}. ${product.name} - €${product.price.toFixed(2)} (ID: ${product.id})`)
        .join('\n');
      
      return {
        success: true,
        message: `🏆 Produtos mais vendidos (${bestSellers.length}):\n\n${productsList}`,
        data: { products: bestSellers },
      };
    } catch (error) {
      logger.error('Erro ao buscar produtos mais vendidos', { error: error instanceof Error ? error.message : error })
      throw new Error(`Erro ao buscar mais vendidos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Produtos em promoção
export const getPromotionalProductsTool = tool({
  description: 'Lista produtos em promoção ou com desconto',
  inputSchema: z.object({
    limit: z.number().min(1).max(20).default(8).describe('Número máximo de produtos promocionais'),
    category: z.string().optional().describe('Categoria específica para promoções'),
  }),
  execute: async ({ limit, category }: { limit: number; category?: string }) => {
    logger.info('Buscando produtos promocionais', { limit, category })
    
    try {
      const productService = ProductService.getInstance()
      
      // Buscar produtos por categoria se especificada
      const searchOptions: any = { limit: limit * 3 };
      if (category) {
        searchOptions.category = category;
      }
      
      const products = await productService.getAllProducts(searchOptions);
      
      // Simular promoções com produtos reais, priorizando certas categorias
      const promotionalProducts = products
        .filter(product => {
            // Priorizar certas categorias para promoções
            const promotionCategories = ['Analgésicos', 'Vitaminas', 'Cuidados de Pele', 'Digestivo'];
            return !category || promotionCategories.includes(product.category || '');
          })
        .sort(() => Math.random() - 0.5) // Embaralhar
        .slice(0, limit)
        .map(product => {
          // Diferentes tipos de desconto baseados na categoria
          let discountPercent = 15; // Desconto padrão
          
          if (product.category === 'Analgésicos') discountPercent = 20;
           if (product.category === 'Vitaminas') discountPercent = 25;
           if (product.category === 'Cuidados de Pele') discountPercent = 30;
          
          const originalPrice = product.price;
          const discountedPrice = Number((originalPrice * (1 - discountPercent / 100)).toFixed(2));
          
          return {
            ...product,
            originalPrice,
            price: discountedPrice,
            discount: discountPercent,
            savings: Number((originalPrice - discountedPrice).toFixed(2)),
          };
        });
      
      logger.info('Produtos promocionais encontrados', { count: promotionalProducts.length })
      
      if (promotionalProducts.length === 0) {
        return {
          success: true,
          message: category 
            ? `Não há produtos em promoção na categoria "${category}" no momento. Mas temos outras ofertas disponíveis!`
            : 'Não há produtos em promoção no momento, mas em breve teremos novas ofertas!',
          data: { products: [] },
        };
      }
      
      const productsList = promotionalProducts
        .map(product => {
          const imageInfo = product.image ? ` 📷 [Imagem: ${product.image}]` : '';
          const categoryInfo = product.category ? ` [${product.category}]` : '';
          return `🏷️ ${product.name}${categoryInfo} - €${product.price} (antes €${product.originalPrice}) - ${product.discount}% OFF (Poupa €${product.savings})${imageInfo} (ID: ${product.id})`;
        })
        .join('\n');
      
      const totalSavings = promotionalProducts.reduce((sum, p) => sum + p.savings, 0);
      
      return {
        success: true,
        message: `🎉 Produtos em Promoção${category ? ` - ${category}` : ''}:\n\n${productsList}\n\n💰 Poupança total disponível: €${totalSavings.toFixed(2)}\n💡 Aproveite estas ofertas especiais!`,
        data: { products: promotionalProducts, totalSavings },
      };
    } catch (error) {
      logger.error('Erro ao buscar produtos promocionais', { error: error instanceof Error ? error.message : error })
      throw new Error(`Erro ao buscar produtos promocionais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Exportar todas as tools de produtos
// Tool: Redirecionar para página do produto
export const redirectToProductTool = tool({
  description: 'Redireciona o usuário para a página específica de um produto',
  inputSchema: z.object({
    productId: z.string().describe('ID do produto para redirecionamento'),
    productName: z.string().describe('Nome do produto mencionado'),
  }),
  execute: async ({ productId, productName }: {
    productId: string;
    productName: string;
  }) => {
    logger.info('Redirecionando para produto', { productId, productName })
    
    try {
      const productService = ProductService.getInstance()
      const product = await productService.getProductById(productId)
      
      if (!product) {
        return {
          success: false,
          message: `Produto com ID ${productId} não encontrado.`,
          data: { productId, productName },
        };
      }
      
      return {
        success: true,
        message: `🔗 Redirecionando para a página do ${productName}...`,
        data: { 
          redirect: true,
          productId,
          productName,
          url: `/products/${productId}`,
          product
        },
      };
    } catch (error) {
      logger.error('Erro ao redirecionar para produto', { error, productId, productName })
      return {
        success: false,
        message: `Erro ao redirecionar para ${productName}. Tente novamente.`,
        data: { productId, productName },
      };
    }
  },
});

// Tool: Mostrar múltiplos produtos no overlay
export const showMultipleProductsTool = tool({
  description: 'Exibe múltiplos produtos específicos no overlay de produtos',
  inputSchema: z.object({
    productIds: z.array(z.string()).min(1).max(10).describe('Lista de IDs dos produtos para exibir'),
    title: z.string().optional().describe('Título personalizado para o overlay'),
    query: z.string().optional().describe('Query de busca relacionada'),
  }),
  execute: async ({ productIds, title, query }: {
    productIds: string[];
    title?: string;
    query?: string;
  }) => {
    logger.info('Exibindo múltiplos produtos no overlay', { productIds, title, query })
    
    try {
      const productService = ProductService.getInstance()
      const products = []
      
      // Buscar cada produto por ID
      for (const productId of productIds) {
        try {
          const product = await productService.getProductById(productId)
          if (product) {
            products.push(product)
          } else {
            logger.warn('Produto não encontrado', { productId })
          }
        } catch (error) {
          logger.warn('Erro ao buscar produto', { productId, error })
        }
      }
      
      if (products.length === 0) {
        return {
          success: false,
          message: 'Nenhum dos produtos especificados foi encontrado.',
          data: { productIds, products: [] },
        };
      }
      
      const foundCount = products.length;
      const totalCount = productIds.length;
      const displayTitle = title || `Produtos Selecionados (${foundCount}/${totalCount})`;
      
      logger.info('Produtos encontrados para overlay', { foundCount, totalCount })
      
      const productsList = products
        .map(product => `• ${product.name} - €${product.price.toFixed(2)}`)  
        .join('\n');
      
      return {
        success: true,
        message: `📦 Exibindo ${foundCount} produto(s) no overlay:\n\n${productsList}`,
        data: { 
          products, 
          title: displayTitle,
          query,
          showInOverlay: true,
          productIds 
        },
      };
    } catch (error) {
      logger.error('Erro ao exibir múltiplos produtos', { productIds, error: error instanceof Error ? error.message : error })
      throw new Error(`Erro ao exibir produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

export const productTools = {
  search_products: searchProductsTool,
  get_product_details: getProductDetailsTool,
  list_categories: listCategoriesTool,
  list_recommended_products: listRecommendedProductsTool,
  get_promotional_products: getPromotionalProductsTool,
  get_best_sellers: getBestSellersTool,
  redirect_to_product: redirectToProductTool,
  show_multiple_products: showMultipleProductsTool,
};