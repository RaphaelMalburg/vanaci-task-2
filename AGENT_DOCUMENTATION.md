# 🤖 Sistema de Agente IA - Farmácia Vanaci

## 📋 Visão Geral

Esta aplicação é um e-commerce de farmácia com um **agente conversacional inteligente** que permite aos usuários interagir naturalmente para buscar produtos, gerenciar carrinho e finalizar compras através de chat.

## 🏗️ Arquitetura do Sistema

### **Frontend (Next.js 14)**
- Interface moderna com Tailwind CSS
- Componentes reutilizáveis (produtos, carrinho, chat)
- Gerenciamento de estado com Zustand
- Autenticação JWT integrada

### **Backend (API Routes)**
- APIs RESTful para produtos, carrinho e checkout
- Integração com banco de dados PostgreSQL (Prisma)
- Sistema de sessões para usuários não autenticados
- Cache inteligente para otimização de performance

### **Agente IA (Vercel AI SDK)**
- Processamento de linguagem natural em português
- Sistema modular de ferramentas (tools)
- Contexto persistente por sessão
- Fallback entre diferentes modelos LLM

## 🛠️ Ferramentas do Agente IA

### **🛒 Carrinho (Cart Tools)**
- `add_to_cart`: Adiciona produtos (incrementa quantidade existente)
- `set_cart_quantity`: Define quantidade específica total
- `increment_cart`: Incrementa quantidade de produto existente
- `update_cart_quantity`: Atualiza quantidade (pode remover se 0)
- `remove_from_cart`: Remove produto específico
- `view_cart`: Visualiza conteúdo atual
- `clear_cart`: Limpa carrinho completamente

### **🔍 Produtos (Product Tools)**
- `search_products`: Busca produtos por nome, categoria ou sintomas
- `get_product_details`: Detalhes específicos de um produto
- `get_categories`: Lista categorias disponíveis
- `get_featured_products`: Produtos em destaque

### **💰 Orçamento (Budget Tools)**
- `calculate_budget`: Calcula orçamento baseado em sintomas
- `suggest_alternatives`: Sugere alternativas mais baratas
- `compare_prices`: Compara preços entre produtos

### **🛍️ Checkout (Checkout Tools)**
- `initiate_checkout`: Inicia processo de finalização
- `validate_cart`: Valida carrinho antes da compra
- `calculate_shipping`: Calcula frete

### **🧭 Navegação (Navigation Tools)**
- `redirect_to_cart`: Redireciona para carrinho
- `redirect_to_products`: Redireciona para produtos
- `redirect_to_checkout`: Redireciona para checkout

### **✨ Extras (Extra Tools)**
- `get_store_hours`: Horários de funcionamento
- `get_promotions`: Promoções ativas
- `get_contact_info`: Informações de contato

## 🔄 Fluxo de Interação

1. **Usuário envia mensagem** → Chat component
2. **Processamento IA** → Agente analisa intenção
3. **Seleção de ferramenta** → Agente escolhe tool apropriada
4. **Execução** → Tool executa ação (API call, busca, etc.)
5. **Resposta** → Agente formula resposta natural
6. **Atualização UI** → Interface reflete mudanças

## 🎯 Casos de Uso Principais

### **Busca Inteligente**
```
Usuário: "Preciso de algo para dor de cabeça"
Agente: Busca produtos → Sugere Aspirina, Benuron, etc.
```

### **Gerenciamento de Carrinho**
```
Usuário: "Adiciona 2 Benuron"
Agente: add_to_cart → Incrementa quantidade
```

### **Consulta Específica**
```
Usuário: "Quero exatamente 4 Aspirinas no total"
Agente: set_cart_quantity → Define quantidade exata
```

## 🔧 Configuração Técnica

### **Modelos LLM Suportados**
- OpenRouter com GPT-4 (principal)
- Anthropic Claude (fallback)
- Google Gemini (fallback)

### **Banco de Dados**
- PostgreSQL com Prisma ORM
- Tabelas: User, Product, Cart, CartItem, Order

### **Autenticação**
- JWT tokens
- Sessões para usuários não autenticados
- Sincronização automática de carrinho

## 🔧 Organização das Tools com Zod

### **Estrutura Modular das Tools**

O sistema de ferramentas do agente IA está organizado de forma modular, com cada categoria de funcionalidade em arquivos separados:

```
src/lib/ai-agent/actions/
├── cart.ts          # Ferramentas de carrinho
├── products.ts      # Ferramentas de produtos
├── checkout.ts      # Ferramentas de checkout
├── budget.ts        # Ferramentas de orçamento
├── navigation.ts    # Ferramentas de navegação
└── extras.ts        # Ferramentas extras
```

### **Validação com Zod Schema**

Cada tool é definida usando o padrão do **Vercel AI SDK** com validação **Zod**:

```typescript
import { tool } from "ai";
import { z } from "zod";

export const exemploTool = tool({
  description: "Descrição clara da funcionalidade",
  inputSchema: z.object({
    parametro1: z.string().describe("Descrição do parâmetro"),
    parametro2: z.number().min(1).max(50).describe("Número entre 1-50"),
    parametro3: z.enum(["opcao1", "opcao2"]).describe("Opções válidas"),
    parametro4: z.string().optional().describe("Parâmetro opcional"),
  }),
  execute: async ({ parametro1, parametro2, parametro3, parametro4 }) => {
    // Lógica da ferramenta
    return {
      success: true,
      message: "Resultado da operação",
      data: { /* dados retornados */ }
    };
  },
});
```

### **Tipos de Validação Zod Utilizados**

#### **Strings**
```typescript
z.string()                           // String obrigatória
z.string().optional()                // String opcional
z.string().min(3)                    // Mínimo 3 caracteres
z.string().describe("Descrição")     // Com descrição para IA
```

#### **Números**
```typescript
z.number()                           // Número obrigatório
z.number().min(1)                    // Mínimo 1
z.number().max(50)                   // Máximo 50
z.number().min(1).max(50).default(15) // Com valor padrão
```

#### **Enums (Opções Limitadas)**
```typescript
z.enum(["cart", "checkout"])         // Apenas valores específicos
z.enum(["add", "remove", "update"])  // Operações permitidas
```

#### **Arrays**
```typescript
z.array(z.string())                  // Array de strings
z.array(z.string()).min(1).max(15)   // Array com 1-15 itens
```

#### **Objetos Vazios**
```typescript
z.object({})                         // Para tools sem parâmetros
```

### **Exemplo Prático: Tool de Carrinho**

```typescript
export const addToCartTool = tool({
  description: "Adiciona um produto ao carrinho de compras. Se o produto já existe no carrinho, INCREMENTA a quantidade existente.",
  inputSchema: z.object({
    productId: z.string().describe("ID ou nome do produto a ser adicionado (ex: 'cmfb675a10002vb7gsu4jeaf8' ou 'Aspirina Express')"),
    quantity: z.number().min(1).describe("Quantidade do produto"),
  }),
  execute: async ({ productId, quantity }) => {
    // 1. Validação automática dos parâmetros pelo Zod
    // 2. Lógica de negócio
    // 3. Retorno padronizado
    return {
      success: true,
      message: `✅ ${productName} adicionado ao carrinho`,
      data: { cartItem, cartTotal }
    };
  },
});
```

### **Benefícios da Validação Zod**

#### **1. Validação Automática**
- **Tipos**: Garante que strings sejam strings, números sejam números
- **Limites**: Valida min/max automaticamente
- **Obrigatórios**: Impede execução sem parâmetros necessários

#### **2. Documentação Integrada**
- **Descrições**: Cada parâmetro tem descrição clara para a IA
- **Exemplos**: Fornece exemplos de uso nos describes
- **Contexto**: IA entende exatamente o que cada tool faz

#### **3. Segurança**
- **Sanitização**: Remove dados inválidos automaticamente
- **Prevenção**: Evita ataques de injeção
- **Consistência**: Garante formato padronizado

#### **4. Experiência do Desenvolvedor**
- **TypeScript**: Tipos automáticos gerados
- **IntelliSense**: Autocompletar nos parâmetros
- **Debugging**: Erros claros de validação

### **Agregação das Tools**

No arquivo principal (`index.ts`), todas as tools são combinadas:

```typescript
import { cartTools } from "./actions/cart";
import { productTools } from "./actions/products";
import { checkoutTools } from "./actions/checkout";
// ... outras imports

// Combinar todas as tools
export const allTools = {
  ...cartTools,        // add_to_cart, remove_from_cart, etc.
  ...productTools,     // search_products, get_product_details, etc.
  ...checkoutTools,    // initiate_checkout, etc.
  ...navigationTools,  // redirect_to_page, etc.
  ...budgetTools,      // calculate_budget, etc.
  ...extraTools,       // help, etc.
};
```

### **Fluxo de Execução**

1. **IA recebe mensagem** do usuário
2. **Analisa intenção** e seleciona tool apropriada
3. **Zod valida** parâmetros automaticamente
4. **Tool executa** lógica de negócio
5. **Retorna resultado** padronizado
6. **IA processa** resposta e gera texto natural

### **Tratamento de Erros**

```typescript
execute: async ({ productId, quantity }) => {
  try {
    // Lógica da tool
    return { success: true, message: "Sucesso", data: result };
  } catch (error) {
    logger.error("Erro na tool", { error, productId, quantity });
    return { 
      success: false, 
      message: "Erro interno. Tente novamente.",
      error: error.message 
    };
  }
}
```

Este sistema garante **robustez**, **segurança** e **facilidade de manutenção** para todas as funcionalidades do agente IA.

## 📁 Estrutura de Código

```
src/lib/ai-agent/
├── actions/          # Ferramentas modulares
│   ├── cart.ts       # Operações de carrinho
│   ├── products.ts   # Busca e detalhes de produtos
│   ├── checkout.ts   # Finalização de compras
│   └── ...
├── config/           # Configuração LLM
├── context/          # Gerenciamento de contexto
└── index.ts          # Agente principal
```

## 🚀 Como Usar

### **Desenvolvimento**
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run test         # Executa testes
npm run build        # Build para produção
```

### **Testando o Agente**
```bash
node scripts/test-chat.js          # Teste básico
node scripts/test-complete-flow.js # Fluxo completo
```

## 🔍 Debugging

- Logs detalhados em desenvolvimento
- Ferramentas de debug em `scripts/`
- Monitoramento de performance integrado
- Sistema de fallback para alta disponibilidade

---

**💡 Dica**: O agente foi projetado para ser modular e extensível. Novas ferramentas podem ser facilmente adicionadas seguindo o padrão existente.