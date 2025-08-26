# Solução para Cold Start - Farmácia Vanaci

Este documento explica como resolver problemas de cold start na aplicação Next.js hospedada no Vercel quando integrada com n8n.

## Problema

Aplicações serverless no Vercel podem entrar em "hibernação" após períodos de inatividade, causando:
- Timeouts nas requisições do n8n
- Mensagens de "offline" ou "connection refused"
- Demora na primeira resposta (cold start)

## Soluções Implementadas

### 1. Endpoint de Warmup

**Arquivo:** `src/app/api/warmup/route.ts`

Endpoint dedicado para "aquecer" a aplicação:
```
GET/POST https://vanaci-task-2.vercel.app/api/warmup
```

### 2. Nó de Warmup no Workflow n8n

O workflow agora inclui um nó "Warmup App" que:
- Executa antes de qualquer operação
- Faz uma requisição para o endpoint de warmup
- Garante que a aplicação esteja "aquecida"

### 3. Configurações de Timeout e Retry

Todos os HTTP requests no workflow n8n foram configurados com:
- **Timeout:** 60 segundos
- **Retry:** 5 tentativas com delay de 3 segundos
- **Allow Unauthorized Certs:** true

### 4. Script de Keep-Warm

**Arquivo:** `scripts/keep-warm.js`

Script que mantém a aplicação aquecida fazendo requisições periódicas:

```bash
# Executar o script de keep-warm
npm run keep-warm

# Para desenvolvimento (com auto-reload)
npm run keep-warm:dev
```

## Como Usar

### Opção 1: Automática (Recomendada)
O workflow n8n já inclui o nó de warmup. Nenhuma ação adicional é necessária.

### Opção 2: Script Manual
Para manter a aplicação sempre aquecida:

```bash
# Instalar dependências (se necessário)
npm install

# Executar script de keep-warm
npm run keep-warm
```

### Opção 3: Monitoramento Externo
Configure um serviço de monitoramento (como UptimeRobot, Pingdom) para fazer ping no endpoint:
```
https://vanaci-task-2.vercel.app/api/warmup
```

## Configurações do Workflow n8n

### URLs Atualizadas
Todas as URLs foram atualizadas para usar o domínio do Vercel:
- `https://vanaci-task-2.vercel.app/api/products`
- `https://vanaci-task-2.vercel.app/api/cart`
- `https://vanaci-task-2.vercel.app/api/checkout`
- `https://vanaci-task-2.vercel.app/api/navigation`
- `https://vanaci-task-2.vercel.app/api/cart/remove`

### Configurações de Resiliência
```json
{
  "options": {
    "allowUnauthorizedCerts": true,
    "timeout": 60000,
    "retry": {
      "count": 5,
      "delay": 3000
    }
  }
}
```

## Monitoramento

### Logs do Warmup
O endpoint de warmup retorna informações úteis:
```json
{
  "status": "ok",
  "message": "Application warmed up successfully",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 123.456
}
```

### Script de Keep-Warm
O script exibe logs detalhados:
```
🔥 Warming up application at 2024-01-20T10:30:00.000Z
✅ /api/warmup - Status: 200 - Duration: 245ms
✅ /api/products - Status: 200 - Duration: 189ms
📊 Warmup completed: 4/4 endpoints successful
```

## Troubleshooting

### Se ainda houver timeouts:
1. Verifique se o endpoint de warmup está funcionando
2. Aumente o timeout no n8n (máximo recomendado: 120 segundos)
3. Execute o script de keep-warm em background
4. Configure monitoramento externo

### Verificar status da aplicação:
```bash
curl https://vanaci-task-2.vercel.app/api/warmup
```

### Logs do Vercel:
Acesse o dashboard do Vercel para verificar logs de erro.

## Considerações de Performance

- O script de keep-warm faz requisições a cada 5 minutos
- Cada warmup testa 4 endpoints principais
- O nó de warmup adiciona ~1-2 segundos ao workflow
- Configurações de retry podem aumentar o tempo total em caso de falhas

## Alternativas Futuras

1. **Vercel Pro:** Reduz significativamente cold starts
2. **Serverless Functions com Warm-up:** Configuração avançada
3. **Edge Functions:** Para latência ainda menor
4. **Dedicated Server:** Para aplicações críticas