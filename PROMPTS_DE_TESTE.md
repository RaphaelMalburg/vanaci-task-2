# Prompts de Teste - Farmácia Vanaci AI Agent

## 🧪 Conjunto de Testes para Validação Completa

### 1. Testes de Busca e Navegação de Produtos

#### Teste 1.1 - Busca por nome específico
```
Olá! Estou procurando dipirona. Pode me mostrar as opções disponíveis?
```
**Resultado esperado:** Lista produtos com dipirona, mostra preços e IDs

#### Teste 1.2 - Navegação para página do produto
```
Quero ver a página da dipirona para saber mais detalhes sobre o produto
```
**Resultado esperado:** Redireciona para página específica do produto dipirona

#### Teste 1.3 - Busca por categoria
```
Mostre-me produtos para dor de cabeça
```
**Resultado esperado:** Lista analgésicos e produtos relacionados

### 2. Testes de Carrinho de Compras

#### Teste 2.1 - Adicionar produto específico
```
Adicione uma dipirona no meu carrinho
```
**Resultado esperado:** Produto adicionado com confirmação e detalhes

#### Teste 2.2 - Adicionar múltiplos produtos
```
Quero adicionar 2 caixas de dipirona e 1 termômetro digital no carrinho
```
**Resultado esperado:** Ambos produtos adicionados com quantidades corretas

#### Teste 2.3 - Verificar carrinho
```
Mostre o que tem no meu carrinho atual
```
**Resultado esperado:** Lista completa dos itens, quantidades e total

#### Teste 2.4 - Atualizar quantidade
```
Quero alterar a quantidade de dipirona para 3 unidades
```
**Resultado esperado:** Quantidade atualizada com novo total

#### Teste 2.5 - Remover item
```
Remova o termômetro do meu carrinho
```
**Resultado esperado:** Item removido com confirmação

#### Teste 2.6 - Limpar carrinho
```
Limpe todo o meu carrinho
```
**Resultado esperado:** Carrinho completamente vazio

### 3. Testes de Recomendações

#### Teste 3.1 - Recomendação por sintoma
```
Estou com febre, o que você recomenda?
```
**Resultado esperado:** Lista produtos para febre com orientações

#### Teste 3.2 - Produtos em promoção
```
Quais produtos estão em promoção hoje?
```
**Resultado esperado:** Lista produtos com desconto

#### Teste 3.3 - Alternativas por orçamento
```
Preciso de algo para dor de cabeça mas tenho apenas 20 euros
```
**Resultado esperado:** Produtos dentro do orçamento especificado

### 4. Testes de Checkout e Finalização

#### Teste 4.1 - Ir para checkout
```
Quero finalizar minha compra
```
**Resultado esperado:** Redireciona para página de checkout

#### Teste 4.2 - Checkout com carrinho vazio
```
Quero fazer checkout
```
**Resultado esperado:** Aviso que carrinho está vazio

### 5. Testes de Navegação Geral

#### Teste 5.1 - Voltar ao início
```
Quero voltar para a página inicial
```
**Resultado esperado:** Redireciona para home

#### Teste 5.2 - Ver carrinho
```
Quero ver minha página do carrinho
```
**Resultado esperado:** Redireciona para página do carrinho

#### Teste 5.3 - Buscar página específica
```
Quero buscar por "vitaminas"
```
**Resultado esperado:** Redireciona para página de busca com termo

### 6. Testes de Informações da Farmácia

#### Teste 6.1 - Horário de funcionamento
```
Qual o horário de funcionamento da farmácia?
```
**Resultado esperado:** Informações de horário

#### Teste 6.2 - Contato
```
Preciso falar com um farmacêutico
```
**Resultado esperado:** Informações de contato

#### Teste 6.3 - Localização
```
Onde fica a farmácia?
```
**Resultado esperado:** Endereço e informações de localização

### 7. Testes de Casos Complexos

#### Teste 7.1 - Fluxo completo de compra
```
1. "Olá, preciso de dipirona"
2. "Adicione 2 caixas no carrinho"
3. "Mostre meu carrinho"
4. "Quero finalizar a compra"
```
**Resultado esperado:** Fluxo completo funcional

#### Teste 7.2 - Mudança de ideia
```
1. "Adicione dipirona no carrinho"
2. "Na verdade, prefiro paracetamol"
3. "Remova a dipirona e adicione paracetamol"
```
**Resultado esperado:** Alterações realizadas corretamente

#### Teste 7.3 - Produto específico com navegação
```
1. "Quero ver detalhes do álcool gel"
2. "Adicione no carrinho"
3. "Volte para a página inicial"
```
**Resultado esperado:** Navegação e ações funcionais

### 8. Testes de Validação e Erros

#### Teste 8.1 - Produto inexistente
```
Quero comprar aspirina mágica
```
**Resultado esperado:** Mensagem de produto não encontrado com sugestões

#### Teste 8.2 - Quantidade inválida
```
Adicione -5 dipironas no carrinho
```
**Resultado esperado:** Validação de quantidade mínima

#### Teste 8.3 - Estoque insuficiente
```
Quero 1000 unidades de dipirona
```
**Resultado esperado:** Aviso de estoque limitado

## 📊 Critérios de Avaliação

### ✅ Funcionalidades que DEVEM funcionar:
- [x] Busca de produtos por nome
- [x] Adição ao carrinho
- [x] Visualização do carrinho
- [x] Remoção de itens
- [x] Navegação para páginas de produtos
- [x] Recomendações por sintomas
- [x] Informações da farmácia
- [x] Logs detalhados para debugging

### 🔍 Pontos de Atenção:
- **Logs:** Verificar se aparecem no console do navegador
- **SessionID:** Deve ser gerado e mantido consistente
- **Estoque:** Validação de disponibilidade
- **Navegação:** URLs corretas e funcionais
- **Carrinho:** Persistência durante a sessão

### 🐛 Como Reportar Problemas:
1. **Prompt usado:** Copie exatamente o que foi digitado
2. **Resposta obtida:** O que o agente respondeu
3. **Resultado esperado:** O que deveria ter acontecido
4. **Logs do console:** Abra F12 e copie mensagens de erro
5. **Ações realizadas:** Sequência de passos até o erro

## 🚀 Execução dos Testes

### Ordem Recomendada:
1. **Testes básicos** (1-3): Funcionalidades core
2. **Testes de fluxo** (4-5): Navegação e checkout
3. **Testes informativos** (6): Dados da farmácia
4. **Testes complexos** (7): Cenários reais
5. **Testes de validação** (8): Casos extremos

### Ambiente de Teste:
- **URL:** http://localhost:3008
- **Console:** Aberto (F12) para ver logs
- **Carrinho:** Limpo antes de cada teste
- **Sessão:** Nova para cada bateria de testes

---

**Nota:** Este documento deve ser usado para validação completa do sistema. Cada teste deve ser executado individualmente e os resultados documentados para identificar pontos de melhoria.