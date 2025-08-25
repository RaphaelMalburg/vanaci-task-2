# API Documentation - Farmácia Vanaci

Esta documentação descreve os endpoints da API disponíveis para integração com n8n e outros sistemas externos.

## Base URL
```
http://localhost:3000/api
```

## Autenticação
Atualmente não há autenticação implementada. Todos os endpoints são públicos.

## Endpoints

### 1. Produtos

#### Listar todos os produtos
```http
GET /api/products
```

**Resposta:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": number,
    "category": "string",
    "stock": number,
    "imagePath": "string|null",
    "prescription": boolean,
    "manufacturer": "string",
    "rating": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### Obter produto específico
```http
GET /api/products/{id}
```

**Parâmetros:**
- `id` (string): ID do produto

**Resposta:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "stock": number,
  "imagePath": "string|null",
  "prescription": boolean,
  "manufacturer": "string",
  "rating": number,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### 2. Carrinho

#### Obter carrinho
```http
GET /api/cart?sessionId={sessionId}
```

**Parâmetros:**
- `sessionId` (string): ID da sessão do usuário

**Resposta:**
```json
{
  "sessionId": "string",
  "items": [
    {
      "id": "string",
      "name": "string",
      "price": number,
      "imagePath": "string|null",
      "category": "string",
      "quantity": number
    }
  ],
  "total": number
}
```

#### Adicionar item ao carrinho
```http
POST /api/cart
```

**Body:**
```json
{
  "sessionId": "string",
  "productId": "string",
  "quantity": number (opcional, padrão: 1)
}
```

**Resposta:**
```json
{
  "message": "Item adicionado ao carrinho",
  "cart": {
    "sessionId": "string",
    "items": [...],
    "total": number
  }
}
```

#### Atualizar quantidade de item
```http
PUT /api/cart
```

**Body:**
```json
{
  "sessionId": "string",
  "productId": "string",
  "quantity": number
}
```

**Resposta:**
```json
{
  "message": "Carrinho atualizado",
  "cart": {
    "sessionId": "string",
    "items": [...],
    "total": number
  }
}
```

#### Remover item do carrinho
```http
DELETE /api/cart?sessionId={sessionId}&productId={productId}
```

**Parâmetros:**
- `sessionId` (string): ID da sessão do usuário
- `productId` (string): ID do produto a ser removido

**Resposta:**
```json
{
  "message": "Item removido do carrinho",
  "cart": {
    "sessionId": "string",
    "items": [...],
    "total": number
  }
}
```

#### Limpar carrinho
```http
POST /api/cart/clear
```

**Body:**
```json
{
  "sessionId": "string"
}
```

**Resposta:**
```json
{
  "message": "Carrinho limpo com sucesso",
  "cart": {
    "sessionId": "string",
    "items": [],
    "total": 0
  }
}
```

### 3. Checkout

#### Finalizar compra
```http
POST /api/cart/checkout
```

**Body:**
```json
{
  "sessionId": "string",
  "customerInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  }
}
```

**Resposta:**
```json
{
  "message": "Pedido realizado com sucesso",
  "order": {
    "id": "string",
    "sessionId": "string",
    "items": [...],
    "total": number,
    "customerInfo": {...},
    "status": "confirmed",
    "createdAt": "string"
  }
}
```

#### Verificar status do pedido
```http
GET /api/cart/checkout?orderId={orderId}
```

**Parâmetros:**
- `orderId` (string): ID do pedido

**Resposta:**
```json
{
  "id": "string",
  "status": "confirmed",
  "message": "Pedido confirmado e em processamento"
}
```

## URLs para Navegação

### Página de produtos
```
http://localhost:3000/products
```

### Página de produto específico
```
http://localhost:3000/products/{productId}
```

## Exemplos de Uso com n8n

### 1. Adicionar produto ao carrinho
```javascript
// Webhook ou HTTP Request Node
{
  "method": "POST",
  "url": "http://localhost:3000/api/cart",
  "body": {
    "sessionId": "{{$json.sessionId}}",
    "productId": "{{$json.productId}}",
    "quantity": 1
  }
}
```

### 2. Finalizar compra
```javascript
// HTTP Request Node
{
  "method": "POST",
  "url": "http://localhost:3000/api/cart/checkout",
  "body": {
    "sessionId": "{{$json.sessionId}}",
    "customerInfo": {
      "name": "{{$json.customerName}}",
      "email": "{{$json.customerEmail}}"
    }
  }
}
```

### 3. Redirecionar para produto específico
```javascript
// Redirect ou HTTP Response Node
{
  "statusCode": 302,
  "headers": {
    "Location": "http://localhost:3000/products/{{$json.productId}}"
  }
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `400` - Erro de validação (parâmetros obrigatórios ausentes)
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

## Notas Importantes

1. **Session ID**: É essencial para manter o estado do carrinho. Deve ser único por usuário/sessão.
2. **Estoque**: O sistema verifica automaticamente a disponibilidade de estoque antes de adicionar itens.
3. **Carrinho**: É limpo automaticamente após o checkout bem-sucedido.
4. **Produtos com receita**: Produtos que requerem prescrição médica são marcados com `prescription: true`.
5. **Armazenamento**: Atualmente usa armazenamento em memória. Em produção, recomenda-se usar Redis ou banco de dados.

## Exemplo de Fluxo Completo

1. **Obter produtos**: `GET /api/products`
2. **Adicionar ao carrinho**: `POST /api/cart`
3. **Verificar carrinho**: `GET /api/cart?sessionId=xxx`
4. **Finalizar compra**: `POST /api/cart/checkout`
5. **Redirecionar**: Para página de sucesso ou produto específico