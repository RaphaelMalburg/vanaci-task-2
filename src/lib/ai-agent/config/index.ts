import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { mistral } from "@ai-sdk/mistral";

// Tipos para configuração
export interface LLMConfig {
  provider: "openai" | "google" | "anthropic" | "mistral";
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Configurações padrão dos modelos
const DEFAULT_MODELS = {
  openai: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
  google: process.env.GOOGLE_MODEL || "gemini-pro",
  anthropic: process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229",
  mistral: process.env.MISTRAL_MODEL || "mistral-large-latest",
};

// Configurações padrão
const DEFAULT_CONFIG: LLMConfig = {
  provider: (process.env.DEFAULT_LLM_PROVIDER as LLMConfig["provider"]) || "openai",
  temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "2000"),
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

    default:
      throw new Error(`Provedor LLM não suportado: ${finalConfig.provider}`);
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

  return providers;
}

export { DEFAULT_CONFIG, DEFAULT_MODELS };
