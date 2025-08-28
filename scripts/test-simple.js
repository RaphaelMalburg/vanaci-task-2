const axios = require('axios');

async function testSimpleMessage() {
  console.log('🧪 Testando mensagem simples...');
  
  try {
    const response = await axios.post('http://localhost:3007/api/ai-chat', {
      message: 'Olá',
      sessionId: 'test-simple-' + Date.now(),
      streaming: false
    });
    
    console.log('✅ Status:', response.status);
    console.log('📝 Resposta completa:', JSON.stringify(response.data, null, 2));
    
    if (response.data.response && !response.data.response.includes('erro interno')) {
      console.log('🎉 Teste passou! O AI está funcionando.');
    } else {
      console.log('❌ Teste falhou: ainda retornando erro interno.');
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    if (error.response) {
      console.error('📄 Dados da resposta:', error.response.data);
    }
  }
}

testSimpleMessage();