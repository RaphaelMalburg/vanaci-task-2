import { generateText, streamText, ModelMessage, stepCountIs } from "ai";
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
import type { AgentMessage, AgentSession } from "@/lib/types";

// In-memory cache for session context to reduce database calls
const sessionCache = new Map<string, AgentSession>();
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
const SYSTEM_PROMPT = `INSTRUÇÃO CRÍTICA: Você DEVE SEMPRE fornecer uma resposta textual após executar qualquer tool. NUNCA termine uma conversa apenas com tool calls.

Você é o assistente virtual da Farmácia Vanaci. Seja amigável, profissional e direto.

**REGRAS ESSENCIAIS:**
- Respostas CONCISAS e OBJETIVAS
- NUNCA mencione processos técnicos, IDs, sistemas ou ferramentas
- Fale naturalmente como um farmacêutico experiente
- Para medicamentos: sempre mencione consultar profissionais de saúde
- Use emojis moderadamente

**FLUXO OBRIGATÓRIO PARA BUSCAS:**
1. Para medicamentos específicos (ex: dipirona, paracetamol, ibuprofeno) → use search_products
2. Para sintomas ou necessidades gerais (ex: dor de cabeça, gripe) → use list_recommended_products
3. Para promoções/ofertas/descontos → use get_promotional_products
4. Para outros produtos → use search_products
5. **OBRIGATÓRIO**: SEMPRE que usar search_products, list_recommended_products, get_promotional_products ou get_best_sellers, você DEVE imediatamente usar show_multiple_products com os IDs dos produtos encontrados. Isso é ESSENCIAL para que os produtos apareçam no overlay.
6. Responda de forma natural e concisa, destacando nome, dosagem, preço e descrição breve em cada item

**EXEMPLO DE FLUXO CORRETO:**
- Usuário: "preciso de paracetamol"
- Você: search_products(query: "paracetamol") → show_multiple_products(productIds: ["id1", "id2", "id3"]) → RESPOSTA TEXTUAL: "Encontrei 3 opções de paracetamol para você:"
- Usuário: "dor de cabeça"
- Você: list_recommended_products(symptomOrNeed: "dor de cabeça") → show_multiple_products(productIds: ["id1", "id2", "id3"]) → RESPOSTA TEXTUAL: "Para dor de cabeça, recomendo:"

**IMPORTANTE**: Após usar qualquer tool, você DEVE SEMPRE gerar uma resposta textual amigável. NUNCA termine a conversa apenas com tool calls - sempre forneça uma resposta em texto natural para o usuário.

**FLUXO OBRIGATÓRIO PARA CARRINHO:**
1. Quando usuário quer adicionar produto (qualquer linguagem: "adicionar", "quero", "comprar", "add mais", etc.):
   a) **PRIMEIRO**: SEMPRE use search_products para encontrar TODOS os produtos mencionados pelo usuário
      - Se usuário mencionar múltiplos produtos (ex: "2 benuron e 2 álcool gel"), faça uma busca separada para CADA produto
      - Exemplo: search_products("benuron") E search_products("álcool gel")
   b) **SEGUNDO**: use view_cart para verificar conteúdo atual
   c) **TERCEIRO**: Para cada produto encontrado:
      - Se produto JÁ EXISTE no carrinho → use increment_cart
      - Se produto NÃO EXISTE no carrinho → use add_to_cart
   d) **QUARTO**: SEMPRE complete o processo para TODOS os produtos solicitados antes de gerar resposta final
2. Para remover: view_cart → remove_from_cart
3. Para ver carrinho: view_cart
4. Para limpar: clear_cart

**IMPORTANTE:**
- **NUNCA use add_to_cart ou increment_cart sem PRIMEIRO usar search_products para obter os IDs dos produtos**
- **SEMPRE use os IDs EXATOS retornados no campo 'data.products[].id' dos resultados de search_products**
- **NUNCA invente, modifique ou crie IDs de produtos - use APENAS os IDs retornados pela busca**
- SEMPRE busque TODOS os produtos mencionados antes de tentar adicioná-los ao carrinho
- SEMPRE verifique se o produto já existe antes de decidir add_to_cart vs increment_cart
- A decisão não depende da linguagem do usuário, mas sim do conteúdo atual do carrinho
- Se não encontrar um produto na busca, informe ao usuário que o produto não está disponível
- **NUNCA pare o processo no meio - complete TODOS os produtos solicitados**

**ESTILO DE RESPOSTA:**
- Use frases diretas: ex. "Encontrei 2 opções de Dipirona para você:"
- Formate a lista no overlay com bullets, incluindo dosagem e preço: ex. "• Dipirona 500 mg (com 10 comprimidos) – €4,95"
- Confirme ações de carrinho: ex. "✅ Dipirona 500 mg adicionada ao seu carrinho."
- Foque no cliente, não no processo

Sempre priorize o bem-estar do cliente e mantenha padrões farmacêuticos.

**REGRA CRÍTICA DE RESPOSTA:**
- SEMPRE termine suas interações com uma resposta textual clara e amigável
- NUNCA deixe o usuário sem resposta após executar tools
- Mesmo após adicionar produtos ao carrinho, confirme a ação com texto
- Se executar múltiplas tools, resuma o que foi feito em uma resposta final`;

// Classe do Agente AI
export class PharmacyAIAgent {
  private llmConfig: ConfigLLMConfig;
  private sessionService: SessionService;

  constructor(llmConfig?: ConfigLLMConfig) {
    this.llmConfig = llmConfig || {
      provider: (process.env.DEFAULT_LLM_PROVIDER as ConfigLLMConfig["provider"]) || "openrouter",
      temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "2000"),
    };
    validateLLMConfig(this.llmConfig.provider);
    this.sessionService = SessionService.getInstance();
  }

  // Criar ou obter sessão
  private async getSession(sessionId: string): Promise<AgentSession> {
    // Check in-memory cache first
    if (sessionCache.has(sessionId)) {
      return sessionCache.get(sessionId)!;
    }
    try {
      const session = await this.sessionService.getSession(sessionId);
      if (!session) {
        logger.debug("Sessão não encontrada, criando nova", { sessionId });
        const newSession = await this.sessionService.createSession(sessionId);
        sessionCache.set(sessionId, newSession);
        return newSession;
      }
      sessionCache.set(sessionId, session);
      return session;
    } catch (error) {
      logger.debug("Erro ao obter sessão, criando nova", { sessionId });
      const newSession = await this.sessionService.createSession(sessionId);
      sessionCache.set(sessionId, newSession);
      return newSession;
    }
  }

  // Converter mensagens para formato ModelMessage
  private convertMessages(messages: AgentMessage[]): ModelMessage[] {
    return messages
      .filter((msg) => {
        // Filtrar mensagens válidas
        return msg.content && 
               typeof msg.content === 'string' && 
               msg.content.trim() !== '' && 
               !msg.toolCalls &&
               ['system', 'user', 'assistant'].includes(msg.role);
      })
      .map((msg) => {
        if (msg.role === 'system') {
          return {
            role: 'system',
            content: msg.content,
          };
        } else if (msg.role === 'user') {
          return {
            role: 'user',
            content: msg.content,
          };
        } else if (msg.role === 'assistant') {
          return {
            role: 'assistant',
            content: msg.content,
          };
        }
        // Fallback para casos não esperados
        return {
          role: 'user',
          content: msg.content,
        };
      });
  }

  /**
   * Gera uma resposta fallback dinâmica baseada no contexto
   */
  private generateDynamicFallback(userMessage: string, currentMessages: ModelMessage[]): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Extrair informações de produtos das mensagens anteriores
    const productMentions = currentMessages
      .filter(msg => msg.content && typeof msg.content === 'string')
      .map(msg => msg.content as string)
      .join(' ')
      .toLowerCase();
    
    // Respostas baseadas em sintomas/necessidades
    if (lowerMessage.includes('dor') && (lowerMessage.includes('cabeça') || lowerMessage.includes('cabeca'))) {
      return "Para dor de cabeça, temos várias opções eficazes disponíveis. Recomendo consultar nosso farmacêutico para a melhor escolha baseada no seu caso específico.";
    }
    
    if (lowerMessage.includes('dor') && lowerMessage.includes('barriga')) {
      return "Para desconforto abdominal, temos produtos que podem ajudar. É importante identificar a causa - recomendo falar com nosso farmacêutico para orientação adequada.";
    }
    
    if (lowerMessage.includes('gripe') || lowerMessage.includes('resfriado')) {
      return "Para sintomas de gripe e resfriado, temos uma linha completa de produtos. Posso ajudar você a encontrar o mais adequado para seus sintomas específicos.";
    }
    
    // Respostas baseadas em medicamentos específicos
    if (lowerMessage.includes('paracetamol')) {
      return "Temos diferentes apresentações de paracetamol disponíveis. Cada uma tem suas características específicas - posso ajudar você a escolher a mais adequada.";
    }
    
    if (lowerMessage.includes('dipirona')) {
      return "A dipirona é um analgésico muito eficaz. Temos várias opções disponíveis com diferentes dosagens e apresentações.";
    }
    
    if (lowerMessage.includes('ibuprofeno')) {
      return "O ibuprofeno é excelente para dor e inflamação. Temos diferentes marcas e dosagens disponíveis em nossa farmácia.";
    }
    
    // Respostas para carrinho
    if (lowerMessage.includes('carrinho') || lowerMessage.includes('comprar')) {
      return "Posso ajudar você com seu carrinho de compras. Me diga qual produto gostaria de adicionar ou se precisa ver o que já está selecionado.";
    }
    
    // Resposta genérica mais variada
    const genericResponses = [
      "Estou aqui para ajudar você a encontrar os produtos que precisa. Pode me contar mais sobre o que está procurando?",
      "Nossa farmácia tem uma ampla variedade de produtos. Como posso ajudar você hoje?",
      "Posso ajudar você a encontrar medicamentos e produtos de saúde. Qual é sua necessidade específica?",
      "Estou à disposição para orientar sobre nossos produtos. Me conte o que você está buscando."
    ];
    
    // Usar timestamp para variar a resposta
    const responseIndex = Math.floor(Date.now() / 10000) % genericResponses.length;
    return genericResponses[responseIndex];
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

      // Incrementar quantidade no carrinho
      /\b(adicionar?|add)\s+(mais|more)\s+\d+\b/,
      /\b(mais|more)\s+\d+\s+.+/,
      /\bincrement(ar)?\b/,

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
      const convertedMessages = this.convertMessages(session.messages);
      console.log('🔍 Converted messages:', JSON.stringify(convertedMessages, null, 2));
      
      let currentMessages: ModelMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...convertedMessages,
      ];
      
      console.log('🔍 Current messages structure:', JSON.stringify(currentMessages.map(m => ({ role: m.role, contentType: typeof m.content })), null, 2));

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
      let finalResponseText = "";
      let maxIterations = 5; // Limite para evitar loops infinitos
      let iteration = 0;

      while (iteration < maxIterations) {
        iteration++;
        console.log(`🔄 Iteração ${iteration}/${maxIterations}`);

        let result;
        try {
          // Filtrar mensagens válidas para o modelo
          const validMessages = currentMessages.filter(msg => {
            return msg.role && 
                   msg.content && 
                   typeof msg.content === 'string' && 
                   msg.content.trim() !== '' &&
                   ['system', 'user', 'assistant'].includes(msg.role);
          });
          
          console.log(`🔍 Valid messages for generateText (iteration ${iteration}):`, validMessages.length);
          
          result = await generateText({
            model: llmModel,
            messages: validMessages,
            tools: allTools,
            temperature: this.llmConfig.temperature || 0.7,
          });

          console.log('🔍 Resultado do generateText:', {
            hasText: !!result.text,
            textLength: result.text ? result.text.length : 0,
            hasToolCalls: !!result.toolCalls,
            toolCallsCount: result.toolCalls ? result.toolCalls.length : 0
          });
        } catch (error) {
          console.error(`❌ Erro no generateText (iteração ${iteration}):`, error);
          finalResponseText = "Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes ou entre em contato conosco pelo telefone (11) 1234-5678.";
          break;
        }



        // Se temos texto, usar como resposta final
        if (result.text && result.text.trim()) {
          finalResponseText = result.text;
          console.log('✅ Resposta textual encontrada:', JSON.stringify(finalResponseText));
        }

        // Processar tool calls se existirem
        if (result.toolCalls && result.toolCalls.length > 0) {
          console.log('🔧 Tool calls detectados:', result.toolCalls.map(tc => ({ name: tc.toolName, id: tc.toolCallId })));
          
          // Adicionar mensagem do assistente com tool calls
          if (result.text || (result.toolCalls && result.toolCalls.length > 0)) {
            const assistantContent = [];
            if (result.text) {
              assistantContent.push({ type: 'text', text: result.text });
            }
            if (result.toolCalls) {
              result.toolCalls.forEach(toolCall => {
                console.log('🔍 ToolCall structure:', {
                  "type": "tool-call",
                  "toolCallId": toolCall.toolCallId,
                  "toolName": toolCall.toolName,
                  "input": (toolCall as any).args || {}
                });
                
                assistantContent.push({
                  type: 'tool-call',
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  input: (toolCall as any).args || {}
                });
              });
            }
            
            // Converter assistantContent para string simples
            let contentString = '';
            if (result.text) {
              contentString = result.text;
            }
            if (result.toolCalls && result.toolCalls.length > 0) {
              const toolCallsInfo = result.toolCalls.map(tc => `[Tool: ${tc.toolName}]`).join(' ');
              contentString = contentString ? `${contentString} ${toolCallsInfo}` : toolCallsInfo;
            }
            
            currentMessages.push({
              role: 'assistant',
              content: contentString || '[Tool calls executed]'
            } as ModelMessage);
          }

          // Executar cada tool call
          for (const toolCall of result.toolCalls) {
            console.log(`🔧 Executando tool: ${toolCall.toolName}`);
            console.log(`🔍 ToolCall structure:`, JSON.stringify(toolCall, null, 2));

            try {
              const tool = allTools[toolCall.toolName as keyof typeof allTools];
              if (!tool || !tool.execute) {
                throw new Error(`Tool ${toolCall.toolName} não encontrada ou não executável`);
              }
              const toolArgs = (toolCall as any).input || (toolCall as any).args || (toolCall as any).parameters;
              console.log(`🔍 Tool args:`, JSON.stringify(toolArgs, null, 2));
              const toolResult = await (tool.execute as any)(toolArgs);
              console.log(`✅ Tool ${toolCall.toolName} executada com sucesso`);
              console.log(`🔍 Tool result:`, JSON.stringify(toolResult, null, 2));

              // Adicionar resultado da tool às mensagens
             // Converter tool result para string simples
             const toolResultString = `Tool ${toolCall.toolName} result: ${JSON.stringify(toolResult)}`;
             currentMessages.push({
                role: 'assistant',
                content: toolResultString
              } as ModelMessage);

              // Adicionar resultado da tool à sessão
              session.messages.push({
                role: "assistant",
                content: `Tool ${toolCall.toolName}: ${JSON.stringify(toolResult)}`,
                timestamp: new Date(),
              } as AgentMessage);
              
              console.log(`🔍 Current messages after tool result:`, currentMessages.length);
              console.log(`🔍 Last message:`, JSON.stringify(currentMessages[currentMessages.length - 1], null, 2));

            } catch (error) {
              console.error(`❌ Erro ao executar tool ${toolCall.toolName}:`, error);
              
              // Adicionar erro da tool às mensagens
               // Converter tool error para string simples
               const toolErrorString = `Tool ${toolCall.toolName} error: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
               currentMessages.push({
                 role: 'assistant',
                 content: toolErrorString
               } as ModelMessage);

              // Adicionar erro da tool à sessão
              session.messages.push({
                role: "assistant",
                content: `Tool ${toolCall.toolName} Error: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
                timestamp: new Date(),
              } as AgentMessage);
            }
          }
          
          // Continue the loop to allow the AI agent to make more tool calls if needed
          console.log('🔄 Tool calls executed, continuing to next iteration...');
          
          // Don't break here - let the AI agent decide if it needs more tools
        } else {
          // Se não há tool calls, o AI agent terminou naturalmente
          console.log('🏁 Nenhuma tool call detectada, AI agent terminou naturalmente');
          
          // Se já temos uma resposta de texto do AI agent, usar ela
          if (result.text && result.text.trim()) {
            finalResponseText = result.text;
            console.log('📝 Usando resposta de texto do AI agent:', finalResponseText);
          } else {
            // Fallback: forçar uma resposta textual final
            console.log('⚠️ AI agent não forneceu resposta de texto, forçando resposta final...');
            
            // Adicionar mensagem especial para forçar resposta textual
            currentMessages.push({
              role: "user",
              content: "Agora forneça uma resposta textual amigável ao usuário baseada nas ações que você executou. NÃO use mais tools."
            });

            const finalResult = await generateText({
              model: llmModel,
              messages: currentMessages,
              temperature: 0.7,
            });

            finalResponseText = finalResult.text;
            console.log('📝 Resposta final forçada gerada:', finalResponseText);
          }
          
          break;
        }
      }



      // Adicionar resposta do assistente
      const assistantMsg: AgentMessage = {
        role: "assistant",
        content: finalResponseText,
        timestamp: new Date(),
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
      return finalResponseText;
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
      const messages: ModelMessage[] = [{ role: "system", content: SYSTEM_PROMPT }, ...this.convertMessages(session.messages)];
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
        toolChoice: "auto", // Always use "auto" to allow text generation after tools
      });

      // Processar tool calls do resultado com suporte a múltiplas execuções
      let executionCount = 0;
      const maxExecutions = 3; // Limite para evitar loops infinitos
      const productSearchTools = ["search_products", "get_promotional_products", "list_recommended_products", "get_best_sellers"];

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

            // Armazenar tool result para processamento posterior no streaming
            logger.debug("Armazenando resultado da tool", {
              toolName: part.toolName,
              hasResult: !!toolResult,
              hasData: !!toolResult?.data,
              hasProducts: !!toolResult?.data?.products,
              productCount: toolResult?.data?.products?.length || 0,
            });

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

  // Gerar resposta apenas textual sem tools
  async generateTextOnlyResponse(sessionId: string, userMessage: string, context?: { cartId?: string; userId?: string; user?: any; currentPage?: string }): Promise<string> {
    try {
      logger.info("Gerando resposta apenas textual", { sessionId, messageLength: userMessage.length });

      const session = await this.getSession(sessionId);

      // Preparar mensagens para o LLM
      const convertedMessages = this.convertMessages(session.messages);
      const currentMessages: ModelMessage[] = [
        { 
          role: "system", 
          content: `Você é o assistente virtual da Farmácia Vanaci. Baseado no contexto da conversa anterior, forneça uma resposta textual amigável e concisa. 
          
          IMPORTANTE: 
          - NÃO use nenhuma ferramenta/tool
          - Apenas responda com texto natural
          - Seja amigável e confirme as ações já realizadas
          - Mantenha o tom profissional de farmácia` 
        },
        ...convertedMessages,
        { role: "user", content: userMessage }
      ];

      // Gerar resposta SEM tools
      const llmModel = await createLLMModelWithFallback(this.llmConfig);
      
      const result = await generateText({
        model: llmModel,
        messages: currentMessages,
        // NÃO incluir tools para forçar apenas resposta textual
        temperature: this.llmConfig.temperature || 0.7,
      });

      if (result.text && result.text.trim()) {
        logger.info("Resposta textual gerada com sucesso", { responseLength: result.text.length });
        return result.text.trim();
      } else {
        throw new Error("Nenhuma resposta textual foi gerada");
      }
    } catch (error) {
      logger.error("Erro ao gerar resposta textual", { sessionId, error });
      return "Perfeito! As ações foram realizadas com sucesso. Verifique os itens adicionados acima.";
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
      sessionCache.delete(sessionId);
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
