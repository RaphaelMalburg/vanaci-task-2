/**
 * Script de Automação de Testes - Farmácia Vanaci AI Agent
 * 
 * Este script executa testes automatizados básicos para validar
 * o funcionamento do agente AI e suas principais funcionalidades.
 */

const BASE_URL = 'http://localhost:3000';

// Função para fazer requisições HTTP
async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Função para testar o agente AI
async function testAIAgent(message, sessionId = 'test-session') {
  console.log(`\n🤖 Testando: "${message}"`);
  
  const result = await makeRequest('/api/ai-chat', 'POST', {
    message,
    sessionId,
    streaming: false
  });
  
  if (result.success) {
    const response = result.data.response || result.data.content || result.data.message || 'Resposta recebida';
    console.log(`✅ Resposta: ${response}`);
    if (result.data.toolCalls && result.data.toolCalls.length > 0) {
      console.log(`🔧 Tools usados: ${result.data.toolCalls.map(t => t.toolName).join(', ')}`);
    }
  } else {
    console.log(`❌ Erro: ${result.error || 'Falha na requisição'}`);
  }
  
  return result;
}

// Função para testar APIs básicas
async function testBasicAPIs() {
  console.log('\n📡 Testando APIs básicas...');
  
  // Testar API de produtos
  console.log('\n🔍 Testando /api/products');
  const productsResult = await makeRequest('/api/products');
  if (productsResult.success) {
    console.log(`✅ ${productsResult.data.length} produtos encontrados`);
  } else {
    console.log(`❌ Erro ao buscar produtos: ${productsResult.error}`);
  }
  
  // Testar API do carrinho
  console.log('\n🛒 Testando /api/cart');
  const cartResult = await makeRequest('/api/cart?sessionId=test-session');
  if (cartResult.success) {
    console.log(`✅ Carrinho: ${cartResult.data.itemCount} itens, Total: €${cartResult.data.total}`);
  } else {
    console.log(`❌ Erro ao acessar carrinho: ${cartResult.error}`);
  }
}

// Testes do agente AI
async function runAIAgentTests() {
  console.log('\n🧪 Executando testes do agente AI...');
  
  const sessionId = `test-${Date.now()}`;
  
  // Teste 1: Saudação
  await testAIAgent('Olá!', sessionId);
  
  // Teste 2: Busca de produto
  await testAIAgent('Estou procurando dipirona', sessionId);
  
  // Teste 3: Adicionar ao carrinho
  await testAIAgent('Adicione dipirona no meu carrinho', sessionId);
  
  // Teste 4: Ver carrinho
  await testAIAgent('Mostre meu carrinho', sessionId);
  
  // Teste 5: Recomendação por sintoma
  await testAIAgent('Estou com dor de cabeça, o que você recomenda?', sessionId);
  
  // Teste 6: Informações da farmácia
  await testAIAgent('Qual o horário de funcionamento?', sessionId);
  
  // Teste 7: Navegação
  await testAIAgent('Quero ver a página da vitamina C', sessionId);
  
  // Teste 8: Limpar carrinho
  await testAIAgent('Limpe meu carrinho', sessionId);
}

// Função principal
async function runTests() {
  console.log('🚀 Iniciando testes automatizados da Farmácia Vanaci...');
  console.log(`📍 URL base: ${BASE_URL}`);
  
  try {
    // Testar APIs básicas primeiro
    await testBasicAPIs();
    
    // Aguardar um pouco antes dos testes do agente
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Testar agente AI
    await runAIAgentTests();
    
    console.log('\n✅ Testes concluídos!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Verifique os logs no console do navegador');
    console.log('2. Teste manualmente os prompts em PROMPTS_DE_TESTE.md');
    console.log('3. Valide a navegação e interface visual');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes se for chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests();
} else {
  // Browser environment
  window.runPharmacyTests = runTests;
  console.log('🌐 Script carregado! Execute window.runPharmacyTests() para iniciar os testes.');
}

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    testAIAgent,
    testBasicAPIs,
    makeRequest
  };
}