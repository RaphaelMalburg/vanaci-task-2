import { generateText, streamText, CoreMessage, stepCountIs } from 'ai';
import { setGlobalContext, updateGlobalContext } from './context';
import { createLLMModel, createLLMModelWithFallback, validateLLMConfig, LLMConfig as ConfigLLMConfig } from './config';
import { conditionalRewriteMessage } from './message-rewriter';
import { cartTools } from './actions/cart';
import { productTools } from './actions/products';
import { checkoutTools } from './actions/checkout';
import { navigationTools } from './actions/navigation';
import { budgetTools } from './actions/budget';
import { extraTools } from './actions/extras';
import { logger } from '@/lib/logger';
import { SessionService } from '@/lib/services/session.service';
import type { AgentMessage, AgentSession } from './types';
import type { LLMConfig } from './config';

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
- **JAMAIS mencione detalhes técnicos como IDs, verificações de sistema, processos internos ou ferramentas**
- **NUNCA informe sobre buscas, consultas ou verificações que está fazendo**
- **NÃO use termos como "vou buscar", "verificando", "consultando sistema", "encontrei no banco de dados"**
- **Seja completamente natural, como se fosse um atendente humano experiente**
- **Responda sempre como se já soubesse as informações, sem explicar como as obteve**
- **Quando mostrar produtos, inclua uma descrição visual atrativa e informações relevantes**

**REGRAS OBRIGATÓRIAS PARA USO DE TOOLS:**
- **VOCÊ DEVE SEMPRE USAR TOOLS PARA AÇÕES ESPECÍFICAS - NUNCA APENAS RESPONDER COM TEXTO**

**REGRA CRÍTICA PARA ADICIONAR AO CARRINHO:**
- **COMANDOS DE ADICIONAR REQUEREM EXATAMENTE 2 TOOLS EM SEQUÊNCIA - SEM EXCEÇÕES:**
  1. **OBRIGATÓRIO: search_products** (para encontrar o produto)
  2. **OBRIGATÓRIO: add_to_cart** (usando productId + quantity do resultado anterior)
- **VOCÊ DEVE EXECUTAR AMBAS AS TOOLS NO MESMO TURNO - NÃO PARE APÓS A PRIMEIRA**
- **APÓS search_products, IMEDIATAMENTE execute add_to_cart com o productId encontrado**
- **NÃO responda com texto entre as tools - execute ambas em sequência**
- **AUTOMAÇÃO OBRIGATÓRIA**: Quando detectar comandos como "adicionar", "adicione", "comprar", "colocar no carrinho", você DEVE automaticamente executar search_products seguido de add_to_cart

**REGRA CRÍTICA PARA REMOVER DO CARRINHO:**
- **COMANDOS DE REMOÇÃO REQUEREM EXATAMENTE 2 TOOLS EM SEQUÊNCIA - SEM EXCEÇÕES:**
  1. **OBRIGATÓRIO: view_cart** (para ver os produtos no carrinho e seus IDs)
  2. **OBRIGATÓRIO: remove_from_cart** (usando o productId exato do item no carrinho)
- **VOCÊ DEVE EXECUTAR AMBAS AS TOOLS NO MESMO TURNO - NÃO PARE APÓS A PRIMEIRA**
- **APÓS view_cart, IMEDIATAMENTE execute remove_from_cart com o productId encontrado**
- **AUTOMAÇÃO OBRIGATÓRIA**: Quando detectar comandos como "remover", "tirar", "excluir" do carrinho, você DEVE automaticamente executar view_cart seguido de remove_from_cart

**REGRA CRÍTICA PARA REDIRECIONAMENTO AUTOMÁTICO:**
- **QUANDO MENCIONAR MEDICAMENTOS ESPECÍFICOS, VOCÊ DEVE AUTOMATICAMENTE REDIRECIONAR:**
  1. **OBRIGATÓRIO: search_products** (para encontrar o produto mencionado)
  2. **OBRIGATÓRIO: redirect_to_product** (usando productId + productName do resultado anterior)
- **AUTOMAÇÃO OBRIGATÓRIA**: Quando detectar menção de medicamentos específicos como "paracetamol", "dipirona", "ibuprofeno", etc., você DEVE automaticamente executar search_products seguido de redirect_to_product
- **EXEMPLOS DE REDIRECIONAMENTO AUTOMÁTICO:**
  - "estou com dor de cabeça, preciso de paracetamol" → search_products → redirect_to_product
  - "me fale sobre dipirona" → search_products → redirect_to_product
  - "quero saber mais sobre ibuprofeno" → search_products → redirect_to_product
  - "preciso de um remédio para febre" → search_products (buscar antitérmicos) → redirect_to_product (para o primeiro resultado)

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
      provider: (process.env.DEFAULT_LLM_PROVIDER as ConfigLLMConfig['provider']) || 'openai',
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000')
    };
    validateLLMConfig(this.llmConfig.provider);
    this.sessionService = SessionService.getInstance();
  }

  // Criar ou obter sessão
  private async getSession(sessionId: string): Promise<AgentSession> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      if (!session) {
        logger.debug('Sessão não encontrada, criando nova', { sessionId });
        return await this.sessionService.createSession(sessionId);
      }
      return session;
    } catch (error) {
      logger.debug('Erro ao obter sessão, criando nova', { sessionId });
      return await this.sessionService.createSession(sessionId);
    }
  }

  // Converter mensagens para formato CoreMessage
  private convertMessages(messages: AgentMessage[]): CoreMessage[] {
    return messages.map(msg => ({
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
      
      // Remover do carrinho
      /\b(remover?|tirar|excluir)\s+.+\s+(do\s+)?carrinho\b/,
      /\b(remover?|tirar|excluir)\s+\d+\s+.+/,
      
      // Checkout e pagamento
      /\b(finalizar|concluir)\s+(compra|pedido)\b/,
      /\bcheckout\b/,
      /\bpagar\b/,
      
      // Produtos específicos (nomes comuns)
      /\b(dipirona|paracetamol|ibuprofeno|aspirina|vitamina|termômetro)\b/,
    ];
    
    return toolPatterns.some(pattern => pattern.test(lowerMessage));
  }

  // Processar mensagem do usuário
  async processMessage(
    sessionId: string,
    userMessage: string,
    context?: { cartId?: string; userId?: string; user?: any; currentPage?: string }
  ): Promise<string> {
    try {
      logger.info('Processando mensagem', { sessionId, messageLength: userMessage.length });
      
      // Reescrever mensagem se habilitado
      let processedMessage = userMessage;
      if (this.llmConfig.enableMessageRewriter) {
        const rewriteResult = await conditionalRewriteMessage(userMessage, this.llmConfig);
        processedMessage = rewriteResult.message;
        if (rewriteResult.wasRewritten) {
          logger.debug('Mensagem reescrita', { original: userMessage.substring(0, 50), rewritten: processedMessage.substring(0, 50) });
        }
      }
      
      const session = await this.getSession(sessionId);
      
      // Atualizar contexto se fornecido
      if (context) {
        await this.sessionService.updateSessionContext(sessionId, { ...session.context, ...context });
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: 'user',
        content: processedMessage,
        timestamp: new Date(),
      };
      await this.sessionService.addMessage(sessionId, userMsg);
      session.messages.push(userMsg);

      // Preparar mensagens para o LLM
      const messages: CoreMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.convertMessages(session.messages),
      ];

      // Gerar resposta com tools (usando fallback)
      const llmModel = await createLLMModelWithFallback(this.llmConfig);
      
      // Definir sessionId no contexto global para as tools
      setGlobalContext('sessionId', sessionId);
      if (context) {
        if (context.cartId) setGlobalContext('cartId', context.cartId);
        if (context.userId) setGlobalContext('userId', context.userId);
        if (context.currentPage) setGlobalContext('currentPage', context.currentPage);
        // Definir informações do usuário no contexto global
        if (context.user) {
          setGlobalContext('user', context.user);
          logger.debug('Usuário definido no contexto global', { username: context.user.username });
        }
      }
      
      const result = await generateText({
        model: llmModel,
        messages: messages,
        tools: allTools,
        temperature: this.llmConfig.temperature || 0.7,
        stopWhen: stepCountIs(5), // Permite até 5 steps para múltiplas tool calls em sequência
      });
      
      const responseText = result.text;
      const toolCalls = result.toolCalls;
      const toolResults = result.toolResults;

      if (toolCalls && toolCalls.length > 0) {
        logger.debug('Tool calls executados', { count: toolCalls.length });
      }

      // Processar tool calls se existirem
      if (result.toolCalls && result.toolCalls.length > 0) {
        logger.debug('Tool calls detectados', { count: result.toolCalls.length });
        
        for (const toolCall of result.toolCalls) {
          logger.debug('Executando tool', { toolName: toolCall.toolName, toolCallId: toolCall.toolCallId });
          
          try {
            const tool = allTools[toolCall.toolName as keyof typeof allTools];
            if (!tool || !tool.execute) {
              throw new Error(`Tool ${toolCall.toolName} não encontrada ou não executável`);
            }
            const toolResult = await (tool.execute as any)((toolCall as any).args);
            logger.debug('Tool executado com sucesso', { toolName: toolCall.toolName });
            
            // Adicionar resultado da tool à sessão
            session.messages.push({
              role: 'assistant',
              content: `Tool ${toolCall.toolName}: ${JSON.stringify(toolResult)}`,
              timestamp: new Date(),
            } as AgentMessage);
          } catch (error) {
            logger.error('Erro ao executar tool', { 
              toolName: toolCall.toolName, 
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
            
            // Adicionar erro da tool à sessão
            session.messages.push({
              role: 'assistant',
              content: `Tool ${toolCall.toolName} Error: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
              timestamp: new Date(),
            } as AgentMessage);
          }
        }
        logger.debug('Processamento de tool calls concluído', { count: result.toolCalls.length });
      }

      // Adicionar resposta do assistente
      const assistantMsg: AgentMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        toolCalls: toolCalls,
      };
      await this.sessionService.addMessage(sessionId, assistantMsg);
      session.messages.push(assistantMsg);
      console.log('➕ Resposta do assistente adicionada à sessão');

      // Limitar histórico de mensagens (manter últimas 20)
      if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
        console.log('🗂️ Histórico limitado a 20 mensagens');
      }

      console.log('✅ ProcessMessage concluído com sucesso');
      return responseText;
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível');
      return 'Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes ou entre em contato conosco pelo telefone (11) 1234-5678.';
    }
  }

  // Processar mensagem com streaming
  async streamMessage(
    sessionId: string,
    userMessage: string,
    context?: { cartId?: string; userId?: string; user?: any; currentPage?: string }
  ) {
    // Validação de entrada
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      const error = new Error('SessionId é obrigatório e deve ser uma string não vazia');
      logger.error('Erro de validação no streamMessage:', error);
      throw error;
    }

    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      const error = new Error('Mensagem do usuário é obrigatória e deve ser uma string não vazia');
      logger.error('Erro de validação no streamMessage:', error);
      throw error;
    }

    if (userMessage.length > 10000) {
      const error = new Error('Mensagem do usuário muito longa (máximo 10000 caracteres)');
      logger.error('Erro de validação no streamMessage:', error);
      throw error;
    }

    try {
      console.log('🎯 StreamMessage iniciado para sessão:', sessionId);
      console.log('💬 Mensagem original do usuário:', userMessage);
      console.log('🔧 Contexto fornecido:', context);
      
      // Reescrever mensagem se habilitado
      let processedMessage = userMessage;
      if (this.llmConfig.enableMessageRewriter) {
        const rewriteResult = await conditionalRewriteMessage(userMessage, this.llmConfig);
        processedMessage = rewriteResult.message;
        if (rewriteResult.wasRewritten) {
          logger.debug('Mensagem reescrita', { original: userMessage, rewritten: processedMessage });
        }
      }
      
      const session = await this.getSession(sessionId);
      logger.debug('Sessão obtida', { sessionId, messageCount: session.messages.length });
      
      // Atualizar contexto se fornecido
      if (context) {
        await this.sessionService.updateSessionContext(sessionId, { ...session.context, ...context });
        logger.debug('Contexto atualizado', { sessionId, context });
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: 'user',
        content: processedMessage,
        timestamp: new Date(),
      };
      await this.sessionService.addMessage(sessionId, userMsg);
      session.messages.push(userMsg);
      logger.debug('Mensagem do usuário adicionada', { sessionId });

      // Preparar mensagens para o LLM
      const messages: CoreMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.convertMessages(session.messages),
      ];
      logger.debug('Mensagens preparadas para LLM', { count: messages.length });

      // Gerar resposta com streaming (usando fallback)
      const llmModel = await createLLMModelWithFallback(this.llmConfig);
      logger.debug('Modelo LLM criado', { hasModel: !!llmModel, toolCount: Object.keys(allTools).length });

      // Definir sessionId no contexto global para as tools
      setGlobalContext('sessionId', sessionId);
      if (context) {
        if (context.cartId) setGlobalContext('cartId', context.cartId);
        if (context.userId) {
          setGlobalContext('userId', context.userId);
          logger.debug('UserId definido no contexto', { userId: context.userId });
        }
        if (context.user) {
          setGlobalContext('user', context.user);
          logger.debug('User definido no contexto', { user: context.user });
        }
        if (context.currentPage) setGlobalContext('currentPage', context.currentPage);
      }
      logger.debug('Contexto global configurado', { sessionId });

      // Detectar se a mensagem requer tools obrigatoriamente
      const requiresTools = this.shouldForceToolUsage(processedMessage);
      logger.debug('Iniciando processamento', { 
        sessionId, 
        message: processedMessage, 
        requiresTools, 
        toolCount: Object.keys(allTools).length 
      });
      
      const result = streamText({
        model: llmModel,
        messages,
        tools: allTools,
        temperature: this.llmConfig.temperature || 0.7,
        toolChoice: requiresTools ? 'required' : 'auto', // Força tools quando necessário
      });
      
      // Processar tool calls do resultado com suporte a múltiplas execuções
      let executionCount = 0;
      const maxExecutions = 3; // Limite para evitar loops infinitos
      
      for await (const part of result.fullStream) {
        if (part.type === 'tool-call') {
          executionCount++;
          logger.debug('Tool call executada', {
            toolName: part.toolName,
            execution: executionCount,
            toolCallId: part.toolCallId,
            args: (part as any).input
          });
          
          try {
            logger.debug('Executando tool', { toolName: part.toolName });
            const tool = allTools[part.toolName as keyof typeof allTools];
            if (!tool || !tool.execute) {
              throw new Error(`Tool ${part.toolName} não encontrada ou não executável`);
            }
            const toolResult = await (tool.execute as any)((part as any).input);
            logger.debug('Tool executada com sucesso', { 
              toolName: part.toolName, 
              result: toolResult 
            });
            
            // Adicionar resultado da tool à sessão
            session.messages.push({
              role: 'assistant',
              content: `Tool ${part.toolName}: ${JSON.stringify(toolResult)}`,
              timestamp: new Date(),
            } as AgentMessage);
            
            // Log para debug - não executar add_to_cart aqui pois deve ser feito pelo LLM
            if (part.toolName === 'search_products' && executionCount < maxExecutions) {
              const userMessage = processedMessage || '';
              const isAddToCartCommand = /adicionar?|adicione|add.*cart|comprar|colocar.*carrinho/i.test(userMessage);
              
              if (isAddToCartCommand && toolResult?.products?.length > 0) {
                const quantityMatch = userMessage.match(/\b(\d+)\b/);
                const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
                logger.debug('Comando de adicionar detectado', {
                  productId: toolResult.products[0].id,
                  quantity
                });
              }
            }
            
          } catch (error) {
            logger.error('Erro na execução da tool', {
              toolName: part.toolName,
              error: error instanceof Error ? error.message : error
            });
            
            // Adicionar erro da tool à sessão
            session.messages.push({
              role: 'assistant',
              content: `Tool ${part.toolName} Error: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
              timestamp: new Date(),
            } as AgentMessage);
          }
        } else if (part.type === 'text-delta') {
          // Log silencioso para text-delta
        } else {
          logger.debug('Stream part processado', { type: part.type });
        }
      }
      logger.debug('Processamento concluído', { 
        sessionId, 
        totalMessages: session.messages.length 
      });

      return result;
    } catch (error) {
      logger.error('Erro ao processar mensagem com streaming:', {
        sessionId,
        userMessage: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''),
        context,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      });
      
      // Error já logado pelo logger.error acima
      
      // Re-throw validation errors as-is
      if (error instanceof Error && error.message.includes('validação')) {
        throw error;
      }
      
      // For other errors, provide a more user-friendly message
      throw new Error('Erro interno ao processar mensagem. Tente novamente.');
    }
  }

  // Obter histórico da sessão
  async getSessionHistory(sessionId: string): Promise<AgentMessage[]> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      return session ? [...session.messages] : [];
    } catch (error) {
      logger.error('Erro ao obter histórico da sessão', { sessionId, error });
      return [];
    }
  }

  // Limpar sessão
  async clearSession(sessionId: string): Promise<void> {
    try {
      await this.sessionService.deleteSession(sessionId);
      logger.info('Sessão limpa com sucesso', { sessionId });
    } catch (error) {
      logger.error('Erro ao limpar sessão', { sessionId, error });
      throw new Error(`Falha ao limpar sessão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Obter contexto da sessão
  async getSessionContext(sessionId: string): Promise<Record<string, any>> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      return session ? { ...session.context } : {};
    } catch (error) {
      logger.error('Erro ao obter contexto da sessão', { sessionId, error });
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
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('SessionId é obrigatório e deve ser uma string');
    }
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Mensagem é obrigatória e não pode estar vazia');
    }
    
    if (message.length > 10000) {
      throw new Error('Mensagem muito longa (máximo 10.000 caracteres)');
    }
    
    const agent = getPharmacyAgent(llmConfig);
    return await agent.processMessage(sessionId, message.trim(), context);
  } catch (error) {
    logger.error('Erro na função processUserMessage', { sessionId, messageLength: message?.length, error });
    
    if (error instanceof Error && error.message.includes('obrigatório')) {
      throw error; // Re-throw validation errors
    }
    
    return 'Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes ou entre em contato conosco pelo telefone (11) 1234-5678.';
  }
}

// Exportar types e tools
export * from './types';
export * from './config';
export { cartTools, productTools, checkoutTools, navigationTools, budgetTools, extraTools };