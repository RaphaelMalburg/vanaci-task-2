import { tool } from 'ai';
import { z } from 'zod';
import type { Product, BudgetOptimization, CartItem } from '../types';

// Função auxiliar para fazer chamadas à API
async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Usar URL absoluta para funcionar no contexto do servidor
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
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

// Tool: Sugerir produtos dentro do orçamento
export const suggestProductsWithinBudgetTool = tool({
  description: 'Sugere produtos que cabem dentro de um orçamento específico',
  inputSchema: z.object({
    budgetAmount: z.number().min(0).describe('Valor máximo do orçamento em euros'),
    category: z.string().optional().describe('Categoria específica (opcional)'),
    symptomOrNeed: z.string().optional().describe('Sintoma ou necessidade específica (opcional)'),
    limit: z.number().min(1).max(20).default(10).describe('Número máximo de sugestões'),
  }),
  execute: async ({ budgetAmount, category, symptomOrNeed, limit }: {
    budgetAmount: number;
    category?: string;
    symptomOrNeed?: string;
    limit: number;
  }) => {
    // Buscar todos os produtos
    let products: Product[] = await apiCall('/products?limit=1000');
    
    // Filtrar por orçamento
    products = products.filter(product => product.price <= budgetAmount);
    
    // Filtrar por categoria se especificada
    if (category) {
      products = products.filter(product => 
        product.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Filtrar por sintoma/necessidade se especificado
    if (symptomOrNeed) {
      const searchTerm = symptomOrNeed.toLowerCase();
      products = products.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const descMatch = product.description.toLowerCase().includes(searchTerm);
        const symptomsMatch = product.symptoms?.some(symptom => 
          symptom.toLowerCase().includes(searchTerm)
        );
        const needsMatch = product.needs?.some(need => 
          need.toLowerCase().includes(searchTerm)
        );
        
        return nameMatch || descMatch || symptomsMatch || needsMatch;
      });
    }
    
    // Ordenar por melhor custo-benefício (menor preço primeiro)
    products.sort((a, b) => a.price - b.price);
    
    // Limitar resultados
    const suggestions = products.slice(0, limit);
    
    if (suggestions.length === 0) {
      let message = `Nenhum produto encontrado dentro do orçamento de R$ ${budgetAmount.toFixed(2)}`;
      if (category) message += ` na categoria "${category}"`;
      if (symptomOrNeed) message += ` para "${symptomOrNeed}"`;
      message += '.'
      
      return {
        products: [],
        budgetAmount,
        category,
        symptomOrNeed,
        message,
      };
    }
    
    const productsList = suggestions
      .map(product => `- ${product.name} - R$ ${product.price.toFixed(2)} (ID: ${product.id})`)
      .join('\n');
    
    let message = `Produtos dentro do orçamento de R$ ${budgetAmount.toFixed(2)}:`;
    if (category) message += ` (categoria: ${category})`;
    if (symptomOrNeed) message += ` (para: ${symptomOrNeed})`;
    message += `\n\n${productsList}`;
    
    return {
      products: suggestions,
      budgetAmount,
      category,
      symptomOrNeed,
      message,
    };
  },
});

// Tool: Otimizar carrinho para orçamento
export const optimizeCartForBudgetTool = tool({
  description: 'Otimiza o carrinho atual para caber dentro de um orçamento específico',
  inputSchema: z.object({
    budgetAmount: z.number().min(0).describe('Valor máximo do orçamento em reais'),
    prioritizeEssentials: z.boolean().default(true).describe('Priorizar itens essenciais (medicamentos)'),
  }),
  execute: async ({ budgetAmount, prioritizeEssentials }: {
    budgetAmount: number;
    prioritizeEssentials: boolean;
  }) => {
    // Obter carrinho atual
    const cartData = await apiCall('/cart');
    
    if (cartData.items.length === 0) {
      return {
        originalTotal: 0,
        optimizedTotal: 0,
        removedItems: [],
        suggestions: [],
        message: 'Carrinho vazio. Adicione produtos antes de otimizar para orçamento.',
      };
    }
    
    if (cartData.total <= budgetAmount) {
      return {
        originalTotal: cartData.total,
        optimizedTotal: cartData.total,
        removedItems: [],
        suggestions: [],
        message: `Seu carrinho já está dentro do orçamento! Total: R$ ${cartData.total.toFixed(2)} (orçamento: R$ ${budgetAmount.toFixed(2)})`,
      };
    }
    
    // Classificar itens por prioridade
    const items = [...cartData.items];
    
    if (prioritizeEssentials) {
      // Priorizar medicamentos e itens essenciais
      items.sort((a, b) => {
        const aIsEssential = a.name.toLowerCase().includes('medicamento') || 
                            a.name.toLowerCase().includes('remédio') ||
                            a.name.toLowerCase().includes('vitamina');
        const bIsEssential = b.name.toLowerCase().includes('medicamento') || 
                            b.name.toLowerCase().includes('remédio') ||
                            b.name.toLowerCase().includes('vitamina');
        
        if (aIsEssential && !bIsEssential) return -1;
        if (!aIsEssential && bIsEssential) return 1;
        
        // Se ambos são essenciais ou não essenciais, ordenar por preço
        return a.price - b.price;
      });
    } else {
      // Ordenar apenas por preço (menor primeiro)
      items.sort((a, b) => a.price - b.price);
    }
    
    // Selecionar itens que cabem no orçamento
    const optimizedItems: CartItem[] = [];
    const removedItems: CartItem[] = [];
    let currentTotal = 0;
    
    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      
      if (currentTotal + itemTotal <= budgetAmount) {
        optimizedItems.push(item);
        currentTotal += itemTotal;
      } else {
        // Tentar adicionar com quantidade reduzida
        const remainingBudget = budgetAmount - currentTotal;
        const maxQuantity = Math.floor(remainingBudget / item.price);
        
        if (maxQuantity > 0) {
          optimizedItems.push({
            ...item,
            quantity: maxQuantity,
          });
          
          if (maxQuantity < item.quantity) {
            removedItems.push({
              ...item,
              quantity: item.quantity - maxQuantity,
            });
          }
          
          currentTotal += item.price * maxQuantity;
        } else {
          removedItems.push(item);
        }
      }
    }
    
    // Buscar sugestões de produtos alternativos mais baratos
    const suggestions: Product[] = [];
    if (removedItems.length > 0) {
      try {
        const allProducts: Product[] = await apiCall('/products?limit=1000');
        const remainingBudget = budgetAmount - currentTotal;
        
        const affordableProducts = allProducts
          .filter(product => product.price <= remainingBudget)
          .sort((a, b) => a.price - b.price)
          .slice(0, 5);
        
        suggestions.push(...affordableProducts);
      } catch {
        // Ignorar erro ao buscar sugestões
      }
    }
    
    let message = `Carrinho otimizado para orçamento de R$ ${budgetAmount.toFixed(2)}:\n\n`;
    message += `Total original: R$ ${cartData.total.toFixed(2)}\n`;
    message += `Total otimizado: R$ ${currentTotal.toFixed(2)}\n`;
    message += `Economia: R$ ${(cartData.total - currentTotal).toFixed(2)}\n\n`;
    
    if (removedItems.length > 0) {
      message += `Itens removidos/reduzidos:\n`;
      message += removedItems
        .map(item => `- ${item.name} (${item.quantity}x)`)
        .join('\n');
      message += '\n\n';
    }
    
    if (suggestions.length > 0) {
      message += `Sugestões de produtos alternativos:\n`;
      message += suggestions
        .map(product => `- ${product.name} - € ${product.price.toFixed(2)}`)
        .join('\n');
    }
    
    return {
      originalTotal: cartData.total,
      optimizedTotal: currentTotal,
      removedItems,
      suggestions,
      message,
    };
  },
});

// Tool: Comparar preços
export const comparePricesTool = tool({
  description: 'Compara preços de produtos similares para encontrar a melhor opção',
  inputSchema: z.object({
    productName: z.string().describe('Nome ou termo do produto para comparar'),
    maxResults: z.number().min(1).max(10).default(5).describe('Número máximo de produtos para comparar'),
  }),
  execute: async ({ productName, maxResults }: {
    productName: string;
    maxResults: number;
  }) => {
    try {
      const products: Product[] = await apiCall('/products?limit=1000');
      
      // Buscar produtos similares pelo nome
      const similarProducts = products.filter(p => {
        const searchTerm = productName.toLowerCase();
        return (
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
        );
      });

      if (similarProducts.length === 0) {
        throw new Error(`Não encontrei produtos similares a "${productName}".`);
      }

      // Ordenar por preço (menor para maior)
      similarProducts.sort((a, b) => a.price - b.price);
      
      // Limitar resultados
      const results = similarProducts.slice(0, maxResults);
      
      // Calcular estatísticas de preço
      const prices = results.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      const message = `Comparação de preços para "${productName}":\n\n` +
        `📊 **Estatísticas:**\n` +
        `• Menor preço: € ${minPrice.toFixed(2)}\n` +
        `• Maior preço: € ${maxPrice.toFixed(2)}\n` +
        `• Preço médio: € ${avgPrice.toFixed(2)}\n\n` +
        `💰 **Produtos encontrados (${results.length}):**`;

      return {
        products: results,
        productName,
        priceStats: {
          min: minPrice,
          max: maxPrice,
          average: avgPrice,
          count: results.length,
        },
        message,
      };
    } catch (error) {
      throw new Error(`Erro ao comparar preços de produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Comparar preços de produto específico
export const compareProductPricesTool = tool({
  description: 'Compara preços de um produto específico com produtos similares',
  inputSchema: z.object({
    productId: z.string().describe('ID do produto para comparar'),
    maxPrice: z.number().optional().describe('Preço máximo para filtrar alternativas'),
  }),
  execute: async ({ productId, maxPrice }: {
    productId: string;
    maxPrice?: number;
  }) => {
    // Buscar produto específico
    const product: Product = await apiCall(`/products/${productId}`);
    
    if (!product) {
      return {
        originalProduct: null,
        similarProducts: [],
        maxPrice,
        comparison: null,
        message: `Produto com ID ${productId} não encontrado.`,
      };
    }
    
    // Buscar produtos similares
    const allProducts: Product[] = await apiCall('/products?limit=1000');
    
    const similarProducts = allProducts
      .filter(p => {
        // Filtrar produtos da mesma categoria
        const sameCategory = p.category === product.category;
        // Filtrar produtos diferentes do original
        const differentProduct = p.id !== product.id;
        // Filtrar por preço máximo se especificado
        const withinPrice = maxPrice ? p.price <= maxPrice : true;
        
        return sameCategory && differentProduct && withinPrice;
      })
      .sort((a, b) => a.price - b.price) // Ordenar por preço
      .slice(0, 10); // Limitar a 10 resultados
    
    if (similarProducts.length === 0) {
      return {
        originalProduct: product,
        similarProducts: [],
        maxPrice,
        comparison: null,
        message: `Nenhum produto similar encontrado${maxPrice ? ` abaixo de € ${maxPrice.toFixed(2)}` : ''}.`,
      };
    }
    
    return {
      originalProduct: product,
      similarProducts,
      maxPrice,
      comparison: {
        originalPrice: product.price,
        cheapestAlternative: similarProducts[0],
        potentialSavings: product.price - similarProducts[0].price,
      },
      message: `Encontrados ${similarProducts.length} produtos similares. Economia potencial: € ${(product.price - similarProducts[0].price).toFixed(2)}.`,
    };
  },
});

// Exportar todas as tools de orçamento
export const budgetTools = {
  suggest_within_budget: suggestProductsWithinBudgetTool,
  optimize_cart_for_budget: optimizeCartForBudgetTool,
  compare_prices: comparePricesTool,
  compare_product_prices: compareProductPricesTool,
};