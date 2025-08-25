# Configuração de Variáveis de Ambiente

## Variáveis Adicionadas

As seguintes variáveis de ambiente foram adicionadas ao arquivo `.env` para centralizar a configuração da integração com n8n:

### N8N_WEBHOOK_URL
```
N8N_WEBHOOK_URL="http://localhost:5678/webhook/pharmacy-chat"
```
- **Uso**: Configuração do servidor (backend)
- **Descrição**: URL do webhook n8n para integração do chat

### NEXT_PUBLIC_N8N_WEBHOOK_URL
```
NEXT_PUBLIC_N8N_WEBHOOK_URL="http://localhost:5678/webhook/pharmacy-chat"
```
- **Uso**: Configuração do cliente (frontend)
- **Descrição**: URL do webhook n8n acessível pelo navegador
- **Nota**: Prefixo `NEXT_PUBLIC_` torna a variável disponível no frontend

## Componentes Atualizados

Os seguintes componentes foram atualizados para usar as variáveis de ambiente:

### 1. `src/components/n8n-chat-integration.tsx`
- **Antes**: URL hardcoded `'http://localhost:5678/webhook/pharmacy-chat'`
- **Depois**: `process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/pharmacy-chat'`

### 2. `src/components/chat.tsx`
- **Antes**: URL hardcoded `'http://localhost:5678/webhook/pharmacy-chat'`
- **Depois**: `process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/pharmacy-chat'`

## Vantagens da Configuração

✅ **Flexibilidade**: Fácil mudança entre ambientes (dev, staging, prod)
✅ **Segurança**: URLs sensíveis não ficam hardcoded no código
✅ **Manutenção**: Configuração centralizada no arquivo `.env`
✅ **Deploy**: Diferentes URLs para diferentes ambientes

## Como Usar

### Desenvolvimento Local
1. Certifique-se de que o n8n está rodando em `localhost:5678`
2. Importe o workflow `n8n-pharmacy-chat-workflow.json`
3. As URLs já estão configuradas para desenvolvimento local

### Produção
1. Atualize as variáveis no `.env` com as URLs de produção:
```
N8N_WEBHOOK_URL="https://seu-n8n-prod.com/webhook/pharmacy-chat"
NEXT_PUBLIC_N8N_WEBHOOK_URL="https://seu-n8n-prod.com/webhook/pharmacy-chat"
```

### Staging/Outros Ambientes
1. Crie arquivos `.env.staging`, `.env.production`, etc.
2. Configure as URLs apropriadas para cada ambiente

## Troubleshooting

### Problema: Chat não conecta
**Solução**:
1. Verifique se as variáveis estão definidas no `.env`
2. Reinicie o servidor Next.js após alterar variáveis
3. Confirme se o n8n está rodando na URL configurada

### Problema: Variável não carrega
**Solução**:
1. Variáveis do frontend devem ter prefixo `NEXT_PUBLIC_`
2. Reinicie o servidor após mudanças no `.env`
3. Verifique se não há espaços ou caracteres especiais

---

**Nota**: Sempre reinicie o servidor de desenvolvimento após alterar variáveis de ambiente para garantir que sejam carregadas corretamente.