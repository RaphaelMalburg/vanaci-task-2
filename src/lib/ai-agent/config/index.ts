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
  enableMessageRewriter?: boolean;
}

// Configurações padrão dos modelos
const DEFAULT_MODELS = {
  openai: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
  google: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  anthropic: process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229",
  mistral: process.env.MISTRAL_MODEL || "mistral-large-latest",
};

// Configurações padrão
const DEFAULT_CONFIG: LLMConfig = {
  provider: (process.env.DEFAULT_LLM_PROVIDER as LLMConfig["provider"]) || "openai",
  temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "2000"),
  enableMessageRewriter: process.env.ENABLE_MESSAGE_REWRITER === "true",
};

/**
 * Cria uma instância do modelo LLM baseado na configuração
 */
export async function createLLMModel(config: Partial<LLMConfig> = {}) {
  console.log('🔧 createLLMModel: Iniciando criação do modelo');
  console.log('📋 Configuração recebida:', config);
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const modelName = finalConfig.model || DEFAULT_MODELS[finalConfig.provider];
  
  console.log('⚙️ Configuração final:', finalConfig);
  console.log('🏷️ Nome do modelo:', modelName);
  console.log('🔑 Provider selecionado:', finalConfig.provider);

  switch (finalConfig.provider) {
    case "openai":
      console.log('🔍 Verificando OPENAI_API_KEY...');
      if (!process.env.OPENAI_API_KEY) {
        console.log('❌ OPENAI_API_KEY não encontrada');
        throw new Error("OPENAI_API_KEY não configurada");
      }
      console.log('✅ Criando modelo OpenAI:', modelName);
      return openai(modelName);

    case "google":
      console.log('🔍 Verificando GOOGLE_GENERATIVE_AI_API_KEY...');
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.log('❌ GOOGLE_GENERATIVE_AI_API_KEY não encontrada');
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY não configurada");
      }
      console.log('✅ Criando modelo Google:', modelName);
      return google(modelName);

    case "anthropic":
      console.log('🔍 Verificando ANTHROPIC_API_KEY...');
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('❌ ANTHROPIC_API_KEY não encontrada');
        throw new Error("ANTHROPIC_API_KEY não configurada");
      }
      console.log('✅ Criando modelo Anthropic:', modelName);
      return anthropic(modelName);

    case "mistral":
      console.log('🔍 Verificando MISTRAL_API_KEY...');
      if (!process.env.MISTRAL_API_KEY) {
        console.log('❌ MISTRAL_API_KEY não encontrada');
        throw new Error("MISTRAL_API_KEY não configurada");
      }
      console.log('✅ Criando modelo Mistral:', modelName);
      const model = mistral(modelName);
      console.log('🎯 Modelo Mistral criado com sucesso');
      return model;

    default:
      console.log('❌ Provider não suportado:', finalConfig.provider);
      throw new Error(`Provedor LLM não suportado: ${finalConfig.provider}`);
  }
}

/**
 * Cria modelo com fallback automático para outros provedores
 */
export async function createLLMModelWithFallback(config: Partial<LLMConfig> = {}) {
  console.log('🔄 createLLMModelWithFallback: Iniciando criação com fallback');
  
  const availableProviders = getAvailableProviders();
  const primaryProvider = config.provider || DEFAULT_CONFIG.provider;
  
  // Tenta o provider primário primeiro
  if (availableProviders.includes(primaryProvider)) {
    try {
      console.log(`🎯 Tentando provider primário: ${primaryProvider}`);
      return await createLLMModel({ ...config, provider: primaryProvider });
    } catch (error) {
      console.log(`⚠️ Falha no provider ${primaryProvider}:`, error);
    }
  }
  
  // Tenta outros providers disponíveis como fallback
  for (const provider of availableProviders) {
    if (provider !== primaryProvider) {
      try {
        console.log(`🔄 Tentando fallback para: ${provider}`);
        return await createLLMModel({ ...config, provider });
      } catch (error) {
        console.log(`⚠️ Falha no fallback ${provider}:`, error);
      }
    }
  }
  
  throw new Error('❌ Nenhum provider LLM disponível. Verifique as chaves de API.');
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
