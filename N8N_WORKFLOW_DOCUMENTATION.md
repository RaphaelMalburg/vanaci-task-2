# Farmácia Vanaci - Workflow n8n Avançado

## Visão Geral

Este workflow n8n implementa um assistente de IA avançado para a Farmácia Vanaci, utilizando múltiplos agentes especializados para gerenciar diferentes aspectos do e-commerce farmacêutico.

## Arquitetura do Workflow

### Componentes Principais

1. **Webhook Principal** - Recebe mensagens do chat
2. **Process Input** - Processa entrada e gera sessionId
3. **Main AI Agent** - Agente principal com Mistral LLM
4. **Simple Memory** - Memória de 10 mensagens por sessão
5. **Agentes Especializados** - Tools para funcionalidades específicas

### Agentes Especializados (Tools)

#### 1. ProductSearchTool
**Função:** Buscar e consultar produtos no banco de dados

**Parâmetros:**
- `query` (string, obrigatório) - Termo de busca ou nome do produto
- `productId` (string, opcional) - ID específico do produto
- `sessionId` (string, obrigatório) - ID da sessão do cliente

**Endpoints utilizados:**
- `GET /api/products` - Lista todos os produtos
- `GET /api/products/[id]` - Detalhes de produto específico

**Exemplos de uso:**
- "Busque por dipirona"
- "Mostre detalhes do produto ID 123"
- "Quais medicamentos para dor de cabeça vocês têm?"

#### 2. CartManagementTool
**Função:** Gerenciar operações do carrinho de compras

**Parâmetros:**
- `action` (string, obrigatório) - Ação: 'add', 'remove', 'update', 'get'
- `productId` (string) - ID do produto
- `quantity` (number) - Quantidade de itens
- `sessionId` (string, obrigatório) - ID da sessão do cliente

**Endpoints utilizados:**
- `GET /api/cart?sessionId=xxx` - Obter carrinho
- `POST /api/cart` - Adicionar item
- `PUT /api/cart` - Atualizar quantidade
- `DELETE /api/cart` - Remover item

**Exemplos de uso:**
- "Adicione 2 unidades de dipirona ao carrinho"
- "Remova o paracetamol do carrinho"
- "Mostre o que está no meu carrinho"
- "Atualize a quantidade de vitamina C para 3"

#### 3. CheckoutTool
**Função:** Processar checkout e finalização de pedidos

**Parâmetros:**
- `action` (string, obrigatório) - Ação: 'checkout' ou 'status'
- `sessionId` (string, obrigatório) - ID da sessão do cliente
- `orderId` (string, opcional) - ID do pedido para consulta de status

**Endpoints utilizados:**
- `POST /api/cart/checkout` - Finalizar compra
- `GET /api/cart/checkout?orderId=xxx&sessionId=xxx` - Status do pedido

**Exemplos de uso:**
- "Finalizar compra"
- "Qual o status do meu pedido?"
- "Processar checkout"

## Configuração do Workflow

### 1. Importar o Workflow

```bash
# Copie o conteúdo do arquivo n8n-pharmacy-chat-workflow.json
# Cole no n8n através de: Menu > Import from JSON
```

### 2. Configurar Credenciais

**Mistral Cloud API:**
- Acesse as configurações do node "Mistral Cloud Chat Model"
- Configure suas credenciais da API Mistral
- Nome da credencial: "Mistral Cloud account"

### 3. Configurar URLs

**Base URL da API:**
- O workflow está configurado para `http://localhost:3000/api`
- Ajuste conforme necessário nos nodes de implementação

### 4. Ativar o Workflow

- Clique em "Active" no canto superior direito
- O webhook estará disponível em: `[n8n-url]/webhook/pharmacy-chat`

## Uso do Webhook

### Endpoint
```
POST [n8n-url]/webhook/pharmacy-chat
```

### Formato da Requisição
```json
{
  "message": "Olá, preciso de ajuda para encontrar um medicamento",
  "sessionId": "session_123456789",
  "chatHistory": [
    {
      "role": "user",
      "content": "Mensagem anterior"
    },
    {
      "role": "assistant",
      "content": "Resposta anterior"
    }
  ]
}
```

### Formato da Resposta
```json
{
  "response": "Olá! Sou o assistente da Farmácia Vanaci. Como posso ajudá-lo hoje?",
  "sessionId": "session_123456789",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "success"
}
```

## Exemplos de Conversação

### Busca de Produtos
```
Usuário: "Preciso de um remédio para dor de cabeça"
Assistente: [Usa ProductSearchTool] "Encontrei alguns medicamentos para dor de cabeça: Dipirona 500mg (R$ 8,90), Paracetamol 750mg (R$ 6,50)..."
```

### Gerenciamento do Carrinho
```
Usuário: "Adicione 2 caixas de dipirona ao carrinho"
Assistente: [Usa CartManagementTool] "Perfeito! Adicionei 2 unidades de Dipirona 500mg ao seu carrinho. Total atual: R$ 17,80"
```

### Finalização de Compra
```
Usuário: "Quero finalizar minha compra"
Assistente: [Usa CheckoutTool] "Seu pedido foi finalizado com sucesso! ID do pedido: ORD_789123. Total: R$ 17,80"
```

## Recursos Avançados

### Gerenciamento de Sessão
- Cada cliente recebe um `sessionId` único
- A memória mantém contexto de 10 mensagens por sessão
- O carrinho é vinculado ao `sessionId`

### Tratamento de Erros
- Validação de estoque antes de adicionar ao carrinho
- Mensagens de erro amigáveis para problemas de API
- Fallback para respostas genéricas em caso de falha

### Disclaimers Médicos
- Lembretes automáticos sobre consulta a profissionais
- Avisos sobre medicamentos controlados
- Direcionamento para emergências quando necessário

## Monitoramento e Logs

### Execuções do Workflow
- Acesse "Executions" no n8n para ver histórico
- Monitore falhas e tempos de resposta
- Analise uso dos diferentes tools

### Métricas Importantes
- Taxa de sucesso das chamadas de API
- Tempo médio de resposta
- Uso de cada agente especializado
- Conversões de carrinho para checkout

## Troubleshooting

### Problemas Comuns

1. **API não responde**
   - Verifique se o servidor Next.js está rodando
   - Confirme a URL base nos nodes de implementação

2. **Credenciais Mistral inválidas**
   - Verifique a configuração da API key
   - Teste a conexão no node Mistral

3. **SessionId não mantido**
   - Verifique a configuração da Simple Memory
   - Confirme o template de sessionId

4. **Tools não funcionam**
   - Verifique as conexões entre nodes
   - Confirme os schemas de input dos tools

### Logs de Debug

```javascript
// Adicione nos nodes de implementação para debug
console.log('Tool Input:', toolInput);
console.log('API Response:', result);
```

## Extensões Futuras

### Possíveis Melhorias

1. **Agente de Recomendações**
   - Sugestões baseadas em histórico
   - Produtos relacionados

2. **Agente de Prescrições**
   - Validação de receitas
   - Controle de medicamentos

3. **Agente de Entrega**
   - Cálculo de frete
   - Rastreamento de pedidos

4. **Integração com Pagamento**
   - Processamento de cartões
   - PIX e outros métodos

## 📁 Arquivos Relacionados

- `n8n-pharmacy-chat-workflow.json` - Arquivo do workflow para importação
- `N8N_SETUP_GUIDE.md` - Guia completo de configuração do n8n
- `API_DOCUMENTATION.md` - Documentação completa dos endpoints
- `/src/app/api/` - Implementação dos endpoints da API
- `/src/components/n8n-chat-integration.tsx` - Componente React para integração
- `/src/app/n8n-chat/page.tsx` - Página de demonstração do chat

## 🚀 Como Usar

### 1. Configuração do n8n

**Para configuração detalhada, consulte: `N8N_SETUP_GUIDE.md`**

1. Instale o n8n: `npm install -g n8n`
2. Inicie o n8n: `n8n start`
3. Acesse: `http://localhost:5678`
4. Importe o workflow: `n8n-pharmacy-chat-workflow.json`
5. Configure as credenciais do Mistral AI
6. Ative o workflow

### 2. Teste via Frontend

**Componente pronto disponível em: `/src/components/n8n-chat-integration.tsx`**

1. Acesse a página de demonstração: `http://localhost:3000/n8n-chat`
2. Ou use o componente `N8nChatIntegration` em sua aplicação:

```typescript
import { N8nChatIntegration } from '@/components/n8n-chat-integration';

// Uso básico
<N8nChatIntegration 
  n8nWebhookUrl="http://localhost:5678/webhook/pharmacy-chat"
/>
```

## Suporte

Para dúvidas sobre o workflow:
1. Consulte os logs de execução no n8n
2. Verifique a documentação da API (API_DOCUMENTATION.md)
3. Teste os endpoints individualmente
4. Analise as respostas dos tools nos logs

---

**Nota:** Este workflow requer que a aplicação Next.js esteja rodando em `http://localhost:3000` com todos os endpoints da API funcionais.