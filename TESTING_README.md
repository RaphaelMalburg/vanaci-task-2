# 🧪 Guia de Testes - Farmácia Vanaci AI Agent

Este guia contém instruções completas para testar todas as funcionalidades do sistema.

## 📋 Arquivos de Teste

- **`PROMPTS_DE_TESTE.md`** - Conjunto completo de prompts para teste manual
- **`scripts/test-automation.js`** - Script de automação para testes básicos
- **`TESTING_README.md`** - Este guia (instruções de uso)

## 🚀 Como Executar os Testes

### 1. Preparação do Ambiente

```bash
# Certifique-se de que o servidor está rodando
npm run dev

# Em outro terminal, execute o seed se necessário
npm run db:seed
```

**URL do sistema:** http://localhost:3007

### 2. Testes Automatizados

#### Opção A: Via Node.js (Recomendado)

```bash
# Instalar dependência se necessário
npm install node-fetch

# Executar testes automatizados
node scripts/test-automation.js
```

#### Opção B: Via Console do Navegador

1. Abra http://localhost:3007 no navegador
2. Abra o Console (F12)
3. Cole o conteúdo de `scripts/test-automation.js`
4. Execute: `window.runPharmacyTests()`

### 3. Testes Manuais

Use os prompts em `PROMPTS_DE_TESTE.md` seguindo esta ordem:

1. **Testes Básicos (1-3)** - Funcionalidades core
2. **Testes de Fluxo (4-5)** - Navegação e checkout
3. **Testes Informativos (6)** - Dados da farmácia
4. **Testes Complexos (7)** - Cenários reais
5. **Testes de Validação (8)** - Casos extremos
6. **Testes de Descrições (9)** - Novas funcionalidades
7. **Testes de Performance (10)** - Logs e performance

## 🔍 O Que Verificar

### ✅ Funcionalidades Essenciais

- [ ] **Busca de produtos** - Por nome, categoria, sintoma
- [ ] **Carrinho de compras** - Adicionar, remover, atualizar, visualizar
- [ ] **Navegação** - Redirecionamentos corretos
- [ ] **Recomendações** - Sugestões por sintomas
- [ ] **Informações** - Horários, contato, localização
- [ ] **Descrições detalhadas** - Produtos com informações completas

### 🔧 Aspectos Técnicos

- [ ] **Logs no console** - Verificar se aparecem logs detalhados
- [ ] **SessionID** - Consistência durante a conversa
- [ ] **Tempo de resposta** - Respostas em tempo adequado
- [ ] **Tratamento de erros** - Mensagens apropriadas para casos inválidos
- [ ] **APIs funcionais** - Endpoints respondendo corretamente

### 🎨 Interface e UX

- [ ] **Chat responsivo** - Interface funcional em diferentes tamanhos
- [ ] **Navegação fluida** - Redirecionamentos funcionando
- [ ] **Páginas de produto** - Descrições detalhadas visíveis
- [ ] **Carrinho visual** - Itens aparecendo corretamente
- [ ] **Feedback visual** - Confirmações e notificações

## 📊 Relatório de Testes

### Estrutura do Relatório

Para cada teste, documente:

```markdown
#### Teste X.Y - Nome do Teste
**Prompt usado:** "texto exato do prompt"
**Resultado obtido:** descrição do que aconteceu
**Status:** ✅ Passou / ❌ Falhou / ⚠️ Parcial
**Observações:** detalhes adicionais, logs, etc.
```

### Exemplo de Relatório

```markdown
#### Teste 1.1 - Busca por nome específico
**Prompt usado:** "Olá! Estou procurando dipirona. Pode me mostrar as opções disponíveis?"
**Resultado obtido:** Agente listou 2 produtos com dipirona, mostrou preços e IDs
**Status:** ✅ Passou
**Observações:** Logs apareceram corretamente no console

#### Teste 2.1 - Adicionar produto específico
**Prompt usado:** "Adicione uma dipirona no meu carrinho"
**Resultado obtido:** Produto adicionado, mas sem confirmação visual
**Status:** ⚠️ Parcial
**Observações:** Funcionalidade ok, mas falta feedback melhor
```

## 🐛 Problemas Comuns e Soluções

### Servidor não responde
```bash
# Reiniciar servidor
npm run dev

# Limpar cache se necessário
rm -rf .next
npm run dev
```

### Banco de dados vazio
```bash
# Recriar dados
npm run db:seed
```

### Logs não aparecem
- Abrir Console do navegador (F12)
- Verificar se está na aba "Console"
- Recarregar a página se necessário

### Carrinho não funciona
- Verificar se sessionId está sendo gerado
- Limpar localStorage do navegador
- Testar em aba anônima

### APIs retornam erro 500
- Verificar logs do servidor no terminal
- Confirmar se banco de dados está conectado
- Verificar variáveis de ambiente

## 📈 Métricas de Sucesso

### Critérios de Aprovação

- **90%+ dos testes básicos** devem passar
- **Tempo de resposta** < 3 segundos para consultas simples
- **Zero erros críticos** que quebrem o fluxo principal
- **Logs detalhados** visíveis no console
- **Navegação funcional** em todas as páginas

### Benchmarks

- **Busca de produtos:** < 1 segundo
- **Adição ao carrinho:** < 2 segundos
- **Navegação entre páginas:** < 1 segundo
- **Recomendações por sintoma:** < 3 segundos

## 🔄 Processo de Regressão

Após mudanças no código:

1. **Build e deploy**
   ```bash
   npm run build
   npm run dev
   ```

2. **Testes automatizados**
   ```bash
   node scripts/test-automation.js
   ```

3. **Testes manuais críticos**
   - Teste 1.1 (busca)
   - Teste 2.1 (carrinho)
   - Teste 7.1 (fluxo completo)

4. **Validação visual**
   - Abrir páginas principais
   - Testar responsividade
   - Verificar descrições detalhadas

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Consulte os logs do console
2. Verifique o terminal do servidor
3. Revise este guia
4. Documente o problema seguindo o formato do relatório

---

**Última atualização:** Janeiro 2025  
**Versão do sistema:** 1.0.0  
**Ambiente de teste:** http://localhost:3007