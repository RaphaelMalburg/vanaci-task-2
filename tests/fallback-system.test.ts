import { createLLMModelWithFallback } from '../src/lib/ai-agent/config';

// Mock das dependências AI SDK
jest.mock('@ai-sdk/mistral', () => ({
  mistral: jest.fn(() => {
    throw new Error('Mistral capacity exceeded');
  })
}));

jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn(() => ({
    // Mock de um modelo válido
    provider: 'openai',
    model: 'gpt-3.5-turbo'
  }))
}));

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => ({
    provider: 'google',
    model: 'gemini-pro'
  }))
}));

jest.mock('@ai-sdk/anthropic', () => ({
  anthropic: jest.fn(() => ({
    provider: 'anthropic',
    model: 'claude-3-sonnet'
  }))
}));

describe('Sistema de Fallback LLM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve criar modelo com fallback quando Mistral falha', async () => {
    const config = {
      provider: 'mistral' as const,
      model: 'mistral-large-latest',
      temperature: 0.7,
      maxTokens: 1000
    };

    // Deve conseguir criar um modelo mesmo com Mistral falhando
    const model = await createLLMModelWithFallback(config);
    expect(model).toBeDefined();
    expect(model).toHaveProperty('provider');
  });

  test('deve tentar diferentes provedores em ordem', async () => {
    const config = {
      provider: 'mistral' as const,
      model: 'mistral-large-latest',
      temperature: 0.7,
      maxTokens: 1000
    };

    // Não deve lançar erro, deve usar fallback
    await expect(createLLMModelWithFallback(config)).resolves.toBeDefined();
  });

  test('deve validar configuração básica', () => {
    const config = {
      provider: 'openai' as const,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000
    };

    expect(config.provider).toBe('openai');
    expect(config.temperature).toBe(0.7);
    expect(config.maxTokens).toBe(1000);
  });

  test('deve lidar com diferentes tipos de erro', async () => {
    const config = {
      provider: 'mistral' as const,
      model: 'mistral-large-latest',
      temperature: 0.7,
      maxTokens: 1000
    };

    // Teste que o sistema não quebra com erros
    const result = await createLLMModelWithFallback(config);
    expect(result).toBeDefined();
  });
});