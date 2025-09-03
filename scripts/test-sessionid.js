const axios = require('axios');

// Função para testar o sessionId nas tools
async function testSessionId() {
  console.log('🧪 Testando passagem de sessionId para as tools...');
  
  const baseUrl = 'http://localhost:3007';
  const sessionId = 'test-session-' + Date.now();
  
  try {
    // Teste 1: Adicionar produto ao carrinho
    console.log('\n📦 Teste 1: Adicionando produto ao carrinho...');
    const response1 = await axios.post(`${baseUrl}/api/ai-chat`, {
      message: 'adicione dipirona ao carrinho',
      sessionId: sessionId,
      streaming: false
    });
    
    console.log('✅ Resposta completa:', JSON.stringify(response1.data, null, 2));
    console.log('✅ Resposta do chat:', response1.data.response);
    
    // Teste 2: Ver carrinho
    console.log('\n🛒 Teste 2: Visualizando carrinho...');
    const response2 = await axios.post(`${baseUrl}/api/ai-chat`, {
      message: 'mostre meu carrinho',
      sessionId: sessionId,
      streaming: false
    });
    
    console.log('✅ Resposta completa:', JSON.stringify(response2.data, null, 2));
    console.log('✅ Resposta do chat:', response2.data.response);
    
    // Teste 3: Limpar carrinho
    console.log('\n🗑️ Teste 3: Limpando carrinho...');
    const response3 = await axios.post(`${baseUrl}/api/ai-chat`, {
      message: 'limpe meu carrinho',
      sessionId: sessionId,
      streaming: false
    });
    
    console.log('✅ Resposta completa:', JSON.stringify(response3.data, null, 2));
    console.log('✅ Resposta do chat:', response3.data.response);
    
    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Executar os testes
testSessionId();