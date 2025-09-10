const axios = require('axios');

const API_BASE = 'http://localhost:3007';

async function testDorJoelho() {
  console.log('🧪 Testando query "dor no joelho" sem streaming...');
  
  try {
    const response = await axios.post(`${API_BASE}/api/ai-chat`, {
      message: 'dor no joelho o que tomo',
      sessionId: 'test-dor-joelho-' + Date.now(),
      streaming: false // Desabilitar streaming para obter resposta JSON
    });
    
    console.log('✅ Resposta recebida');
    console.log('📝 Resposta completa:', JSON.stringify(response.data, null, 2));
    
    const message = response.data.response || response.data.message || response.data.text || '';
    console.log('📝 Mensagem extraída:', message.substring(0, 200) + '...');
    
    if (message) {
      // Verificar se a resposta contém produtos recomendados
      const hasProducts = message.includes('€') || message.includes('Benuron') || message.includes('Brufen');
      
      if (hasProducts) {
        console.log('✅ Resposta contém produtos recomendados');
      } else {
        console.log('❌ Resposta NÃO contém produtos recomendados');
      }
      
      // Verificar se menciona termos técnicos (que não deveria)
      const hasTechnicalTerms = message.includes('busca') || 
                               message.includes('ferramenta') || 
                               message.includes('sistema') ||
                               message.includes('ID:');
      
      if (hasTechnicalTerms) {
        console.log('❌ Resposta contém termos técnicos (não deveria)');
      } else {
        console.log('✅ Resposta não contém termos técnicos');
      }
      
      // Verificar se usou list_recommended_products
      if (message.includes('list_recommended_products') || message.includes('recomendo os seguintes produtos')) {
        console.log('✅ Agente usou list_recommended_products');
      } else {
        console.log('❌ Agente NÃO usou list_recommended_products');
      }
    } else {
      console.log('❌ Nenhuma mensagem encontrada na resposta');
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
    if (error.response) {
      console.log('📝 Status:', error.response.status);
      console.log('📝 Data:', error.response.data);
    }
  }
}

testDorJoelho();