# AI Agent - Sistema de Chat Inteligente

Este é um agente conversacional modular construído com **LangChain** e **Vercel AI SDK** que pode ser facilmente migrado para outros projetos.

## 📁 Estrutura do Projeto

```
src/lib/ai-agent/
├── actions/          # Tools modulares do agente
│   ├── budget.ts     # Ferramentas de orçamento
│   ├── cart.ts       # Ferramentas do carrinho
│   ├── checkout.ts   # Ferramentas de checkout
│   ├── extras.ts     # Ferramentas extras (horários, promoções, etc.)
│   └── products.ts   # Ferramentas de produtos
├── types/           # Tipos TypeScript
│   └── index.ts     # Definições de tipos
├── utils/           # Utilitários
│   └── index.ts     # Funções auxiliares
├── config/          # Configurações
│   └── index.ts     # Configuração dos LLMs
└── index.ts         # Agente principal
```

## 🚀 Como Usar

### 1. Configuração Básica

```typescript
import { createAIAgent } from "@/lib/ai-agent";

// Criar o agente
const agent = createAIAgent();

// Processar mensagem
const response = await agent.processMessage({
  message: "Olá, preciso de ajuda",
  sessionId: "user-123",
});
```

### 2. Integração com API Route (Next.js)

```typescript
// app/api/chat/route.ts
import { createAIAgent } from "@/lib/ai-agent";

export async function POST(request: Request) {
  const { message, sessionId } = await request.json();

  const agent = createAIAgent();
  const response = await agent.processMessage({ message, sessionId });

  return Response.json(response);
}
```

### 3. Integração com Node.js Backend

```typescript
// server.js
import express from "express";
import { createAIAgent } from "./lib/ai-agent";

const app = express();
const agent = createAIAgent();

app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    const response = await agent.processMessage({ message, sessionId });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
```

## 🔧 Configuração dos LLMs

O agente suporta múltiplos provedores de LLM:

### Variáveis de Ambiente

```env
# Escolha um ou mais provedores
OPENAI_API_KEY="your_openai_key"
GOOGLE_GENERATIVE_AI_API_KEY="your_google_key"
ANTHROPIC_API_KEY="your_anthropic_key"
MISTRAL_API_KEY="your_mistral_key"
OPENROUTER_API_KEY="your_openrouter_key"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"

# Provedor padrão
DEFAULT_LLM_PROVIDER="openrouter"

# Modelos específicos
OPENAI_MODEL="gpt-4-turbo-preview"
GOOGLE_MODEL="gemini-pro"
ANTHROPIC_MODEL="claude-3-sonnet-20240229"
MISTRAL_MODEL="mistral-large-latest"
```

### Configuração do OpenRouter

Para usar OpenRouter em vez de OpenAI, defina as variáveis de ambiente acima (incluindo `OPENROUTER_BASE_URL`) e selecione `openrouter` como `DEFAULT_LLM_PROVIDER` ou `provider`.

### Exemplo Programático com createOpenRouter

```typescript
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createAIAgent } from "@/lib/ai-agent";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.OPENROUTER_BASE_URL,
});

const agent = createAIAgent(
  {
    provider: "openrouter",
    model: "openrouter/anthropic/claude-3-sonnet:thinking",
    temperature: 0.7,
    maxTokens: 2000,
    enableMessageRewriter: true,
  },
  openRouter
);
```

### Configuração Programática

```typescript
import { createAIAgent } from "@/lib/ai-agent";

const agent = createAIAgent({
  provider: "mistral",
  model: "mistral-large-latest",
  temperature: 0.7,
  maxTokens: 2000,
});
```

## 🛠️ Criando Tools Personalizados

### 1. Estrutura de um Tool

```typescript
import { z } from "zod";
import { tool } from "ai";

export const meuTool = tool({
  description: "Descrição do que o tool faz",
  parameters: z.object({
    parametro: z.string().describe("Descrição do parâmetro"),
  }),
  execute: async ({ parametro }: { parametro: string }) => {
    // Lógica do tool
    return {
      success: true,
      data: "Resultado",
    };
  },
});
```

### 2. Registrando Tools no Agente

```typescript
// actions/meus-tools.ts
export const meusTools = {
  meu_tool: meuTool,
  outro_tool: outroTool,
};

// index.ts
import { meusTools } from "./actions/meus-tools";

const allTools = {
  ...existingTools,
  ...meusTools,
};
```

## 📦 Migração para Outros Projetos

### 1. Copiar Arquivos

```bash
# Copie toda a pasta ai-agent
cp -r src/lib/ai-agent /seu-projeto/src/lib/
```

### 2. Instalar Dependências

```bash
npm install @langchain/core @langchain/community @langchain/openai ai @ai-sdk/openai @ai-sdk/google @ai-sdk/anthropic zod

# Para Mistral (opcional)
npm install @ai-sdk/mistral
```

### 3. Adaptar Tools

- Modifique os tools em `actions/` para sua lógica de negócio
- Atualize as chamadas de API nos tools
- Ajuste os tipos em `types/index.ts`

### 4. Configurar Ambiente

```env
# Copie as variáveis necessárias do .env.example
OPENAI_API_KEY="sua_chave"
DEFAULT_LLM_PROVIDER="openai"
```

## 🎯 Exemplos de Uso

### Chat Simples

```typescript
const response = await agent.processMessage({
  message: "Olá!",
  sessionId: "user-123",
});
console.log(response.content);
```

### Com Context/Memória

```typescript
const response = await agent.processMessage({
  message: "Lembra do que conversamos?",
  sessionId: "user-123",
  context: previousMessages,
});
```

### Streaming (Tempo Real)

```typescript
const stream = await agent.streamMessage({
  message: "Conte uma história",
  sessionId: "user-123",
});

for await (const chunk of stream) {
  console.log(chunk.content);
}
```

## 🔍 Debugging

### Logs Detalhados

```typescript
const agent = createAIAgent({
  debug: true,
  logLevel: "verbose",
});
```

### Monitoramento de Tools

```typescript
const response = await agent.processMessage({
  message: "Adicione produto ao carrinho",
  sessionId: "user-123",
  onToolCall: (toolName, params) => {
    console.log(`Tool chamado: ${toolName}`, params);
  },
});
```

## 📚 Recursos Adicionais

- **LangChain Docs**: https://js.langchain.com/
- **Vercel AI SDK**: https://sdk.vercel.ai/
- **Zod Validation**: https://zod.dev/

## 🤝 Contribuindo

1. Crie tools modulares e reutilizáveis
2. Mantenha a tipagem TypeScript
3. Documente novos tools
4. Teste com diferentes LLMs

---

**Nota**: Este agente foi projetado para ser modular e facilmente adaptável. Modifique os tools conforme sua necessidade específica.
