# N8N Workflow Documentation - Farmácia Vanaci

## Visão Geral

Este workflow implementa um sistema de chat inteligente para a Farmácia Vanaci, onde um **Main AI Agent** atua como coordenador central, delegando tarefas para agentes especializados através de ferramentas HTTP.

## Arquitetura do Sistema

### URL de Produção
- **Frontend/Backend**: https://vanaci-task-2.vercel.app
- **API Base**: https://vanaci-task-2.vercel.app/api

### Fluxo de Coordenação

```
Cliente → Webhook → Process Input → Main AI Agent → Agentes Especializados → Resposta
```

## Componentes do Workflow

### 1. Webhook (Entrada)
- **Endpoint**: `/chat`
- **Método**: POST
- **Função**: Recebe mensagens do cliente
- **Parâmetros esperados**:
  - `message`: Mensagem do cliente
  - `chatHistory`: Histórico da conversa (opcional)
  - `sessionId`: ID da sessão (opcional, gerado automaticamente se não fornecido)

### 2. Process Input (Processamento)
- **Função**: Processa a entrada e prepara o contexto
- **Gera**:
  - Session ID único
  - System prompt para o Main AI Agent
  - Configurações base da API

### 3. Simple Memory (Memória)
- **Tipo**: Buffer Window Memory
- **Tamanho**: 10 mensagens
- **Função**: Mantém contexto da conversa por sessão

### 4. Main AI Agent (Coordenador Central)

#### Responsabilidades:
- **Análise de Intenção**: Entende o que o cliente quer
- **Delegação**: Escolhe qual agente especializado usar
- **Coordenação**: Mantém o fluxo da conversa
- **Síntese**: Combina respostas dos agentes em comunicação natural

#### Diretrizes de Coordenação:
- Determinar intenção do cliente antes de selecionar ferramentas
- Usar agentes apropriados para seus domínios específicos
- Manter tom profissional e empático
- Sintetizar respostas dos agentes em fluxo natural de conversa

## Agentes Especializados (Ferramentas)

### 1. ProductSearchTool - Agente de Descoberta de Produtos

**Especialização**: Descoberta e informações de produtos

**Responsabilidades**:
- Buscas de produtos
- Verificações de disponibilidade
- Consultas de preços
- Especificações detalhadas de produtos

**Quando Usar**:
- Cliente pergunta sobre medicamentos
- Consultas de preços
- Verificação de disponibilidade
- Detalhes de produtos

**Endpoint**: `GET https://vanaci-task-2.vercel.app/api/products`
**Parâmetros**:
- `search`: Termo de busca ou nome do produto

### 2. CartManagementTool - Agente de Gerenciamento de Carrinho

**Especialização**: Operações de carrinho de compras

**Responsabilidades**:
- Adicionar itens ao carrinho
- Remover itens do carrinho
- Atualizar quantidades
- Visualizar conteúdo do carrinho
- Gerenciar estado do carrinho por sessão

**Quando Usar**:
- Cliente quer modificar carrinho
- Verificar status atual do carrinho
- Qualquer operação relacionada ao carrinho

**Endpoint**: `POST https://vanaci-task-2.vercel.app/api/cart/{action}`
**Parâmetros**:
- `productId`: ID do produto
- `quantity`: Quantidade
- `sessionId`: ID da sessão
- `action`: Operação (add, remove, update, view)

### 3. CheckoutTool - Agente de Processamento de Pedidos

**Especialização**: Finalização de pedidos e checkout

**Responsabilidades**:
- Finalização de pedidos
- Processamento de pagamento
- Confirmação de pedidos
- Validação de informações do cliente
- Geração de confirmações de pedido

**Quando Usar**:
- Cliente pronto para finalizar compra
- Processamento de checkout completo

**Endpoint**: `POST https://vanaci-task-2.vercel.app/api/checkout`
**Parâmetros**:
- `sessionId`: ID da sessão
- `customerInfo`: Informações do cliente
- `paymentMethod`: Método de pagamento

## Fluxo de Conversação

### Exemplo de Interação:

1. **Cliente**: "Preciso de um remédio para dor de cabeça"
2. **Main AI Agent**: Analisa → Identifica busca de produto
3. **ProductSearchTool**: Busca produtos relacionados a dor de cabeça
4. **Main AI Agent**: Sintetiza resposta com opções de medicamentos
5. **Cliente**: "Quero adicionar o Aspirina ao carrinho"
6. **Main AI Agent**: Analisa → Identifica operação de carrinho
7. **CartManagementTool**: Adiciona Aspirina ao carrinho
8. **Main AI Agent**: Confirma adição e pergunta sobre finalização

## Diretrizes Médicas

### Disclaimers Importantes:
- Não pode diagnosticar condições
- Não pode prescrever medicamentos
- Sempre recomendar consulta com profissionais de saúde
- Para medicamentos controlados, consultar farmacêuticos licenciados
- Em emergências, direcionar para serviços de emergência

## Configuração de Sessão

### Session ID:
- Formato: `session_{timestamp}_{random}`
- Usado para manter estado do carrinho
- Persiste durante toda a conversa

### Memória de Contexto:
- Mantém últimas 10 mensagens
- Preserva contexto da conversa
- Permite referências a interações anteriores

## Monitoramento e Logs

### Pontos de Monitoramento:
- Entrada do webhook
- Chamadas para agentes especializados
- Respostas dos endpoints da API
- Erros de processamento

### Métricas Importantes:
- Taxa de sucesso das chamadas API
- Tempo de resposta dos agentes
- Satisfação do cliente
- Conversões de carrinho para checkout

## Manutenção

### Atualizações de URL:
- Todas as URLs apontam para produção: `https://vanaci-task-2.vercel.app`
- Facilmente configurável através do `baseUrl` no Process Input

### Escalabilidade:
- Cada agente especializado pode ser otimizado independentemente
- Fácil adição de novos agentes especializados
- Sistema modular permite manutenção isolada

Este sistema garante uma experiência de chat inteligente e coordenada, onde cada agente especializado foca em sua área de expertise, enquanto o Main AI Agent mantém a coerência e fluidez da conversa.