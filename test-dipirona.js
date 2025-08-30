const axios = require('axios');

async function testDipirona() {
  const baseURL = 'http://localhost:3007';
  const sessionId = `test-${Date.now()}`;
  
  console.log('🧪 Testando adição de dipirona ao carrinho...');
  console.log('📋 SessionId:', sessionId);
  
  try {
    // Teste 1: Buscar dipirona
    console.log('\n1️⃣ Enviando mensagem: "Estou procurando dipirona"');
    const searchResponse = await axios.post(`${baseURL}/api/ai-chat`, {
      message: 'Estou procurando dipirona',
      sessionId: sessionId
    });
    
    console.log('✅ Resposta da busca:', searchResponse.data.response);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 2: Adicionar ao carrinho
    console.log('\n2️⃣ Enviando mensagem: "Adicione dipirona no meu carrinho"');
    const addResponse = await axios.post(`${baseURL}/api/ai-chat`, {
      message: 'Adicione dipirona no meu carrinho',
      sessionId: sessionId
    });
    
    console.log('✅ Resposta da adição:', addResponse.data.response);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Teste 3: Verificar carrinho
    console.log('\n3️⃣ Verificando carrinho via API...');
    const cartResponse = await axios.get(`${baseURL}/api/cart?sessionId=${sessionId}`);
    
    console.log('🛒 Carrinho atual:', JSON.stringify(cartResponse.data, null, 2));
    
    if (cartResponse.data.items && cartResponse.data.items.length > 0) {
      console.log('✅ SUCESSO: Dipirona foi adicionada ao carrinho!');
    } else {
      console.log('❌ FALHA: Carrinho ainda está vazio');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Full error:', error);
  }
}

testDipirona();