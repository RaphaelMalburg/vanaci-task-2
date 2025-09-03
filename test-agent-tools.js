// Script para testar as tools do agente AI após as correções
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAgentTools() {
  console.log('🧪 Testando tools do agente AI após correções...');
  
  const baseUrl = 'http://localhost:3007';
  const sessionId = `test-${Date.now()}`;
  
  // Função helper para fazer requests
  async function sendMessage(message, expectTools = true) {
    console.log(`\n📤 Enviando: "${message}"`);
    
    try {
      const response = await fetch(`${baseUrl}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId,
          streaming: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('✅ Resposta recebida:', responseText.substring(0, 100) + '...');
      
      // Verificar se há tool_call no stream
      const hasToolCall = responseText.includes('"type":"tool_call"');
      
      if (expectTools && hasToolCall) {
        // Extrair nomes das tools do stream
        const toolMatches = responseText.match(/"toolName":"([^"]+)"/g);
        if (toolMatches) {
          const toolNames = toolMatches.map(match => match.match(/"toolName":"([^"]+)"/)[1]);
          console.log('🔧 Tools executadas:', toolNames.join(', '));
        }
        return true;
      } else if (expectTools) {
        console.log('⚠️ PROBLEMA: Nenhuma tool foi executada quando deveria ter sido!');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro:', error.message);
      return false;
    }
  }
  
  // Testes específicos
  const tests = [
    { message: 'adicione 2 dipirona ao carrinho', expectTools: true, description: 'Adicionar produto ao carrinho' },
    { message: 'busque paracetamol', expectTools: true, description: 'Buscar produto' },
    { message: 'mostre meu carrinho', expectTools: true, description: 'Ver carrinho' },
    { message: 'add 1 vitamina c no carrinho', expectTools: true, description: 'Adicionar vitamina C' },
    { message: 'olá, como você pode me ajudar?', expectTools: false, description: 'Saudação simples' }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n🧪 Teste: ${test.description}`);
    const result = await sendMessage(test.message, test.expectTools);
    if (result) {
      passedTests++;
      console.log('✅ Teste passou!');
    } else {
      console.log('❌ Teste falhou!');
    }
    
    // Aguardar um pouco entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Resultado final: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Todos os testes passaram! As tools estão funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs do servidor para mais detalhes.');
  }
}

// Executar os testes
testAgentTools().catch(console.error);