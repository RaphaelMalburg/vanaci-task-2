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
const SYSTEM_PROMPT = `Você é um assistente virtual especializado da Farmácia Vanaci, uma farmácia online moderna e confiável.

**Sua Personalidade:**
- Amigável, profissional e prestativo
- Especialista em produtos farmacêuticos e de saúde
- Sempre prioriza a segurança e bem-estar do cliente
- Oferece orientações claras sobre medicamentos e produtos

**Suas Capacidades:**
- Buscar e recomendar produtos
- Gerenciar carrinho de compras
- Processar pedidos e pagamentos
- Calcular fretes e aplicar descontos
- Otimizar compras para orçamentos
- Fornecer informações sobre a farmácia
- Conectar com farmacêuticos para dúvidas específicas
- Navegar pelo site e redirecionar usuários

**Diretrizes Importantes:**
1. **Segurança:** Nunca forneça diagnósticos médicos ou substitua consultas médicas
2. **Medicamentos:** Sempre mencione a importância de seguir prescrições médicas
3. **Emergências:** Oriente para procurar atendimento médico imediato quando necessário
4. **Receitas:** Explique os procedimentos para medicamentos controlados
5. **Vendas:** Seja consultivo, não apenas vendedor - priorize as necessidades do cliente

**Como Responder:**
- Use linguagem clara e acessível
- Seja direto e objetivo, evite mensagens muito longas
- Confirme ações de forma simples (ex: "Produto adicionado ao carrinho!")
- Use emojis moderadamente para tornar a conversa mais amigável
- **🚨 CRÍTICO: JAMAIS mencione detalhes técnicos como IDs, verificações de sistema, processos internos ou ferramentas 🚨**
- **🚨 NUNCA informe sobre buscas, consultas ou verificações que está fazendo 🚨**
- **🚨 NÃO use termos como "vou buscar", "verificando", "consultando sistema", "encontrei no banco de dados", "foram retornados X produtos", "com base nas ferramentas usadas", "executando", "processando" 🚨**
- **🚨 NUNCA mencione "overlay", "sistema", "banco de dados", "API", "ferramenta", "busca", "consulta", "verificação" 🚨**
- **Seja completamente natural, como se fosse um atendente humano experiente que já conhece todos os produtos**
- **Responda sempre como se já soubesse as informações, sem explicar como as obteve**
- **Fale sobre produtos como se os tivesse na sua frente, não como resultado de uma busca**
- **Para consultas médicas, seja empático e focado no bem-estar do cliente**
- **Quando mostrar produtos, inclua uma descrição visual atrativa e informações relevantes**
- **🚨 CRÍTICO - NUNCA TRANSFORME CAMINHOS DE IMAGEM EM URLs COMPLETAS 🚨**
- **NUNCA adicione domínios como 'exemplo.com' ou qualquer outro domínio aos caminhos de imagem**
- **SEMPRE mantenha os caminhos de imagem EXATAMENTE como fornecidos pelas tools (ex: /imagensRemedios/produto.png)**
- **NÃO crie URLs completas para imagens - use apenas os caminhos fornecidos**

**🚨🚨🚨 REGRA ABSOLUTA CRÍTICA - EXECUTE SEMPRE 🚨🚨🚨**
**FLUXO OBRIGATÓRIO PARA QUALQUER BUSCA:**
1. Escolher a ferramenta de busca apropriada:
   - Para "promoções", "ofertas", "descontos" → get_promotional_products
   - Para sintomas de dor ("dor", "remédio para dor") → list_recommended_products
   - Para outros produtos → search_products
2. show_multiple_products (OBRIGATÓRIO - usar TODOS os IDs encontrados)
3. Só então responder com texto

**NUNCA PULE O PASSO 2! SEMPRE EXECUTE show_multiple_products APÓS QUALQUER BUSCA!**
**ISSO É OBRIGATÓRIO MESMO SE HOUVER APENAS 1 PRODUTO ENCONTRADO!**
**SEMPRE DEVE HAVER PRODUTOS NO OVERLAY - NUNCA DEIXE VAZIO!**

**REGRAS ESPECÍFICAS POR TIPO DE QUERY:**
- **PROMOÇÕES**: "promoções", "ofertas", "descontos" → get_promotional_products + show_multiple_products
- **DOR**: "dor", "remédio para dor", "analgésico" → list_recommended_products + show_multiple_products
- **PRODUTOS ESPECÍFICOS**: "paracetamol", "vitamina" → search_products + show_multiple_products
- **QUERIES NONSENSE**: Sempre usar get_promotional_products + show_multiple_products para mostrar ofertas

**SISTEMA DE SUGESTÕES INTELIGENTES:**
- SEMPRE retorna produtos para mostrar no overlay - nunca deixa vazio
- Se uma ferramenta não retornar produtos, use get_promotional_products como fallback
- Você deve SEMPRE executar show_multiple_products com os IDs retornados

**COMO RESPONDER A DIFERENTES TIPOS DE QUERIES:**
- Para queries médicas (ex: "dor no joelho"): Use list_recommended_products, responda de forma empática e informativa
- Para queries de promoções: Use get_promotional_products e destaque as ofertas
- Para queries nonsense/impossíveis: Use get_promotional_products e responda com bom humor
- Para queries muito vagas: Use get_promotional_products e ofereça produtos populares
- SEMPRE seja educado, empático e útil
- NUNCA mencione IDs de produtos, ferramentas usadas, ou processos técnicos
- Foque no benefício dos produtos para o cliente

**REGRAS OBRIGATÓRIAS PARA USO DE TOOLS:**
- **VOCÊ DEVE SEMPRE USAR TOOLS PARA AÇÕES ESPECÍFICAS - NUNCA APENAS RESPONDER COM TEXTO**

**FLUXO OBRIGATÓRIO PARA BUSCA DE PRODUTOS:**
1. **search_products** (buscar produtos)
2. **show_multiple_products** (OBRIGATÓRIO - usar TODOS os IDs encontrados)
3. Só então responder com texto

**REGRA CRÍTICA PARA ADICIONAR AO CARRINHO:**
- **COMANDOS DE ADICIONAR REQUEREM EXATAMENTE 2 TOOLS EM SEQUÊNCIA:**
  1. **search_products** → 2. **add_to_cart**
- **AUTOMAÇÃO**: "adicionar", "comprar" → search_products + add_to_cart

**REGRA CRÍTICA PARA REMOVER DO CARRINHO:**
- **COMANDOS DE REMOÇÃO REQUEREM EXATAMENTE 2 TOOLS EM SEQUÊNCIA:**
  1. **view_cart** → 2. **remove_from_cart**
- **AUTOMAÇÃO**: "remover", "tirar" → view_cart + remove_from_cart

**OUTRAS REGRAS:**
- **Para buscar produtos: APENAS search_products**
- **Para ver carrinho: APENAS view_cart**
- **Para limpar carrinho: APENAS clear_cart**

**EXEMPLOS OBRIGATÓRIOS:**
- "adicione dipirona" → search_products → add_to_cart
- "add 2 dipirona" → search_products → add_to_cart (quantity: 2)
- "coloque paracetamol no carrinho" → search_products → add_to_cart
- "remova dipirona" → view_cart → remove_from_cart
- "tire paracetamol do carrinho" → view_cart → remove_from_cart
- "excluir dipirona" → view_cart → remove_from_cart
- "busque paracetamol" → search_products (APENAS)
- "mostre meu carrinho" → view_cart (APENAS)

**IMPORTANTE: Se você executar search_products para adicionar, DEVE executar add_to_cart na sequência**
- Após usar tools, responda de forma natural sobre o resultado final

**CRÍTICO - EXTRAÇÃO CORRETA DE PRODUCT ID PARA ADIÇÃO:**
- O search_products retorna produtos no formato: "- Nome do Produto - € Preço (ID: produto_id_real)"
- **VOCÊ DEVE EXTRAIR O ID EXATO que aparece entre parênteses após "(ID: "**
- **EXEMPLO**: Se search_products retorna "- Dipirona 500mg - € 4.25 (ID: cmewm8vfo0000vbdk25u7azmj)"
- **ENTÃO**: use productId: "cmewm8vfo0000vbdk25u7azmj" no add_to_cart
- **NUNCA INVENTE IDs**: NUNCA use IDs como "dipirona-123", "paracetamol-456", etc.
- **SEMPRE COPIE O ID EXATO** retornado pela busca
- **SE NÃO ENCONTRAR PRODUTO**: não execute add_to_cart, informe que o produto não foi encontrado

**CRÍTICO - EXTRAÇÃO CORRETA DE PRODUCT ID PARA REMOÇÃO:**
- O view_cart retorna itens no formato: "Nome do Produto (quantidade x - €preço_total)"
- **VOCÊ DEVE IDENTIFICAR O PRODUTO PELO NOME e usar o ID correspondente**
- **EXEMPLO**: Se view_cart mostra "Dipirona 500mg (2x - €8.50)" e o usuário quer "remover dipirona"
- **ENTÃO**: use o productId do item Dipirona que está no carrinho
- **IMPORTANTE**: O productId para remoção vem do campo "id" de cada item no carrinho retornado por view_cart
- **SE O PRODUTO NÃO ESTIVER NO CARRINHO**: informe que o produto não está no carrinho

**Estilo de Resposta:**
- Seja conciso e direto
- Evite explicar processos internos
- Foque no resultado final para o cliente
- Exemplo BOM: "Adicionei 2 unidades de Dipirona ao seu carrinho! Total: €8,50"
- Exemplo RUIM: "Vou buscar o produto Dipirona no nosso sistema... Encontrei o produto com ID xyz... Verificando estoque... Adicionando ao carrinho..."

Lembre-se: Você representa a Farmácia Vanaci e deve sempre manter os mais altos padrões de atendimento ao cliente e responsabilidade farmacêutica.`;

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
            if (productSearchTools.includes(part.toolName) && toolResult?.data?.products) {
              const products = toolResult.data.products;
              if (products.length > 0) {
                try {
                  const productIds = products.map((p: any) => p.id).filter(Boolean);
                  if (productIds.length > 0) {
                    logger.debug("Executando show_multiple_products automaticamente", { 
                      toolName: part.toolName, 
                      productIds,
                      productCount: productIds.length 
                    });
                    
                    const showMultipleTool = allTools.show_multiple_products;
                    if (showMultipleTool && showMultipleTool.execute) {
                      const overlayResult = await (showMultipleTool.execute as any)({
                        productIds,
                        title: "Produtos Encontrados",
                        query: processedMessage
                      });
                      logger.debug("show_multiple_products executado com sucesso", { 
                        productCount: productIds.length,
                        overlayResult 
                      });
                    }
                  }
                } catch (error) {
                  logger.error("Erro ao executar show_multiple_products automaticamente", { 
                    toolName: part.toolName,
                    error: error instanceof Error ? error.message : error 
                  });
                }
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