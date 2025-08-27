import { createLLMModelWithFallback } from '../src/lib/ai-agent/config';
import { PharmacyAIAgent } from '../src/lib/ai-agent';

// Mock das dependências
jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn(() => ({
    chat: jest.fn(() => ({
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
    }))
  }))
}));

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => ({
    chat: jest.fn(() => ({
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
    }))
  }))
}));

jest.mock('@ai-sdk/anthropic', () => ({
  anthropic: jest.fn(() => ({
    chat: jest.fn(() => ({
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }]
        })
      }
    }))
  }))
}));

jest.mock('@ai-sdk/mistral', () => ({
  mistral: jest.fn(() => {
    throw new Error('Mistral capacity exceeded');
  })
}));

describe('AI Agent Fallback System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve criar modelo LLM com fallback quando Mistral falha', async () => {
    const config = {
      provider: 'mistral' as const,
      model: 'mistral-large-latest',
      temperature: 0.7,
      maxTokens: 1000
    };

    // Deve conseguir criar um modelo mesmo com Mistral falhando
    const model = await createLLMModelWithFallback(config);
    expect(model).toBeDefined();
  });

  test('deve processar mensagem mesmo com erro no modelo primário', async () => {
    const agent = new PharmacyAIAgent();
    
    // Deve conseguir processar a mensagem mesmo com fallback
    const result = await agent.processMessage('test-session', 'Olá, preciso de ajuda com medicamentos');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  test('deve retornar resposta válida para consulta sobre medicamentos', async () => {
    const agent = new PharmacyAIAgent();
    
    const result = await agent.processMessage('test-session', 'Quais medicamentos vocês têm para dor de cabeça?');
    expect(result).toBeDefined();
    expect(result).toContain('medicamento');
  });

  test('deve lidar com erro de capacidade do modelo', async () => {
    const config = {
      provider: 'mistral' as const,
      model: 'mistral-large-latest',
      temperature: 0.7,
      maxTokens: 1000
    };

    // Não deve lançar erro, deve usar fallback
    await expect(createLLMModelWithFallback(config)).resolves.toBeDefined();
  });
});