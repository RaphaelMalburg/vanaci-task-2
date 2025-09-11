import { tool } from "ai";
import { z } from "zod";
import { ProductService } from "@/lib/services/product.service";
import { logger } from "@/lib/logger";

import type { ToolResult, Product, Category, SearchResult } from "../types";

// Tool: Buscar produtos com sugestões inteligentes
export const searchProductsTool = tool({
  description:
    "Busca produtos por nome, descrição ou categoria. Se não encontrar resultados, automaticamente sugere produtos promocionais como alternativa ou produtos que tenham a ver com a busca.",
  inputSchema: z.object({
    query: z.string().describe("Termo de busca para encontrar produtos"),
    category: z.string().optional().describe("Filtrar por categoria específica"),
    limit: z.number().min(1).max(50).default(15).describe("Número máximo de resultados"),
  }),
  execute: async ({ query, category, limit }: { query: string; category?: string; limit: number }) => {
    logger.info("Buscando produtos", { query, category, limit });

    try {
      const productService = ProductService.getInstance();

      // Primeira tentativa: busca direta
      let products = await productService.getAllProducts({
        search: query,
        category,
        limit,
      });

      logger.info("Produtos encontrados na busca direta", { count: products.length });

      // Se encontrou produtos, retorna normalmente
      if (products.length > 0) {
        const productsList = products
          .map((product) => {
            return `- ${product.name} - €${product.price.toFixed(2)}`;
          })
          .join("\n");

        return {
          success: true,
          message: `${products.length} produtos encontrados:\n${productsList}`,
          data: { products, total: products.length, query },
        };
      }

      // Se não encontrou produtos, mostrar produtos promocionais como sugestão
      logger.info("Nenhum produto encontrado, buscando produtos promocionais", { query });

      const promotionalProducts = await getPromotionalProductsForFallback(productService, 15);

      if (promotionalProducts.length > 0) {
        const productsList = promotionalProducts
          .map((product: any) => {
            return `- ${product.name} - €${product.price.toFixed(2)}`;
          })
          .join("\n");

        return {
          success: true,
          message: `Produto não encontrado. Veja estas promoções:\n\n${productsList}`,
          data: { products: promotionalProducts, total: promotionalProducts.length, query, fallbackType: "promotional" },
        };
      }

      // Fallback final - se nada funcionou
      return {
        success: true,
        message: `Produto não encontrado. Contacte os nossos farmacêuticos para orientações.`,
        data: { products: [], total: 0, query, fallbackType: "none" },
      };
    } catch (error) {
      logger.error("Erro ao buscar produtos", { query, error: error instanceof Error ? error.message : error });
      throw new Error(`Erro ao buscar produtos: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  },
});

// Função auxiliar para buscar produtos promocionais como fallback
async function getPromotionalProductsForFallback(productService: any, limit: number) {
  try {
    // Buscar produtos com preços mais baixos (simulando promoções)
    const allProducts = await productService.getAllProducts({ limit: 200 });

    // Ordenar por preço e pegar os mais baratos
    const cheapestProducts = allProducts.sort((a: any, b: any) => a.price - b.price).slice(0, limit);

    return cheapestProducts;
  } catch (error) {
    logger.error("Erro ao buscar produtos promocionais para fallback", { error });
    return [];
  }
}

// Tool: Obter detalhes do produto
export const getProductDetailsTool = tool({
  description: "Obtém informações detalhadas de um produto específico",
  inputSchema: z.object({
    productId: z.string().describe("ID do produto"),
  }),
  execute: async ({ productId }: { productId: string }) => {
    logger.info("Buscando detalhes do produto", { productId });

    try {
      const productService = ProductService.getInstance();
      const product = await productService.getProductById(productId);

      if (!product) {
        logger.warn("Produto não encontrado", { productId });
        return {
          success: false,
          message: `Produto com ID ${productId} não encontrado.`,
        };
      }

      logger.info("Detalhes do produto obtidos", { productId, name: product.name });

      return {
        success: true,
        message: `Produto: ${product.name}\nPreço: €${product.price.toFixed(2)}\nDescrição: ${product.description || "Sem descrição"}\nCategoria: ${
          product.category || "Sem categoria"
        }`,
        data: product,
      };
    } catch (error) {
      logger.error("Erro ao buscar detalhes do produto", { productId, error: error instanceof Error ? error.message : error });
      return {
        success: false,
        message: `Produto não encontrado ou erro ao buscar detalhes: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      };
    }
  },
});

// Tool: Listar categorias
export const listCategoriesTool = tool({
  description: "Lista todas as categorias de produtos disponíveis",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    logger.info("Listando categorias de produtos");

    try {
      const productService = ProductService.getInstance();
      const products = await productService.getAllProducts({ limit: 1000 });

      // Extrair categorias únicas dos produtos
      const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

      logger.info("Categorias encontradas", { count: categories.length });

      if (categories.length === 0) {
        return {
          success: true,
          message: "Nenhuma categoria encontrada.",
          data: { categories: [] },
        };
      }

      const categoriesList = categories.map((category) => `- ${category}`).join("\n");

      return {
        success: true,
        message: `Categorias disponíveis:\n${categoriesList}`,
        data: { categories },
      };
    } catch (error) {
      logger.error("Erro ao listar categorias", { error: error instanceof Error ? error.message : error });
      throw new Error(`Erro ao listar categorias: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  },
});

// Tool: Recomendar produtos por sintoma ou necessidade
export const listRecommendedProductsTool = tool({
  description: "Recomenda produtos baseado em sintomas ou necessidades específicas",
  inputSchema: z.object({
      symptomOrNeed: z.string().describe('Sintoma ou necessidade do usuário (ex: "dor de cabeça", "vitaminas", "gripe")'),
      limit: z.number().min(1).max(20).default(15).describe("Número máximo de recomendações"),
    }),
  execute: async ({ symptomOrNeed, limit }: { symptomOrNeed: string; limit: number }) => {
    logger.info("🔍 [list_recommended_products] Iniciando busca", { symptomOrNeed, limit });

    try {
      const productService = ProductService.getInstance();
      logger.info("✅ [list_recommended_products] ProductService obtido", { serviceExists: !!productService });

      // Mapear sintomas/necessidades para termos de busca mais específicos
      const searchTerms = getSearchTermsForSymptom(symptomOrNeed.toLowerCase());
      logger.info("🔍 [list_recommended_products] Termos de busca mapeados", { searchTerms });

      let allProducts: any[] = [];

      // Buscar por cada termo
      for (const term of searchTerms) {
        try {
          logger.info("🔍 [list_recommended_products] Buscando por termo", { term });
          const products = await productService.getAllProducts({ search: term, limit: limit * 2 });
          logger.info("📦 [list_recommended_products] Produtos encontrados para termo", { term, count: products?.length || 0 });
          allProducts.push(...(products || []));
        } catch (termError) {
          logger.warn("⚠️ [list_recommended_products] Erro ao buscar termo específico", { term, error: termError });
        }
      }

      // Remover duplicatas e limitar resultados
      const uniqueProducts = allProducts.filter((product, index, self) => index === self.findIndex((p) => p.id === product.id)).slice(0, limit);
      logger.info("📊 [list_recommended_products] Produtos únicos após filtro", { count: uniqueProducts.length, originalCount: allProducts.length });

      // Se não encontrou produtos, buscar produtos promocionais como fallback
      if (uniqueProducts.length === 0) {
        logger.info("🔄 [list_recommended_products] Nenhum produto encontrado, buscando fallback promocional");
        try {
          const promotionalProducts = await getPromotionalProductsForFallback(productService, limit);
          logger.info("🎯 [list_recommended_products] Produtos promocionais como fallback", { count: promotionalProducts?.length || 0 });
          
          if (promotionalProducts && promotionalProducts.length > 0) {
            return {
              success: true,
              message: `Não encontrei produtos específicos para "${symptomOrNeed}", mas aqui estão algumas opções que podem ajudar. Consulte sempre um profissional de saúde.`,
              data: { 
                products: promotionalProducts, 
                symptomOrNeed,
                showInOverlay: true,
                isFallback: true
              },
            };
          }
        } catch (fallbackError) {
          logger.error("❌ [list_recommended_products] Erro no fallback promocional", { error: fallbackError });
        }
        
        return {
          success: true,
          message: `Nenhum produto encontrado para "${symptomOrNeed}". Consulte um farmacêutico para orientações.`,
          data: { products: [], symptomOrNeed },
        };
      }

      logger.info("✅ [list_recommended_products] Retornando produtos encontrados", { count: uniqueProducts.length });
      
      // Retornar resposta concisa - os produtos serão mostrados no overlay
      return {
        success: true,
        message: `Encontrei ${uniqueProducts.length} produtos recomendados para "${symptomOrNeed}". Consulte sempre um profissional de saúde antes de usar medicamentos.`,
        data: { 
          products: uniqueProducts, 
          symptomOrNeed,
          showInOverlay: true // Flag para indicar que deve mostrar no overlay
        },
      };
    } catch (error) {
      logger.error("❌ [list_recommended_products] Erro crítico na execução", { 
        symptomOrNeed, 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Tentar fallback promocional mesmo em caso de erro crítico
      try {
        logger.info("🔄 [list_recommended_products] Tentando fallback após erro crítico");
        const productService = ProductService.getInstance();
        const promotionalProducts = await getPromotionalProductsForFallback(productService, Math.min(limit, 5));
        
        if (promotionalProducts && promotionalProducts.length > 0) {
          logger.info("✅ [list_recommended_products] Fallback bem-sucedido após erro", { count: promotionalProducts.length });
          return {
            success: true,
            message: `Houve um problema na busca, mas aqui estão algumas opções que podem ajudar. Consulte um farmacêutico para orientações sobre "${symptomOrNeed}".`,
            data: { 
              products: promotionalProducts, 
              symptomOrNeed,
              showInOverlay: true,
              isFallback: true,
              hasError: true
            },
          };
        }
      } catch (fallbackError) {
        logger.error("❌ [list_recommended_products] Fallback também falhou", { fallbackError });
      }
      
      // Último recurso: retornar erro estruturado
      return {
        success: false,
        message: `Não foi possível buscar produtos para "${symptomOrNeed}" no momento. Tente novamente ou consulte um farmacêutico.`,
        data: { products: [], symptomOrNeed, error: true },
      };
    }
  },
});

// Função auxiliar para mapear sintomas para termos de busca
function getSearchTermsForSymptom(symptom: string): string[] {
  const symptomMap: Record<string, string[]> = {
    // Dores e analgésicos
    dor: ["dor", "analgésico", "paracetamol", "ibuprofeno", "aspirina", "brufen", "ben-u-ron"],
    "dor de cabeça": ["dor", "analgésico", "paracetamol", "ibuprofeno", "aspirina", "enxaqueca", "cefaleia"],
    "dor de dentes": ["dor", "analgésico", "paracetamol", "ibuprofeno", "dental", "odontalgia"],
    "dor muscular": ["dor", "analgésico", "ibuprofeno", "voltaren", "muscular", "mialgia", "anti-inflamatório"],
    "dor nas costas": ["dor", "analgésico", "ibuprofeno", "voltaren", "costas", "lombar", "coluna"],
    "dor no joelho": ["dor", "analgésico", "ibuprofeno", "voltaren", "joelho", "articular", "articulação"],
    "dor articular": ["dor", "analgésico", "ibuprofeno", "voltaren", "articular", "articulação", "artrite"],
    "dor menstrual": ["dor", "analgésico", "ibuprofeno", "paracetamol", "menstrual", "cólica", "período"],
    "dor de garganta": ["dor", "garganta", "strepsils", "tantum", "faringite", "amigdalite"],
    enxaqueca: ["enxaqueca", "dor", "cabeça", "paracetamol", "ibuprofeno", "cefaleia"],
    cólica: ["cólica", "dor", "menstrual", "ibuprofeno", "paracetamol", "antiespasmódico"],

    // Gripes, constipações e respiratório
    gripe: ["gripe", "constipação", "ben-u-gripe", "griponal", "influenza", "viral"],
    constipação: ["gripe", "constipação", "ben-u-gripe", "griponal", "nasal", "congestionamento"],
    tosse: ["tosse", "gripe", "antigrippine", "expectorante", "antitússico", "bronquite"],
    febre: ["febre", "paracetamol", "ibuprofeno", "dor", "antipirético", "temperatura"],
    "nariz entupido": ["nasal", "descongestionante", "rinite", "sinusite", "constipação"],
    sinusite: ["sinusite", "nasal", "descongestionante", "dor", "facial"],
    rinite: ["rinite", "alérgica", "nasal", "anti-histamínico", "espirros"],
    asma: ["asma", "broncodilatador", "inalador", "respiratório", "bronquite"],

    // Digestivo e gastrointestinal
    enjoo: ["enjoo", "vomidrine", "digestivo", "náusea", "antiemético"],
    náusea: ["enjoo", "vomidrine", "digestivo", "náusea", "antiemético"],
    diarreia: ["diarreia", "imodium", "digestivo", "intestinal", "antidiarreico"],
    obstipação: ["obstipação", "laevolac", "dulcolax", "laxante", "intestinal"],
    "prisão de ventre": ["obstipação", "laevolac", "dulcolax", "laxante", "intestinal"],
    azia: ["azia", "antiácido", "estômago", "digestivo", "refluxo", "gastrite"],
    gastrite: ["gastrite", "estômago", "antiácido", "digestivo", "azia"],
    "má digestão": ["digestivo", "enzimas", "estômago", "digestão", "dispepsia"],
    "dor de estômago": ["estômago", "dor", "gastrite", "antiácido", "digestivo"],

    // Pele e dermatologia
    acne: ["acne", "borbulhas", "pasta", "sérum", "dermatológico", "espinhas"],
    borbulhas: ["acne", "borbulhas", "pasta", "sérum", "dermatológico", "espinhas"],
    "pele oleosa": ["oleosa", "acne", "gel", "sérum", "dermatológico", "seborreia"],
    eczema: ["eczema", "dermatite", "pele", "hidratante", "anti-inflamatório"],
    psoríase: ["psoríase", "dermatológico", "pele", "descamação", "hidratante"],
    "pele seca": ["hidratante", "pele", "seca", "creme", "loção"],
    queimadura: ["queimadura", "pele", "cicatrizante", "regenerador", "aloe"],
    "protetor solar": ["protetor", "solar", "FPS", "UV", "bronzeador"],

    // Alergias e anti-histamínicos
    alergia: ["alergia", "anti-histamínico", "antialérgico", "urticária", "prurido"],
    "reação alérgica": ["alergia", "anti-histamínico", "antialérgico", "urticária"],
    urticária: ["urticária", "alergia", "anti-histamínico", "prurido", "comichão"],
    comichão: ["comichão", "prurido", "anti-histamínico", "alergia", "dermatite"],

    // Vitaminas e suplementos
    vitamina: ["vitamina", "suplemento", "multivitamínico", "complexo", "nutricional"],
    "vitamina C": ["vitamina", "C", "imunidade", "antioxidante", "ácido ascórbico"],
    "vitamina D": ["vitamina", "D", "ossos", "cálcio", "imunidade"],
    "complexo B": ["vitamina", "B", "complexo", "energia", "nervoso"],
    ferro: ["ferro", "anemia", "suplemento", "hemoglobina", "cansaço"],
    cálcio: ["cálcio", "ossos", "vitamina D", "suplemento", "osteoporose"],
    magnésio: ["magnésio", "suplemento", "muscular", "cãibras", "relaxante"],
    ómega: ["ómega", "3", "cardiovascular", "suplemento", "colesterol"],

    // Saúde feminina
    "saúde feminina": ["feminina", "ginecológico", "íntimo", "menstrual", "hormonal"],
    candidíase: ["candidíase", "antifúngico", "íntimo", "vaginal", "fungos"],
    cistite: ["cistite", "urinário", "bexiga", "antibiótico", "cranberry"],
    menopausa: ["menopausa", "hormonal", "afrontamentos", "estrogénio", "climatério"],

    // Saúde masculina
    "saúde masculina": ["masculina", "próstata", "urológico", "andrológico"],
    próstata: ["próstata", "urológico", "masculina", "hiperplasia", "PSA"],

    // Sono e ansiedade
    insónia: ["insónia", "sono", "melatonina", "sedativo", "relaxante"],
    ansiedade: ["ansiedade", "calmante", "relaxante", "stress", "nervosismo"],
    stress: ["stress", "ansiedade", "calmante", "relaxante", "adaptogénico"],

    // Circulação e cardiovascular
    circulação: ["circulação", "cardiovascular", "varizes", "pernas", "venoso"],
    varizes: ["varizes", "circulação", "pernas", "venoso", "varicoso"],
    colesterol: ["colesterol", "cardiovascular", "ómega", "estatina", "lipídios"],
    "pressão arterial": ["pressão", "arterial", "hipertensão", "cardiovascular"],

    // Diabetes e metabólico
    diabetes: ["diabetes", "glicemia", "açúcar", "insulina", "metabólico"],
    "açúcar no sangue": ["glicemia", "diabetes", "açúcar", "glucose", "metabólico"],

    // Oftalmologia
    "olhos secos": ["olhos", "lágrimas", "oftálmico", "lubrificante", "seco"],
    conjuntivite: ["conjuntivite", "olhos", "oftálmico", "vermelhidão", "inflamação"],

    // Higiene e cuidados
    higiene: ["higiene", "limpeza", "desinfetante", "antisséptico", "cuidados"],
    "higiene oral": ["oral", "dentes", "pasta", "elixir", "dental"],
    "cuidados bebé": ["bebé", "infantil", "pediatria", "criança", "pediátrico"],

    // Promoções e ofertas
    promoção: ["promoção", "desconto", "oferta", "barato", "económico"],
    promoções: ["promoção", "desconto", "oferta", "barato", "económico"],
    desconto: ["promoção", "desconto", "oferta", "barato", "económico"],
    ofertas: ["promoção", "desconto", "oferta", "barato", "económico"],
    barato: ["barato", "económico", "promoção", "desconto", "oferta"],
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
  description: "Lista os produtos mais vendidos da farmácia",
  inputSchema: z.object({
    limit: z.number().min(1).max(20).default(15).describe("Número máximo de produtos"),
  }),
  execute: async ({ limit }) => {
    logger.info("Buscando produtos mais vendidos", { limit });

    try {
      const productService = ProductService.getInstance();
      const allProducts = await productService.getAllProducts({ limit: 100 });

      // Lista hardcoded de produtos mais vendidos (IDs ou nomes)
      const bestSellerNames = ["Dipirona", "Paracetamol", "Ibuprofeno", "Vitamina C", "Vitamina D", "Álcool", "Termômetro", "Protetor Solar", "Hidratante", "Soro Fisiológico"];

      // Filtrar produtos que correspondem aos mais vendidos
      const bestSellers = allProducts.filter((product) => bestSellerNames.some((name) => product.name.toLowerCase().includes(name.toLowerCase()))).slice(0, limit);

      // Se não encontrar produtos suficientes, pegar os primeiros produtos disponíveis
      if (bestSellers.length < limit) {
        const remainingProducts = allProducts.filter((product) => !bestSellers.find((bs) => bs.id === product.id)).slice(0, limit - bestSellers.length);
        bestSellers.push(...remainingProducts);
      }

      logger.info("Produtos mais vendidos encontrados", { count: bestSellers.length });

      if (bestSellers.length === 0) {
        return {
          success: true,
          message: "Erro ao carregar produtos. Tente novamente.",
          data: { products: [] },
        };
      }

      const productsList = bestSellers.map((product, index) => `${index + 1}. ${product.name} - €${product.price.toFixed(2)} (ID: ${product.id})`).join("\n");

      return {
        success: true,
        message: `${bestSellers.length} produtos mais vendidos:\n\n${productsList}`,
        data: { products: bestSellers },
      };
    } catch (error) {
      logger.error("Erro ao buscar produtos mais vendidos", { error: error instanceof Error ? error.message : error });
      throw new Error(`Erro ao buscar mais vendidos: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  },
});

// Tool: Produtos em promoção
export const getPromotionalProductsTool = tool({
  description: "Lista produtos em promoção ou com desconto",
  inputSchema: z.object({
    limit: z.number().min(1).max(20).default(15).describe("Número máximo de produtos promocionais"),
    category: z.string().optional().describe("Categoria específica para promoções"),
  }),
  execute: async ({ limit, category }: { limit: number; category?: string }) => {
    logger.info("Buscando produtos promocionais", { limit, category });

    try {
      const productService = ProductService.getInstance();

      // Buscar produtos por categoria se especificada
      const searchOptions: any = { limit: limit * 3 };
      if (category) {
        searchOptions.category = category;
      }

      const products = await productService.getAllProducts(searchOptions);

      // Simular promoções com produtos reais, priorizando certas categorias
      const promotionalProducts = products
        .filter((product) => {
          // Priorizar certas categorias para promoções
          const promotionCategories = ["Analgésicos", "Vitaminas", "Cuidados de Pele", "Digestivo"];
          return !category || promotionCategories.includes(product.category || "");
        })
        .sort(() => Math.random() - 0.5) // Embaralhar
        .slice(0, limit)
        .map((product) => {
          // Diferentes tipos de desconto baseados na categoria
          let discountPercent = 15; // Desconto padrão

          if (product.category === "Analgésicos") discountPercent = 20;
          if (product.category === "Vitaminas") discountPercent = 25;
          if (product.category === "Cuidados de Pele") discountPercent = 30;

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

      logger.info("Produtos promocionais encontrados", { count: promotionalProducts.length });

      if (promotionalProducts.length === 0) {
        return {
          success: false,
          message: `Nenhuma promoção${category ? ` em ${category}` : ""} disponível no momento.`,
          data: {
            products: [],
            total: 0,
            category,
          },
        };
      }

      const productsList = promotionalProducts
        .map((product) => {
          const categoryInfo = product.category ? ` [${product.category}]` : "";
          return `🏷️ ${product.name}${categoryInfo} - €${product.price} (antes €${product.originalPrice}) - ${product.discount}% OFF (Poupa €${product.savings})`;
        })
        .join("\n");

      const totalSavings = promotionalProducts.reduce((sum, p) => sum + p.savings, 0);

      return {
        success: true,
        message: `${promotionalProducts.length} promoções${category ? ` em ${category}` : ""}:\n\n${productsList}`,
        data: {
          products: promotionalProducts,
          total: promotionalProducts.length,
          category,
        },
      };
    } catch (error) {
      logger.error("Erro ao buscar produtos promocionais", { error: error instanceof Error ? error.message : error });
      throw new Error(`Erro ao buscar produtos promocionais: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  },
});

// Exportar todas as tools de produtos
// Tool: Redirecionar para página do produto
export const redirectToProductTool = tool({
  description: "Redireciona o usuário para a página específica de um produto",
  inputSchema: z.object({
    productId: z.string().describe("ID do produto para redirecionamento"),
    productName: z.string().describe("Nome do produto mencionado"),
  }),
  execute: async ({ productId, productName }: { productId: string; productName: string }) => {
    logger.info("Redirecionando para produto", { productId, productName });

    try {
      const productService = ProductService.getInstance();
      const product = await productService.getProductById(productId);

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
          product,
        },
      };
    } catch (error) {
      logger.error("Erro ao redirecionar para produto", { error, productId, productName });
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
  description: "Exibe múltiplos produtos específicos no overlay de produtos",
  inputSchema: z.object({
    productIds: z.array(z.string()).min(1).max(15).describe("Lista de IDs dos produtos para exibir"),
    title: z.string().optional().describe("Título personalizado para o overlay"),
    query: z.string().optional().describe("Query de busca relacionada"),
  }),
  execute: async ({ productIds, title, query }: { productIds: string[]; title?: string; query?: string }) => {
    logger.info("Exibindo múltiplos produtos no overlay", { productIds, title, query });

    try {
      const productService = ProductService.getInstance();
      const products = [];

      // Buscar cada produto por ID
      for (const productId of productIds) {
        try {
          const product = await productService.getProductById(productId);
          if (product) {
            products.push(product);
          } else {
            logger.warn("Produto não encontrado", { productId });
          }
        } catch (error) {
          logger.warn("Erro ao buscar produto", { productId, error });
        }
      }

      if (products.length === 0) {
        return {
          success: false,
          message: "Nenhum dos produtos especificados foi encontrado.",
          data: { productIds, products: [] },
        };
      }

      const foundCount = products.length;
      const totalCount = productIds.length;
      const displayTitle = title || `Produtos Selecionados (${foundCount}/${totalCount})`;

      logger.info("Produtos encontrados para overlay", { foundCount, totalCount });

      const productsList = products.map((product) => `• ${product.name} - €${product.price.toFixed(2)}`).join("\n");

      return {
        success: true,
        message: `📦 Exibindo ${foundCount} produto(s) no overlay:\n\n${productsList}`,
        data: {
          products,
          title: displayTitle,
          query,
          showInOverlay: true,
          productIds,
        },
      };
    } catch (error) {
      logger.error("Erro ao exibir múltiplos produtos", { productIds, error: error instanceof Error ? error.message : error });
      throw new Error(`Erro ao exibir produtos: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
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
