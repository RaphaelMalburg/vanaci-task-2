import { generateText, streamText, CoreMessage, stepCountIs } from "ai";
import { setGlobalContext, updateGlobalContext } from "./context";
import { createLLMModel, createLLMModelWithFallback, validateLLMConfig, LLMConfig as ConfigLLMConfig } from "./config";
import { conditionalRewriteMessage } from "./message-rewriter";
import { cartTools } from "./actions/cart";
import { productTools } from "./actions/products";
import { checkoutTools } from "./actions/checkout";
import { navigationTools } from "./actions/navigation";
import { budgetTools } from "./actions/budget";
import { extraTools } from "./actions/extras";
import { logger } from "@/lib/logger";
import { SessionService } from "@/lib/services/session.service";
import type { AgentMessage, AgentSession } from "./types";
import type { LLMConfig } from "./config";

// Combinar todas as tools
export const allTools = {
  ...cartTools,
  ...productTools,
  ...checkoutTools,
  ...navigationTools,
  ...budgetTools,
  ...extraTools,
};

// Sistema de prompt para o agente
const SYSTEM_PROMPT = `Você é um assistente virtual da Farmácia Vanaci. Seja amigável, profissional e direto.

**REGRAS ESSENCIAIS:**
- Respostas CONCISAS e OBJETIVAS
- NUNCA mencione processos técnicos, IDs, sistemas ou ferramentas
- Fale naturalmente como um farmacêutico experiente
- Para medicamentos: sempre mencione consultar profissionais de saúde
- Use emojis moderadamente

**FLUXO OBRIGATÓRIO PARA BUSCAS:**
1. Escolha a tool apropriada:
   - Promoções/ofertas/descontos → get_promotional_products
   - Dor/sintomas → list_recommended_products  
   - Outros produtos → search_products
2. SEMPRE execute show_multiple_products com TODOS os IDs encontrados
3. Responda de forma natural e concisa

**REGRAS DE CARRINHO:**
- Adicionar: search_products → add_to_cart
- Remover: view_cart → remove_from_cart
- Ver carrinho: view_cart
- Limpar: clear_cart

**ESTILO DE RESPOSTA:**
- Seja direto: "Encontrei 8 produtos para dor no joelho" (não "vou buscar...")
- Confirme ações: "Produto adicionado!" (não "executando adição...")
- Foque no cliente, não no processo

Sempre priorize o bem-estar do cliente e mantenha os padrões farmacêuticos.`;

// Classe do Agente AI
export class PharmacyAIAgent {
  private llmConfig: ConfigLLMConfig;
  private sessionService: SessionService;

  constructor(llmConfig?: ConfigLLMConfig) {
    this.llmConfig = llmConfig || {
      provider: (process.env.DEFAULT_LLM_PROVIDER as ConfigLLMConfig["provider"]) || "openai",
      temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "2000"),
    };
    validateLLMConfig(this.llmConfig.provider);
    this.sessionService = SessionService.getInstance();
  }

  // Criar ou obter sessão
  private async getSession(sessionId: string): Promise<AgentSession> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      if (!session) {
        logger.debug("Sessão não encontrada, criando nova", { sessionId });
        return await this.sessionService.createSession(sessionId);
      }
      return session;
    } catch (error) {
      logger.debug("Erro ao obter sessão, criando nova", { sessionId });
      return await this.sessionService.createSession(sessionId);
    }
  }

  // Converter mensagens para formato CoreMessage
  private convertMessages(messages: AgentMessage[]): CoreMessage[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Detecta se uma mensagem deve obrigatoriamente usar tools
   */
  private shouldForceToolUsage(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();

    // Padrões que SEMPRE devem usar tools
    const toolPatterns = [
      // Carrinho
      /\b(ver|mostrar|visualizar|exibir)\s+(o\s+)?carrinho\b/,
      /\b(meu|o)\s+carrinho\b/,
      /\bcarrinho\b/,
      /\blimpar?\s+carrinho\b/,
      /\besvaziar\s+carrinho\b/,

      // Adicionar produtos
      /\b(adicionar?|add|colocar?)\s+.+\s+(ao\s+)?carrinho\b/,
      /\b(adicionar?|add|colocar?)\s+\d+\s+.+/,
      /\bquero\s+(adicionar?|comprar)\b/,

      // Buscar produtos
      /\b(buscar?|procurar?|encontrar?)\s+.+/,
      /\b(tem|há|existe)\s+.+\?/,
      /\bonde\s+(está|fica)\s+.+\?/,

      // Promoções e ofertas (SEMPRE usar get_promotional_products)
      /\b(promoç[õã]o|promoç[õã]es|oferta|ofertas|desconto|descontos)\b/,
      /\b(em\s+promoç[ãã]o|com\s+desconto|mais\s+barato)\b/,
      /\b(pelas\s+promoç[õã]es|produtos\s+promocionais)\b/,

      // Dor e sintomas (SEMPRE usar list_recommended_products)
      /\b(dor|remédio\s+p\s+dor|remédio\s+para\s+dor|analgésico)\b/,
      /\b(dor\s+de\s+cabeça|dor\s+muscular|dor\s+nas\s+costas)\b/,
      /\b(dor\s+no\s+joelho|dor\s+articular|dor\s+de\s+garganta)\b/,

      // Remover do carrinho
      /\b(remover?|tirar|excluir)\s+.+\s+(do\s+)?carrinho\b/,
      /\b(remover?|tirar|excluir)\s+\d+\s+.+/,

      // Checkout e pagamento
      /\b(finalizar|concluir)\s+(compra|pedido)\b/,
      /\bcheckout\b/,
      /\bpagar\b/,

      // Produtos específicos (nomes comuns)
      /\b(dipirona|paracetamol|ibuprofeno|aspirina|vitamina|termômetro)\b/,

      // Qualquer pergunta ou query (SEMPRE mostrar produtos)
      /\?$/,
      /\b(o\s+que|que\s+tipo|qual|quais)\b/,
    ];

    return toolPatterns.some((pattern) => pattern.test(lowerMessage));
  }

  // Processar mensagem do usuário
  async processMessage(sessionId: string, userMessage: string, context?: { cartId?: string; userId?: string; user?: any; currentPage?: string }): Promise<string> {
    try {
      logger.info("Processando mensagem", { sessionId, messageLength: userMessage.length });

      // Reescrever mensagem se habilitado
      let processedMessage = userMessage;
      if (this.llmConfig.enableMessageRewriter) {
        const rewriteResult = await conditionalRewriteMessage(userMessage, this.llmConfig);
        processedMessage = rewriteResult.message;
        if (rewriteResult.wasRewritten) {
          logger.debug("Mensagem reescrita", { original: userMessage.substring(0, 50), rewritten: processedMessage.substring(0, 50) });
        }
      }

      const session = await this.getSession(sessionId);

      // Atualizar contexto se fornecido
      if (context) {
        await this.sessionService.updateSessionContext(sessionId, { ...session.context, ...context });
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: "user",
        content: processedMessage,
        timestamp: new Date(),
      };
      await this.sessionService.addMessage(sessionId, userMsg, context?.userId);
      session.messages.push(userMsg);

      // Preparar mensagens para o LLM
      const messages: CoreMessage[] = [{ role: "system", content: SYSTEM_PROMPT }, ...this.convertMessages(session.messages)];

      // Gerar resposta com tools (usando fallback)
      const llmModel = await createLLMModelWithFallback(this.llmConfig);

      // Definir sessionId no contexto global para as tools
      setGlobalContext("sessionId", sessionId);
      if (context) {
        if (context.cartId) setGlobalContext("cartId", context.cartId);
        if (context.userId) setGlobalContext("userId", context.userId);
        if (context.currentPage) setGlobalContext("currentPage", context.currentPage);
        // Definir informações do usuário no contexto global
        if (context.user) {
          setGlobalContext("user", context.user);
          logger.debug("Usuário definido no contexto global", { username: context.user.username });
        }
      }

      const result = await generateText({
        model: llmModel,
        messages: messages,
        tools: allTools,
        temperature: this.llmConfig.temperature || 0.7,
        stopWhen: stepCountIs(10), // Permite até 10 steps para múltiplas tool calls em sequência
      });

      const responseText = result.text;
      const toolCalls = result.toolCalls;
      const toolResults = result.toolResults;

      if (toolCalls && toolCalls.length > 0) {
        logger.debug("Tool calls executados", { count: toolCalls.length });
      }

      // Processar tool calls se existirem
      if (result.toolCalls && result.toolCalls.length > 0) {
        logger.debug("Tool calls detectados", { count: result.toolCalls.length });

        for (const toolCall of result.toolCalls) {
          logger.debug("Executando tool", { toolName: toolCall.toolName, toolCallId: toolCall.toolCallId });

          try {
            const tool = allTools[toolCall.toolName as keyof typeof allTools];
            if (!tool || !tool.execute) {
              throw new Error(`Tool ${toolCall.toolName} não encontrada ou não executável`);
            }
            const toolResult = await (tool.execute as any)((toolCall as any).args);
            logger.debug("Tool executado com sucesso", { toolName: toolCall.toolName });

            // Adicionar resultado da tool à sessão
            session.messages.push({
              role: "assistant",
              content: `Tool ${toolCall.toolName}: ${JSON.stringify(toolResult)}`,
              timestamp: new Date(),
            } as AgentMessage);
          } catch (error) {
            logger.error("Erro ao executar tool", {
              toolName: toolCall.toolName,
              error: error instanceof Error ? error.message : "Erro desconhecido",
            });

            // Adicionar erro da tool à sessão
            session.messages.push({
              role: "assistant",
              content: `Tool ${toolCall.toolName} Error: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
              timestamp: new Date(),
            } as AgentMessage);
          }
        }
        logger.debug("Processamento de tool calls concluído", { count: result.toolCalls.length });
      }

      // Adicionar resposta do assistente
      const assistantMsg: AgentMessage = {
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
        toolCalls: toolCalls,
      };
      await this.sessionService.addMessage(sessionId, assistantMsg, context?.userId);
      session.messages.push(assistantMsg);
      console.log("➕ Resposta do assistente adicionada à sessão");

      // Limitar histórico de mensagens (manter últimas 20)
      if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
        console.log("🗂️ Histórico limitado a 20 mensagens");
      }

      console.log("✅ ProcessMessage concluído com sucesso");
      return responseText;
    } catch (error) {
      console.error("❌ Erro ao processar mensagem:", error);
      console.error("❌ Stack trace:", error instanceof Error ? error.stack : "Stack não disponível");
      return "Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes ou entre em contato conosco pelo telefone (11) 1234-5678.";
    }
  }

  // Processar mensagem com streaming
  async streamMessage(sessionId: string, userMessage: string, context?: { cartId?: string; userId?: string; user?: any; currentPage?: string }) {
    // Validação de entrada
    if (!sessionId || typeof sessionId !== "string" || sessionId.trim().length === 0) {
      const error = new Error("SessionId é obrigatório e deve ser uma string não vazia");
      logger.error("Erro de validação no streamMessage:", error);
      throw error;
    }

    if (!userMessage || typeof userMessage !== "string" || userMessage.trim().length === 0) {
      const error = new Error("Mensagem do usuário é obrigatória e deve ser uma string não vazia");
      logger.error("Erro de validação no streamMessage:", error);
      throw error;
    }

    if (userMessage.length > 10000) {
      const error = new Error("Mensagem do usuário muito longa (máximo 10000 caracteres)");
      logger.error("Erro de validação no streamMessage:", error);
      throw error;
    }

    try {
      console.log("🎯 StreamMessage iniciado para sessão:", sessionId);
      console.log("💬 Mensagem original do usuário:", userMessage);
      console.log("🔧 Contexto fornecido:", context);

      // Reescrever mensagem se habilitado
      let processedMessage = userMessage;
      if (this.llmConfig.enableMessageRewriter) {
        const rewriteResult = await conditionalRewriteMessage(userMessage, this.llmConfig);
        processedMessage = rewriteResult.message;
        if (rewriteResult.wasRewritten) {
          logger.debug("Mensagem reescrita", { original: userMessage, rewritten: processedMessage });
        }
      }

      const session = await this.getSession(sessionId);
      logger.debug("Sessão obtida", { sessionId, messageCount: session.messages.length });

      // Atualizar contexto se fornecido
      if (context) {
        await this.sessionService.updateSessionContext(sessionId, { ...session.context, ...context });
        logger.debug("Contexto atualizado", { sessionId, context });
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: "user",
        content: processedMessage,
        timestamp: new Date(),
      };
      await this.sessionService.addMessage(sessionId, userMsg, context?.userId);
      session.messages.push(userMsg);
      logger.debug("Mensagem do usuário adicionada", { sessionId });

      // Preparar mensagens para o LLM
      const messages: CoreMessage[] = [{ role: "system", content: SYSTEM_PROMPT }, ...this.convertMessages(session.messages)];
      logger.debug("Mensagens preparadas para LLM", { count: messages.length });

      // Gerar resposta com streaming (usando fallback)
      const llmModel = await createLLMModelWithFallback(this.llmConfig);
      logger.debug("Modelo LLM criado", { hasModel: !!llmModel, toolCount: Object.keys(allTools).length });

      // Definir sessionId no contexto global para as tools
      setGlobalContext("sessionId", sessionId);
      if (context) {
        if (context.cartId) setGlobalContext("cartId", context.cartId);
        if (context.userId) {
          setGlobalContext("userId", context.userId);
          logger.debug("UserId definido no contexto", { userId: context.userId });
        }
        if (context.user) {
          setGlobalContext("user", context.user);
          logger.debug("User definido no contexto", { user: context.user });
        }
        if (context.currentPage) setGlobalContext("currentPage", context.currentPage);
      }
      logger.debug("Contexto global configurado", { sessionId });

      // Detectar se a mensagem requer tools obrigatoriamente
      const requiresTools = this.shouldForceToolUsage(processedMessage);
      logger.debug("Iniciando processamento", {
        sessionId,
        message: processedMessage,
        requiresTools,
        toolCount: Object.keys(allTools).length,
      });

      const result = streamText({
        model: llmModel,
        messages,
        tools: allTools,
        temperature: this.llmConfig.temperature || 0.7,
        toolChoice: requiresTools ? "required" : "auto",
      });

      // Processar tool calls do resultado com suporte a múltiplas execuções
      let executionCount = 0;
      const maxExecutions = 3; // Limite para evitar loops infinitos
      const productSearchTools = ['search_products', 'get_promotional_products', 'list_recommended_products', 'get_best_sellers'];

      for await (const part of result.fullStream) {
        if (part.type === "tool-call") {
          executionCount++;
          logger.debug("Tool call executada", {
            toolName: part.toolName,
            execution: executionCount,
            toolCallId: part.toolCallId,
            args: (part as any).input,
          });

          try {
            logger.debug("Executando tool", { toolName: part.toolName });
            const tool = allTools[part.toolName as keyof typeof allTools];
            if (!tool || !tool.execute) {
              throw new Error(`Tool ${part.toolName} não encontrada ou não executável`);
            }
            const toolResult = await (tool.execute as any)((part as any).input);
            logger.debug("Tool executada com sucesso", {
              toolName: part.toolName,
              result: toolResult,
            });

            // NÃO adicionar resultado da tool à sessão para evitar vazamento de informações técnicas
            // Apenas fazer log interno para debugging
            
            // Executar show_multiple_products automaticamente após tools de busca
            logger.debug("Verificando se deve executar show_multiple_products", {
              toolName: part.toolName,
              isProductSearchTool: productSearchTools.includes(part.toolName),
              hasToolResult: !!toolResult,
              hasData: !!toolResult?.data,
              hasProducts: !!toolResult?.data?.products,
              productCount: toolResult?.data?.products?.length || 0
            });
            
            if (productSearchTools.includes(part.toolName)) {
              logger.debug("Tool de busca de produtos detectada", { toolName: part.toolName });
              
              if (toolResult?.data?.products && toolResult.data.products.length > 0) {
                const products = toolResult.data.products;
                try {
                  const productIds = products.map((p: any) => p.id).filter(Boolean);
                  logger.debug("Produtos encontrados para overlay", { 
                    toolName: part.toolName, 
                    productIds,
                    productCount: productIds.length,
                    products: products.map((p: any) => ({ id: p.id, name: p.name }))
                  });
                  
                  if (productIds.length > 0) {
                    const showMultipleTool = allTools.show_multiple_products;
                    if (showMultipleTool && showMultipleTool.execute) {
                      logger.debug("Executando show_multiple_products automaticamente", { 
                        productIds,
                        title: "Produtos Encontrados",
                        query: processedMessage
                      });
                      
                      const overlayResult = await (showMultipleTool.execute as any)({
                        productIds,
                        title: "Produtos Encontrados",
                        query: processedMessage
                      });
                      
                      logger.debug("show_multiple_products executado com sucesso", { 
                        productCount: productIds.length,
                        overlayResult 
                      });
                    } else {
                      logger.error("show_multiple_products tool não encontrada ou não executável");
                    }
                  } else {
                    logger.warn("Nenhum ID de produto válido encontrado", { products });
                  }
                } catch (error) {
                  logger.error("Erro ao executar show_multiple_products automaticamente", { 
                    toolName: part.toolName,
                    error: error instanceof Error ? error.message : error,
                    stack: error instanceof Error ? error.stack : undefined
                  });
                }
              } else {
                logger.warn("Tool de busca não retornou produtos", {
                  toolName: part.toolName,
                  toolResult: toolResult?.data
                });
              }
            }

            // Tools serão executadas naturalmente pelo LLM conforme o prompt
          } catch (error) {
            logger.error("Erro na execução da tool", {
              toolName: part.toolName,
              error: error instanceof Error ? error.message : error,
            });

            // NÃO adicionar erro da tool à sessão para evitar vazamento de informações técnicas
            // Apenas fazer log interno
          }
        } else if (part.type === "text-delta") {
          // Log silencioso para text-delta
        } else {
          logger.debug("Stream part processado", { type: part.type });
        }
      }

      logger.debug("Processamento concluído", {
        sessionId,
        totalMessages: session.messages.length,
      });

      return result;
    } catch (error) {
      logger.error("Erro ao processar mensagem com streaming:", {
        sessionId,
        userMessage: userMessage.substring(0, 100) + (userMessage.length > 100 ? "..." : ""),
        context,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
      });

      // Error já logado pelo logger.error acima

      // Re-throw validation errors as-is
      if (error instanceof Error && error.message.includes("validação")) {
        throw error;
      }

      // For other errors, provide a more user-friendly message
      throw new Error("Erro interno ao processar mensagem. Tente novamente.");
    }
  }

  // Obter histórico da sessão
  async getSessionHistory(sessionId: string): Promise<AgentMessage[]> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      return session ? [...session.messages] : [];
    } catch (error) {
      logger.error("Erro ao obter histórico da sessão", { sessionId, error });
      return [];
    }
  }

  // Limpar sessão
  async clearSession(sessionId: string): Promise<void> {
    try {
      await this.sessionService.deleteSession(sessionId);
      logger.info("Sessão limpa com sucesso", { sessionId });
    } catch (error) {
      logger.error("Erro ao limpar sessão", { sessionId, error });
      throw new Error(`Falha ao limpar sessão: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  }

  // Obter contexto da sessão
  async getSessionContext(sessionId: string): Promise<Record<string, any>> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      return session ? { ...session.context } : {};
    } catch (error) {
      logger.error("Erro ao obter contexto da sessão", { sessionId, error });
      return {};
    }
  }

  // Atualizar configuração do LLM
  updateLLMConfig(newConfig: Partial<ConfigLLMConfig>): void {
    this.llmConfig = { ...this.llmConfig, ...newConfig };
    validateLLMConfig(this.llmConfig.provider);
  }

  // Obter configuração atual do LLM
  getLLMConfig(): ConfigLLMConfig {
    return { ...this.llmConfig };
  }
}

// Instância singleton do agente
let agentInstance: PharmacyAIAgent | null = null;

// Função para obter instância do agente
export function getPharmacyAgent(config?: ConfigLLMConfig): PharmacyAIAgent {
  if (!agentInstance) {
    agentInstance = new PharmacyAIAgent(config);
  }
  return agentInstance;
}

// Função utilitária para processar mensagem rapidamente
export async function processUserMessage(
  sessionId: string,
  message: string,
  context?: { cartId?: string; userId?: string; user?: any; currentPage?: string },
  llmConfig?: ConfigLLMConfig
): Promise<string> {
  try {
    // Validar entrada
    if (!sessionId || typeof sessionId !== "string") {
      throw new Error("SessionId é obrigatório e deve ser uma string");
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      throw new Error("Mensagem é obrigatória e não pode estar vazia");
    }

    if (message.length > 10000) {
      throw new Error("Mensagem muito longa (máximo 10.000 caracteres)");
    }

    const agent = getPharmacyAgent(llmConfig);
    return await agent.processMessage(sessionId, message.trim(), context);
  } catch (error) {
    logger.error("Erro na função processUserMessage", { sessionId, messageLength: message?.length, error });

    if (error instanceof Error && error.message.includes("obrigatório")) {
      throw error; // Re-throw validation errors
    }

    return "Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes ou entre em contato conosco pelo telefone (11) 1234-5678.";
  }
}

// Exportar types e tools
export * from "./types";
export * from "./config";
export { cartTools, productTools, checkoutTools, navigationTools, budgetTools, extraTools };