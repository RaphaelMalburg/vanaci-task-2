// Script para testar o caso específico de dor de joelho
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testKneePain() {
  console.log('🧪 Testando exemplo de dor de joelho...');
  
  try {
    console.log('📝 Enviando consulta sobre dor de joelho...');
    const response = await fetch('http://localhost:3007/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Estou com dor de joelho, o que você recomenda?',
        sessionId: 'test-knee-pain-session'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log('✅ Resposta recebida');
    
    // Verificar se há URLs incorretas
    if (responseText.includes('exemplo.com')) {
      console.log('❌ PROBLEMA ENCONTRADO: URL com exemplo.com detectada!');
      console.log('Resposta problemática:', responseText);
      return false;
    }
    
    // Verificar se há caminhos de imagem corretos
    const imageMatches = responseText.match(/\/imagensRemedios\/[^\s\]"]+/g);
    if (imageMatches) {
      console.log('✅ Caminhos de imagem corretos encontrados:', imageMatches);
    }
    
    console.log('\n📋 Resposta (primeiros 500 caracteres):');
    console.log(responseText.substring(0, 500) + '...');
    
    console.log('\n✅ SUCESSO: Nenhuma URL incorreta encontrada!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return false;
  }
}

testKneePain().then(success => {
  if (success) {
    console.log('\n🎉 Teste de dor de joelho passou!');
    process.exit(0);
  } else {
    console.log('\n💥 Teste de dor de joelho falhou!');
    process.exit(1);
  }
}).catch((error) => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});