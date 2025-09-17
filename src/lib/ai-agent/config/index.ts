import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { mistral } from "@ai-sdk/mistral";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Instância OpenRouter configurada via variáveis de ambiente
const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.OPENROUTER_BASE_URL,
});

// Tipos para configuração
export interface LLMConfig {
  provider: "openai" | "google" | "anthropic" | "mistral" | "openrouter";
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableMessageRewriter?: boolean;
}

// Configurações padrão dos modelos
const DEFAULT_MODELS = {
  openai: process.env.OPENAI_MODEL || "gpt-4o-mini",
  google: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  anthropic: process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229",
  mistral: process.env.MISTRAL_MODEL || "mistral-large-latest",
  openrouter: process.env.OPENROUTER_MODEL || "gpt-3.5-turbo",
};

// Configurações padrão - usando OpenAI como provedor principal
const DEFAULT_CONFIG: LLMConfig = {
  provider: (process.env.DEFAULT_LLM_PROVIDER as LLMConfig["provider"]) || "openrouter",
  temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "2000"),
  enableMessageRewriter: process.env.ENABLE_MESSAGE_REWRITER === "true",
};

/**
 * Cria uma instância do modelo LLM baseado na configuração
 */
export async function createLLMModel(config: Partial<LLMConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const modelName = finalConfig.model || DEFAULT_MODELS[finalConfig.provider];

  switch (finalConfig.provider) {
    case "openai":
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY não configurada");
      }
      return openai(modelName);

    case "google":
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY não configurada");
      }
      return google(modelName);

    case "anthropic":
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY não configurada");
      }
      return anthropic(modelName);

    case "mistral":
      if (!process.env.MISTRAL_API_KEY) {
        throw new Error("MISTRAL_API_KEY não configurada");
      }
      return mistral(modelName);

    case "openrouter":
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY não configurada");
      }
      return openRouter(modelName);

    default:
      throw new Error(`Provedor LLM não suportado: ${finalConfig.provider}`);
  }
}

/**
 * Cria modelo com fallback automático - prioriza OpenAI
 */
export async function createLLMModelWithFallback(config: Partial<LLMConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Tenta OpenAI primeiro (padrão)
  try {
    return await createLLMModel({ ...finalConfig, provider: "openai" });
  } catch (error) {
    // Fallback para Google Gemini se disponível
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        return await createLLMModel({ ...finalConfig, provider: "google" });
      } catch (fallbackError) {
        // Se ambos falharem, lança erro
        throw new Error("Nenhum provider LLM disponível. Verifique OPENAI_API_KEY ou GOOGLE_GENERATIVE_AI_API_KEY.");
      }
    }

    throw new Error("OpenAI não disponível e nenhum fallback configurado. Verifique OPENAI_API_KEY.");
  }
}

/**
 * Verifica se as chaves de API necessárias estão configuradas
 */
export function validateLLMConfig(provider?: LLMConfig["provider"]) {
  const targetProvider = provider || DEFAULT_CONFIG.provider;

  const requiredKeys = {
    openai: "OPENAI_API_KEY",
    google: "GOOGLE_GENERATIVE_AI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    mistral: "MISTRAL_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
  };

  const requiredKey = requiredKeys[targetProvider];
  if (!process.env[requiredKey]) {
    throw new Error(`Chave de API não configurada: ${requiredKey}`);
  }

  return true;
}

/**
 * Lista os provedores disponíveis baseado nas chaves configuradas
 */
export function getAvailableProviders(): LLMConfig["provider"][] {
  const providers: LLMConfig["provider"][] = [];

  if (process.env.OPENAI_API_KEY) providers.push("openai");
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) providers.push("google");
  if (process.env.ANTHROPIC_API_KEY) providers.push("anthropic");
  if (process.env.MISTRAL_API_KEY) providers.push("mistral");
  if (process.env.OPENROUTER_API_KEY) providers.push("openrouter");

  return providers;
}

export { DEFAULT_CONFIG, DEFAULT_MODELS };
