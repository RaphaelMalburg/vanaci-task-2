import { generateText, streamText, CoreMessage } from 'ai';
import { getLLMProvider, getLLMConfigFromEnv } from './config/llm';
import { cartTools } from './actions/cart';
import { productTools } from './actions/products';
import { checkoutTools } from './actions/checkout';
import { navigationTools } from './actions/navigation';
import { budgetTools } from './actions/budget';
import { extraTools } from './actions/extras';
import type { AgentMessage, AgentSession, LLMConfig } from './types';

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
- Seja específico com preços, quantidades e informações
- Ofereça alternativas quando apropriado
- Confirme ações importantes (adicionar ao carrinho, finalizar compra)
- Use emojis moderadamente para tornar a conversa mais amigável

**Quando Usar as Tools:**
- Use as tools sempre que o usuário solicitar ações específicas
- Combine múltiplas tools quando necessário para completar tarefas complexas
- Sempre confirme o resultado das tools com o usuário
- Se uma tool falhar, explique o problema e ofereça alternativas

Lembre-se: Você representa a Farmácia Vanaci e deve sempre manter os mais altos padrões de atendimento ao cliente e responsabilidade farmacêutica.`;

// Classe do Agente AI
export class PharmacyAIAgent {
  private llmConfig: LLMConfig;
  private sessions: Map<string, AgentSession> = new Map();

  constructor(llmConfig?: LLMConfig) {
    this.llmConfig = llmConfig || getLLMConfigFromEnv();
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
      const session = this.getSession(sessionId);
      
      // Atualizar contexto se fornecido
      if (context) {
        session.context = { ...session.context, ...context };
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      session.messages.push(userMsg);

      // Preparar mensagens para o LLM
      const messages: CoreMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.convertMessages(session.messages),
      ];

      // Gerar resposta com tools
      const llmProvider = getLLMProvider(this.llmConfig);
      
      const result = await generateText({
        model: llmProvider,
        messages,
        tools: allTools,
        temperature: 0.7,
      });

      // Adicionar resposta do assistente
      const assistantMsg: AgentMessage = {
        role: 'assistant',
        content: result.text,
        timestamp: new Date(),
        toolCalls: result.toolCalls,
      };
      session.messages.push(assistantMsg);

      // Limitar histórico de mensagens (manter últimas 20)
      if (session.messages.length > 20) {
        session.messages = session.messages.slice(-20);
      }

      return result.text;
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
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
      const session = this.getSession(sessionId);
      
      // Atualizar contexto se fornecido
      if (context) {
        session.context = { ...session.context, ...context };
      }

      // Adicionar mensagem do usuário
      const userMsg: AgentMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      session.messages.push(userMsg);

      // Preparar mensagens para o LLM
      const messages: CoreMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.convertMessages(session.messages),
      ];

      // Gerar resposta com streaming
      const llmProvider = getLLMProvider(this.llmConfig);
      
      const result = streamText({
        model: llmProvider,
        messages,
        tools: allTools,
        temperature: 0.7,
      });

      return result;
    } catch (error) {
      console.error('Erro ao processar mensagem com streaming:', error);
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
  updateLLMConfig(newConfig: Partial<LLMConfig>): void {
    this.llmConfig = { ...this.llmConfig, ...newConfig };
  }

  // Obter configuração atual do LLM
  getLLMConfig(): LLMConfig {
    return { ...this.llmConfig };
  }
}

// Instância singleton do agente
let agentInstance: PharmacyAIAgent | null = null;

// Função para obter instância do agente
export function getPharmacyAgent(config?: LLMConfig): PharmacyAIAgent {
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
  llmConfig?: LLMConfig
): Promise<string> {
  const agent = getPharmacyAgent(llmConfig);
  return agent.processMessage(sessionId, message, context);
}

// Exportar types e tools
export * from './types';
export * from './config/llm';
export { cartTools, productTools, checkoutTools, navigationTools, budgetTools, extraTools };