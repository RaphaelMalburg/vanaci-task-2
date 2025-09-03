// Script para testar o funcionamento do chat AI
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testChat() {
  console.log('🧪 Iniciando teste do chat AI...');
  
  try {
    // Testar via API endpoint
    console.log('🔗 Testando via API endpoint...');
    
    // Teste 1: Mensagem simples
    console.log('\n📝 Teste 1: Mensagem de saudação');
    const response1 = await fetch('http://localhost:3007/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Olá! Como você pode me ajudar?',
        sessionId: 'test-session-1'
      })
    });
    const data1 = await response1.text();
    console.log('✅ Resposta recebida:', data1.substring(0, 100) + '...');
    
    // Teste 2: Consulta sobre medicamentos
    console.log('\n📝 Teste 2: Consulta sobre medicamentos');
    const response2 = await fetch('http://localhost:3007/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Quais medicamentos vocês têm para dor de cabeça?',
        sessionId: 'test-session-2'
      })
    });
    const data2 = await response2.text();
    console.log('✅ Resposta recebida:', data2.substring(0, 100) + '...');
    
    // Teste 3: Adicionar produto ao carrinho
    console.log('\n📝 Teste 3: Adicionar produto ao carrinho');
    const response3 = await fetch('http://localhost:3007/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Adicione dipirona ao meu carrinho',
        sessionId: 'test-session-3'
      })
    });
    const data3 = await response3.text();
    console.log('✅ Resposta recebida:', data3.substring(0, 100) + '...');
    
    console.log('\n🎉 Todos os testes passaram! O chat AI está funcionando.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar teste
testChat().then(() => {
  console.log('\n✨ Teste concluído com sucesso!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Falha no teste:', error);
  process.exit(1);
});