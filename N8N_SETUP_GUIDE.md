# 🚀 Guia de Configuração do n8n - Farmácia Vanaci

Este guia explica como configurar e usar o workflow avançado do n8n para o chat da Farmácia Vanaci.

## 📋 Pré-requisitos

### 1. Instalação do n8n
```bash
# Opção 1: Via npm (recomendado para desenvolvimento)
npm install -g n8n

# Opção 2: Via Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# Opção 3: Via npx (sem instalação global)
npx n8n
```

### 2. Configuração do Mistral LLM

**Importante**: Você precisa de uma API key do Mistral AI.

1. Acesse [https://console.mistral.ai/](https://console.mistral.ai/)
2. Crie uma conta e gere uma API key
3. Configure a credencial no n8n (explicado abaixo)

## 🔧 Configuração Passo a Passo

### Passo 1: Iniciar o n8n

```bash
# Inicie o n8n
n8n start

# Ou com Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

Acesse: `http://localhost:5678`

### Passo 2: Configurar Credenciais

1. **Mistral AI Credentials**:
   - Vá em `Settings` → `Credentials`
   - Clique em `Add Credential`
   - Selecione `Mistral AI`
   - Insira sua API Key
   - Salve como `Mistral_Farmacia`

### Passo 3: Importar o Workflow

1. No n8n, clique em `Import from File`
2. Selecione o arquivo `n8n-pharmacy-chat-workflow.json`
3. O workflow será importado com todos os nós configurados

### Passo 4: Configurar Conexões

#### 4.1 Configurar o Main AI Agent
1. Clique no nó `Main AI Agent`
2. Em `Credentials`, selecione `Mistral_Farmacia`
3. Verifique se o modelo está definido como `mistral-large-latest`

#### 4.2 Configurar HTTP Requests
Todos os nós HTTP já estão configurados para:
- Base URL: `http://localhost:3000/api`
- Headers apropriados
- Métodos corretos (GET, POST, PUT, DELETE)

#### 4.3 Configurar Simple Memory
O nó `Simple Memory` já está configurado com:
- Buffer Size: 10 mensagens
- Session Key: `{{$json.sessionId}}`

### Passo 5: Ativar o Workflow

1. Clique no botão `Active` no canto superior direito
2. O webhook estará disponível em: `http://localhost:5678/webhook/pharmacy-chat`

## 🧪 Testando o Workflow

### Teste 1: Via Postman/Insomnia

```json
POST http://localhost:5678/webhook/pharmacy-chat
Content-Type: application/json

{
  "message": "Preciso de dipirona",
  "sessionId": "test_session_123",
  "chatHistory": []
}
```

### Teste 2: Via Frontend

1. Certifique-se de que o Next.js está rodando (`npm run dev`)
2. Acesse: `http://localhost:3000/n8n-chat`
3. Teste os comandos de exemplo

## 🔍 Estrutura do Workflow

### Nós Principais:

1. **Webhook** (`pharmacy-chat-webhook`)
   - Recebe mensagens do frontend
   - URL: `/webhook/pharmacy-chat`

2. **Process Input** (`process-input`)
   - Extrai `message`, `sessionId` e `chatHistory`
   - Valida entrada

3. **Main AI Agent** (`main-ai-agent`)
   - Orquestrador principal
   - Usa Mistral LLM
   - Gerencia ferramentas especializadas

4. **Simple Memory** (`simple-memory`)
   - Mantém contexto da conversa
   - Buffer de 10 mensagens

5. **Ferramentas Especializadas**:
   - `ProductSearchTool`: Busca produtos
   - `CartManagementTool`: Gerencia carrinho
   - `CheckoutTool`: Finaliza compras

### Fluxo de Dados:

```
Webhook → Process Input → Main AI Agent ↔ Simple Memory
                              ↓
                         Ferramentas:
                         • ProductSearchTool
                         • CartManagementTool  
                         • CheckoutTool
                              ↓
                         API Endpoints
```

## 🛠️ Configurações Avançadas

### Personalizar Prompts

Você pode editar os prompts nos nós de ferramentas:

1. **ProductSearchTool**: Modifique como o agente interpreta buscas
2. **CartManagementTool**: Ajuste validações de carrinho
3. **CheckoutTool**: Customize processo de checkout

### Adicionar Novas Ferramentas

1. Crie um novo nó `Code`
2. Implemente a lógica da ferramenta
3. Adicione ao array de ferramentas do `Main AI Agent`

### Configurar Logs

Para debug, adicione nós `Set` para capturar dados:

```javascript
// Exemplo de log
return {
  timestamp: new Date().toISOString(),
  sessionId: $json.sessionId,
  message: $json.message,
  response: $json.response
};
```

## 🚨 Troubleshooting

### Problema: Webhook não responde
**Solução**:
1. Verifique se o workflow está ativo
2. Confirme a URL do webhook
3. Verifique logs do n8n

### Problema: Erro de credencial Mistral
**Solução**:
1. Verifique se a API key está correta
2. Confirme se há créditos na conta Mistral
3. Teste a credencial em um nó simples

### Problema: API endpoints não funcionam
**Solução**:
1. Certifique-se de que o Next.js está rodando
2. Verifique se as URLs estão corretas
3. Confirme se os endpoints existem

### Problema: Memory não mantém contexto
**Solução**:
1. Verifique se o `sessionId` está sendo passado
2. Confirme a configuração do Simple Memory
3. Verifique se o buffer size está adequado

## 📊 Monitoramento

### Métricas Importantes:

1. **Taxa de Sucesso**: % de mensagens processadas com sucesso
2. **Tempo de Resposta**: Latência média das respostas
3. **Uso de Tokens**: Consumo da API Mistral
4. **Sessões Ativas**: Número de usuários simultâneos

### Logs Úteis:

```javascript
// No nó Process Input
console.log('Received message:', $json.message);
console.log('Session ID:', $json.sessionId);

// No Main AI Agent
console.log('AI Response:', $json.response);
console.log('Tools used:', $json.toolsUsed);
```

## 🔄 Atualizações e Manutenção

### Backup do Workflow

1. Exporte regularmente o workflow
2. Mantenha versões em controle de versão
3. Documente mudanças importantes

### Atualizações de Dependências

```bash
# Atualizar n8n
npm update -g n8n

# Verificar versão
n8n --version
```

### Otimizações

1. **Cache**: Implemente cache para buscas frequentes
2. **Rate Limiting**: Configure limites de requisições
3. **Error Handling**: Melhore tratamento de erros

## 📚 Recursos Adicionais

- [Documentação oficial do n8n](https://docs.n8n.io/)
- [Mistral AI Documentation](https://docs.mistral.ai/)
- [n8n Community](https://community.n8n.io/)
- [Workflow Templates](https://n8n.io/workflows/)

## 🎯 Próximos Passos

1. **Implementar Analytics**: Adicionar tracking de conversas
2. **Melhorar NLP**: Treinar modelos específicos para farmácia
3. **Integrar CRM**: Conectar com sistema de clientes
4. **Mobile App**: Criar app mobile com o chat
5. **Voice Interface**: Adicionar suporte a voz

---

**Suporte**: Para dúvidas sobre este workflow, consulte a documentação ou abra uma issue no repositório.

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2025