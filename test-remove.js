const axios = require('axios');

const baseURL = 'http://localhost:3007';
const sessionId = `test-remove-${Date.now()}`;

async function testRemoveFromCart() {
  try {
    console.log('🧪 Testando funcionalidade de remoção do carrinho...');
    console.log('📋 SessionId:', sessionId);
    
    // 1. Primeiro, adicionar um produto ao carrinho
    console.log('\n1. Adicionando Dipirona ao carrinho...');
    const addResponse = await axios.post(`${baseURL}/api/cart`, {
      sessionId,
      productId: 'cmewm8vfo0000vbdk25u7azmj', // ID da Dipirona
      quantity: 2
    });
    console.log('✅ Produto adicionado:', addResponse.data);
    
    // 2. Verificar carrinho
    console.log('\n2. Verificando carrinho após adição...');
    const cartResponse = await axios.get(`${baseURL}/api/cart?sessionId=${sessionId}`);
    console.log('📦 Carrinho atual:', cartResponse.data);
    console.log('📊 Itens no carrinho:', cartResponse.data.items?.length || 0);
    
    // 3. Remover o produto
    console.log('\n3. Removendo produto do carrinho...');
    const removeResponse = await axios.delete(`${baseURL}/api/cart`, {
      data: {
        sessionId,
        productId: 'cmewm8vfo0000vbdk25u7azmj'
      }
    });
    console.log('✅ Resposta da remoção:', removeResponse.data);
    
    // 4. Verificar carrinho após remoção
    console.log('\n4. Verificando carrinho após remoção...');
    const finalCartResponse = await axios.get(`${baseURL}/api/cart?sessionId=${sessionId}`);
    console.log('📦 Carrinho final:', finalCartResponse.data);
    console.log('📊 Itens restantes:', finalCartResponse.data.items?.length || 0);
    
    if (finalCartResponse.data.items?.length === 0) {
      console.log('\n🎉 SUCESSO! Produto removido corretamente do carrinho!');
    } else {
      console.log('\n❌ ERRO! Produto não foi removido do carrinho.');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testRemoveFromCart();