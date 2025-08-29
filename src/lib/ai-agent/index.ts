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
- **NÃO mencione detalhes técnicos como IDs de produtos, verificações de estoque ou processos internos**
- **NÃO informe sobre buscas ou verificações que está fazendo nos bastidores**
- **Seja natural e direto, como um atendente humano seria**

**Quando Usar as Tools:**
- **SEMPRE use as tools quando o usuário solicitar ações específicas como adicionar produtos ao carrinho**
- **Para adicionar produtos: OBRIGATORIAMENTE execute search_products primeiro, depois add_to_cart com o ID encontrado**
- **EXECUTE MÚLTIPLAS TOOLS EM SEQUÊNCIA: primeiro search_products, depois add_to_cart com o ID encontrado**
- **NÃO pare após apenas uma tool call - continue executando as ferramentas necessárias para completar a tarefa**
- **NUNCA apenas responda com texto quando uma ação específica foi solicitada - USE AS TOOLS**
- **IMPORTANTE: Quando o usuário pedir para adicionar produtos, você DEVE executar AMBAS as tools: search_products E add_to_cart**
- **Se search_products encontrar produtos, você DEVE imediatamente usar add_to_cart para cada produto solicitado**
- Após usar tools, responda de forma natural sobre o resultado final

**IMPORTANTE - Uso Correto de IDs de Produtos:**
- Quando usar search_products, SEMPRE extraia o ID correto do produto dos resultados
- Para add_to_cart, use APENAS o productId (string) retornado pela busca, NUNCA o nome do produto
- SEMPRE verifique se o produto foi encontrado antes de tentar adicionar ao carrinho

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
      provider: 'google', // Simplificado para usar apenas Google Gemini
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

  // Processar mensagem do usuário
  async processMessage(
    sessionId: string,
    userMessage: string,
    context?: { cartId?: string; userId?: string; currentPage?: string }
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
        console.log('🔧 [DEBUG] Tool calls detectados:', result.toolCalls.length);
        console.log('🔧 [DEBUG] Tool calls completos:', JSON.stringify(result.toolCalls, null, 2));
        
        for (const toolCall of result.toolCalls) {
          console.log(`🛠️ [DEBUG] Executando tool: ${toolCall.toolName}` );
          console.log(`🆔 [DEBUG] Tool Call ID: ${toolCall.toolCallId}`);
          
          try {
            console.log(`⏳ [DEBUG] Iniciando execução da tool ${toolCall.toolName}...`);
            const tool = allTools[toolCall.toolName as keyof typeof allTools];
            if (!tool || !tool.execute) {
              throw new Error(`Tool ${toolCall.toolName} não encontrada ou não executável`);
            }
            const toolResult = await (tool.execute as any)((toolCall as any).args);
            console.log(`✅ [DEBUG] Tool ${toolCall.toolName} executado com sucesso:`);
            console.log(`📊 [DEBUG] Resultado completo:`, JSON.stringify(toolResult, null, 2));
            
            // Adicionar resultado da tool à sessão
            session.messages.push({
              role: 'assistant',
              content: `Tool ${toolCall.toolName}: ${JSON.stringify(toolResult)}`,
              timestamp: new Date(),
            } as AgentMessage);
            console.log(`💾 [DEBUG] Resultado da tool ${toolCall.toolName} adicionado à sessão`);
          } catch (error) {
            console.error(`❌ [DEBUG] Erro ao executar tool ${toolCall.toolName}:`, error);
            console.error(`❌ [DEBUG] Stack trace:`, error instanceof Error ? error.stack : 'Sem stack trace');
            
            // Adicionar erro da tool à sessão
            session.messages.push({
              role: 'assistant',
              content: `Tool ${toolCall.toolName} Error: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
              timestamp: new Date(),
            } as AgentMessage);
            console.log(`💾 [DEBUG] Erro da tool ${toolCall.toolName} adicionado à sessão`);
          }
        }
        console.log(`🏁 [DEBUG] Processamento de ${result.toolCalls.length} tool calls concluído`);
      } else {
        console.log('🔧 [DEBUG] Nenhuma tool call detectada no resultado');
        console.log('🔧 [DEBUG] Resultado completo:', JSON.stringify(result, null, 2));
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
    context?: { cartId?: string; userId?: string; currentPage?: string }
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
          console.log('✏️ Mensagem reescrita:', processedMessage);
        }
      }
      
      const session = await this.getSession(sessionId);
      console.log('📋 Sessão obtida, mensagens existentes:', session.messages.length);
      
      // Atualizar contexto se fornecido
      if (context) {
        await this.sessionService.updateSessionContext(sessionId, { ...session.context, ...context });
        console.log('🔄 Contexto atualizado:', context);
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: 'user',
        content: processedMessage,
        timestamp: new Date(),
      };
      await this.sessionService.addMessage(sessionId, userMsg);
      session.messages.push(userMsg);
      console.log('➕ Mensagem do usuário adicionada à sessão');

      // Preparar mensagens para o LLM
      const messages: CoreMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.convertMessages(session.messages),
      ];
      console.log('📨 Mensagens preparadas para LLM:', messages.length);
      console.log('📨 Última mensagem:', messages[messages.length - 1]);

      // Gerar resposta com streaming (usando fallback)
      const llmModel = await createLLMModelWithFallback(this.llmConfig);
      console.log('🤖 Modelo LLM criado com fallback:', !!llmModel);
      console.log('🔧 Tools disponíveis:', Object.keys(allTools));
      console.log('🌡️ Temperatura configurada:', this.llmConfig.temperature || 0.7);

      // Definir sessionId no contexto global para as tools
      setGlobalContext('sessionId', sessionId);
      if (context) {
        if (context.cartId) setGlobalContext('cartId', context.cartId);
        if (context.userId) setGlobalContext('userId', context.userId);
        if (context.currentPage) setGlobalContext('currentPage', context.currentPage);
      }
      console.log('🔑 SessionId e contexto definidos no contexto global:', sessionId);

      console.log('🚀 Iniciando streamText...');
      console.log('🔧 Configuração do streamText:', {
        model: llmModel.modelId || 'unknown',
        toolsCount: Object.keys(allTools).length,
        temperature: this.llmConfig.temperature || 0.7,
        messagesCount: messages.length
      });
      
      const result = streamText({
        model: llmModel,
        messages,
        tools: allTools,
        temperature: this.llmConfig.temperature || 0.7,
      });
      console.log('📡 StreamText result obtido:', !!result);
      console.log('📡 Result properties:', Object.keys(result));
      
      // Processar tool calls do resultado
      console.log('🔄 [DEBUG] Iniciando processamento do stream...');
      for await (const part of result.fullStream) {
        console.log(`🔄 [DEBUG] Stream part type: ${part.type}`);
        
        if (part.type === 'tool-call') {
          console.log(`🛠️ [DEBUG] Stream Tool call detectado: ${part.toolName}`);
          console.log(`📋 [DEBUG] Stream Args completos:`, JSON.stringify((part as any).args, null, 2));
          console.log(`🆔 [DEBUG] Stream Tool Call ID: ${part.toolCallId}`);
          
          try {
            console.log(`⏳ [DEBUG] Iniciando execução da stream tool ${part.toolName}...`);
            const tool = allTools[part.toolName as keyof typeof allTools];
            if (!tool || !tool.execute) {
              throw new Error(`Tool ${part.toolName} não encontrada ou não executável`);
            }
            const toolResult = await (tool.execute as any)((part as any).args);
            console.log(`✅ [DEBUG] Stream Tool ${part.toolName} executado com sucesso:`);
            console.log(`📊 [DEBUG] Stream Resultado completo:`, JSON.stringify(toolResult, null, 2));
            
            // Adicionar resultado da tool à sessão
            session.messages.push({
              role: 'assistant',
              content: `Tool ${part.toolName}: ${JSON.stringify(toolResult)}`,
              timestamp: new Date(),
            } as AgentMessage);
            console.log(`💾 [DEBUG] Stream Resultado da tool ${part.toolName} adicionado à sessão`);
          } catch (error) {
            console.error(`❌ [DEBUG] Erro na stream tool ${part.toolName}:`, error);
            console.error(`❌ [DEBUG] Stream Stack trace:`, error instanceof Error ? error.stack : 'Sem stack trace');
            
            // Adicionar erro da tool à sessão
            session.messages.push({
              role: 'assistant',
              content: `Tool ${part.toolName} Error: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
              timestamp: new Date(),
            } as AgentMessage);
            console.log(`💾 [DEBUG] Stream Erro da tool ${part.toolName} adicionado à sessão`);
          }
        } else if (part.type === 'text-delta') {
          console.log(`📝 [DEBUG] Stream text delta recebido`);
        } else {
          console.log(`🔄 [DEBUG] Stream part type não reconhecido: ${part.type}`);
        }
      }
      console.log('🏁 [DEBUG] Processamento do stream concluído');
      console.log(`📊 [DEBUG] Total de mensagens na sessão: ${session.messages.length}`);

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
      
      console.error('❌ Erro ao processar mensagem com streaming:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível');
      
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
  context?: { cartId?: string; userId?: string; currentPage?: string },
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