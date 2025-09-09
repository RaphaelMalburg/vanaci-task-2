import { generateText } from 'ai';
import { createLLMModelWithFallback } from './config';
import type { LLMConfig } from './config';



/**
 * Reescreve mensagens do usuário para melhorar a clareza e eficácia das tool calls
 */
export async function rewriteUserMessage(
  userMessage: string,
  llmConfig?: LLMConfig
): Promise<string> {
  try {
    console.log('🔄 [Message Rewriter] Reescrevendo mensagem do usuário:', userMessage);
    
    const llmModel = await createLLMModelWithFallback(llmConfig);
    
    const rewritePrompt = `Você é um assistente especializado em reescrever mensagens de usuários para melhorar a clareza e eficácia das solicitações em uma farmácia online.

**Sua tarefa:**
- Reescrever a mensagem do usuário de forma mais clara e específica
- Manter a intenção original do usuário
- Tornar explícitas as ações que o usuário deseja (buscar, adicionar ao carrinho, etc.)
- Usar termos farmacêuticos corretos quando apropriado
- Ser conciso mas completo

**Exemplos:**
Usuário: "quero remedio pra dor"
Reescrita: "Preciso de medicamentos para alívio da dor. Por favor, mostre as opções disponíveis."

Usuário: "adiciona 2 dipirona"
Reescrita: "Adicione 2 unidades de Dipirona ao meu carrinho de compras."

Usuário: "tem acido folico?"
Reescrita: "Vocês têm ácido fólico disponível? Gostaria de ver as opções."

**Regras importantes:**
- Se a mensagem já está clara, retorne-a sem alterações
- Não adicione informações que o usuário não mencionou
- Mantenha o tom natural e amigável
- Se houver ambiguidade, mantenha a interpretação mais provável

**Mensagem do usuário para reescrever:**
"${userMessage}"

**Responda APENAS com a mensagem reescrita, sem explicações adicionais.**`;

    const result = await generateText({
      model: llmModel,
      prompt: rewritePrompt,
      temperature: 0.3, // Temperatura baixa para consistência
    });

    const rewrittenMessage = result.text.trim();
    
    // Se a reescrita for muito similar ou vazia, usar a original
    if (!rewrittenMessage || rewrittenMessage.length < 3) {
      console.log('⚠️ [Message Rewriter] Reescrita inválida, usando mensagem original');
      return userMessage;
    }
    
    console.log('✅ [Message Rewriter] Mensagem reescrita:', rewrittenMessage);
    return rewrittenMessage;
    
  } catch (error) {
    console.error('❌ [Message Rewriter] Erro ao reescrever mensagem:', error);
    // Em caso de erro, retornar a mensagem original
    return userMessage;
  }
}

/**
 * Verifica se uma mensagem precisa ser reescrita
 */
export function shouldRewriteMessage(message: string): boolean {
  const lowercaseMessage = message.toLowerCase().trim();
  
  // Critérios para reescrita
  const needsRewriting = (
    // Mensagens muito curtas ou vagas
    lowercaseMessage.length < 10 ||
    // Mensagens com muitas abreviações
    /\b(q|vc|pq|tb|tbm)\b/.test(lowercaseMessage) ||
    // Mensagens sem pontuação e muito informais
    (!/[.!?]/.test(message) && lowercaseMessage.length > 5) ||
    // Mensagens com erros de digitação comuns
    /\b(remedio|farmacia|medico)\b/.test(lowercaseMessage)
  );
  
  return needsRewriting;
}

/**
 * Reescreve mensagem apenas se necessário
 */
export async function conditionalRewriteMessage(
  userMessage: string,
  llmConfig?: LLMConfig
): Promise<{ message: string; wasRewritten: boolean }> {
  if (shouldRewriteMessage(userMessage)) {
    const rewritten = await rewriteUserMessage(userMessage, llmConfig);
    return {
      message: rewritten,
      wasRewritten: rewritten !== userMessage
    };
  }
  
  return {
    message: userMessage,
    wasRewritten: false
  };
}