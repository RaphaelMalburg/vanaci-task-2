import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import type { LLMConfig } from '../types';

// Configuração padrão dos modelos
const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  google: 'gemini-1.5-flash',
  anthropic: 'claude-3-haiku-20240307',
  mistral: 'mistral-small-latest'
} as const;

// Função para obter o provedor configurado
export function getLLMProvider(config: LLMConfig) {
  const { provider, apiKey, model, temperature = 0.7, maxTokens = 1000 } = config;

  const modelName = model || DEFAULT_MODELS[provider];

  switch (provider) {
    case 'openai':
      const openai = createOpenAI({
        apiKey,
      });
      return openai(modelName);

    case 'google':
      const google = createGoogleGenerativeAI({
        apiKey,
      });
      return google(modelName);

    case 'anthropic':
      const anthropic = createAnthropic({
        apiKey,
      });
      return anthropic(modelName);

    default:
      throw new Error(`Provedor LLM não suportado: ${provider}`);
  }
}

// Configuração do ambiente
export function getLLMConfigFromEnv(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || 'openai') as LLMConfig['provider'];
  
  let apiKey: string;
  
  switch (provider) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY || '';
      break;
    case 'google':
      apiKey = process.env.GOOGLE_API_KEY || '';
      break;
    case 'anthropic':
      apiKey = process.env.ANTHROPIC_API_KEY || '';
      break;
    case 'mistral':
      apiKey = process.env.MISTRAL_API_KEY || '';
      break;
    default:
      throw new Error(`Provedor não configurado: ${provider}`);
  }

  if (!apiKey) {
    throw new Error(`API key não encontrada para o provedor: ${provider}`);
  }

  return {
    provider,
    apiKey,
    model: process.env.LLM_MODEL || DEFAULT_MODELS[provider],
    temperature: process.env.LLM_TEMPERATURE ? parseFloat(process.env.LLM_TEMPERATURE) : 0.7,
    maxTokens: process.env.LLM_MAX_TOKENS ? parseInt(process.env.LLM_MAX_TOKENS) : 1000,
  };
}

// Lista de modelos disponíveis por provedor
export const AVAILABLE_MODELS = {
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
  ],
  google: [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-pro',
  ],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307',
    'claude-3-sonnet-20240229',
  ],
  mistral: [
    'mistral-large-latest',
    'mistral-small-latest',
    'codestral-latest',
  ],
} as const;