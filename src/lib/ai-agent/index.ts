import { generateText, streamText, CoreMessage, stepCountIs } from 'ai';
import { setContextVariable } from '@langchain/core/context';
import { createLLMModel, createLLMModelWithFallback, validateLLMConfig, LLMConfig as ConfigLLMConfig } from './config';
import { cartTools } from './actions/cart';
import { productTools } from './actions/products';
import { checkoutTools } from './actions/checkout';
import { navigationTools } from './actions/navigation';
import { budgetTools } from './actions/budget';
import { extraTools } from './actions/extras';
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
- Use as tools sempre que o usuário solicitar ações específicas
- Combine múltiplas tools quando necessário para completar tarefas complexas
- **EXECUTE MÚLTIPLAS TOOLS EM SEQUÊNCIA: primeiro search_products, depois add_to_cart com o ID encontrado**
- **NÃO pare após apenas uma tool call - continue executando as ferramentas necessárias para completar a tarefa**
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
  private sessions: Map<string, AgentSession> = new Map();

  constructor(llmConfig?: ConfigLLMConfig) {
    this.llmConfig = llmConfig || {
      provider: (process.env.DEFAULT_LLM_PROVIDER as ConfigLLMConfig['provider']) || 'openai',
      temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000')
    };
    validateLLMConfig(this.llmConfig.provider);
  }

  // Criar ou obter sessão
  private getSession(sessionId: string): AgentSession {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        messages: [],
        context: {},
      });
    }
    return this.sessions.get(sessionId)!;
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
      console.log('🎯 ProcessMessage iniciado para sessão:', sessionId);
      console.log('💬 Mensagem do usuário:', userMessage);
      console.log('🔧 Contexto fornecido:', context);
      
      const session = this.getSession(sessionId);
      console.log('📋 Sessão obtida, mensagens existentes:', session.messages.length);
      
      // Atualizar contexto se fornecido
      if (context) {
        session.context = { ...session.context, ...context };
        console.log('🔄 Contexto atualizado:', session.context);
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      session.messages.push(userMsg);
      console.log('➕ Mensagem do usuário adicionada à sessão');

      // Preparar mensagens para o LLM
      const messages: CoreMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.convertMessages(session.messages),
      ];
      console.log('📨 Mensagens preparadas para LLM:', messages.length);
      console.log('📨 Última mensagem:', messages[messages.length - 1]);

      // Gerar resposta com tools (usando fallback)
      const llmModel = await createLLMModelWithFallback(this.llmConfig);
      console.log('🤖 Modelo LLM criado com fallback:', !!llmModel);
      console.log('🔧 Tools disponíveis:', Object.keys(allTools));
      console.log('🌡️ Temperatura configurada:', this.llmConfig.temperature || 0.7);
      
      // Definir sessionId no contexto para as tools
      setContextVariable('sessionId', sessionId);
      console.log('🔑 SessionId definido no contexto:', sessionId);
      
      console.log('🚀 Iniciando generateText...');
      const result = await generateText({
        model: llmModel,
        messages: messages,
        tools: allTools,
        temperature: this.llmConfig.temperature || 0.7,
        stopWhen: stepCountIs(5), // Permite até 5 steps para múltiplas tool calls em sequência
      });
      
      console.log('✅ GenerateText concluído');
      const responseText = result.text;
      const toolCalls = result.toolCalls;
      const toolResults = result.toolResults;
      console.log('📝 Texto da resposta:', responseText?.substring(0, 100) + '...');
      console.log('🔧 Tool calls encontrados:', toolCalls?.length || 0);
      console.log('🔧 Tool results encontrados:', toolResults?.length || 0);

      if (toolCalls && toolCalls.length > 0) {
        toolCalls.forEach((tc, index) => {
          console.log(`🛠️ Tool Call ${index} no processMessage:`, {
            toolName: tc.toolName,
            toolCallId: tc.toolCallId,
            args: JSON.stringify(tc, null, 2),
            type: typeof tc
          });
        });
      }

      if (toolResults && toolResults.length > 0) {
        toolResults.forEach((tr, index) => {
          console.log(`🔧 Tool Result ${index}:`, {
            toolCallId: tr.toolCallId,
            result: JSON.stringify(tr, null, 2)
          });
        });
      }

      // Adicionar resposta do assistente
      const assistantMsg: AgentMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        toolCalls: toolCalls,
      };
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
    try {
      console.log('🎯 StreamMessage iniciado para sessão:', sessionId);
      console.log('💬 Mensagem do usuário:', userMessage);
      console.log('🔧 Contexto fornecido:', context);
      
      const session = this.getSession(sessionId);
      console.log('📋 Sessão obtida, mensagens existentes:', session.messages.length);
      
      // Atualizar contexto se fornecido
      if (context) {
        session.context = { ...session.context, ...context };
        console.log('🔄 Contexto atualizado:', session.context);
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
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

      // Definir sessionId no contexto para as tools
      setContextVariable('sessionId', sessionId);
      console.log('🔑 SessionId definido no contexto:', sessionId);

      console.log('🚀 Iniciando streamText...');
      const result = streamText({
        model: llmModel,
        messages,
        tools: allTools,
        temperature: this.llmConfig.temperature || 0.7,
        stopWhen: stepCountIs(5), // Permite até 5 steps para múltiplas tool calls em sequência
      });
      console.log('📡 StreamText result obtido:', !!result);
      console.log('📡 Result properties:', Object.keys(result));
      
      // Log das propriedades do resultado
      if (result.toolCalls) {
        console.log('🔧 Tool calls promise detectado no resultado');
        try {
          const toolCallsResolved = await result.toolCalls;
          console.log('🔧 Tool calls resolvidos:', toolCallsResolved?.length || 0);
          if (toolCallsResolved && toolCallsResolved.length > 0) {
            toolCallsResolved.forEach((tc, index) => {
                console.log(`🛠️ Tool Call ${index} no streamMessage:`, {
                  toolName: tc.toolName,
                  toolCallId: tc.toolCallId
                });
              });
          }
        } catch (toolError) {
          console.error('❌ Erro ao resolver tool calls:', toolError);
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao processar mensagem com streaming:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível');
      throw error;
    }
  }

  // Obter histórico da sessão
  getSessionHistory(sessionId: string): AgentMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? [...session.messages] : [];
  }

  // Limpar sessão
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // Obter contexto da sessão
  getSessionContext(sessionId: string) {
    const session = this.sessions.get(sessionId);
    return session ? { ...session.context } : {};
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
  const agent = getPharmacyAgent(llmConfig);
  return agent.processMessage(sessionId, message, context);
}

// Exportar types e tools
export * from './types';
export * from './config';
export { cartTools, productTools, checkoutTools, navigationTools, budgetTools, extraTools };