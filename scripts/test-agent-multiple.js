const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAgentMultiple() {
  console.log('🧪 Testando agente com pergunta sobre múltiplos produtos...');
  
  const testMessage = 'quais paracetamol, termômetro e dipirona vocês têm?';
  
  try {
    console.log(`📝 Enviando: "${testMessage}"`);
    
    const response = await fetch('http://localhost:3007/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        sessionId: 'multiple-test-session'
      })
    });

    if (!response.ok) {
      console.error(`❌ Erro HTTP: ${response.status} ${response.statusText}`);
      return;
    }

    const responseText = await response.text();
    console.log('📥 Resposta completa:');
    console.log('---START RESPONSE---');
    console.log(responseText);
    console.log('---END RESPONSE---');
    
    // Parse das linhas de dados SSE
    const lines = responseText.split('\n').filter(line => line.trim());
    
    let searchProductsCalls = 0;
    let showMultipleProductsCalls = 0;
    let productIds = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          
          if (data.type === 'tool_call') {
            console.log(`🔧 Tool: ${data.toolCall?.toolName}`);
            
            if (data.toolCall?.toolName === 'search_products') {
              searchProductsCalls++;
              console.log(`  Query: ${data.toolCall?.args?.query}`);
            }
            
            if (data.toolCall?.toolName === 'show_multiple_products') {
              showMultipleProductsCalls++;
              productIds = data.toolCall?.args?.productIds || [];
              console.log(`  Product IDs: ${JSON.stringify(productIds)}`);
              console.log(`  Total IDs: ${productIds.length}`);
            }
          }
        } catch (e) {
          // Ignorar erros de parse
        }
      }
    });
    
    console.log(`\n📊 Resumo:`);
    console.log(`  - search_products calls: ${searchProductsCalls}`);
    console.log(`  - show_multiple_products calls: ${showMultipleProductsCalls}`);
    console.log(`  - Product IDs extraídos: ${productIds.length}`);
    console.log(`  - IDs: ${JSON.stringify(productIds)}`);
    
    if (searchProductsCalls > 0 && showMultipleProductsCalls > 0 && productIds.length > 1) {
      console.log('✅ Agente funcionando corretamente - múltiplos produtos extraídos!');
    } else {
      console.log('❌ PROBLEMA: Agente não está extraindo múltiplos produtos corretamente');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testAgentMultiple().catch(console.error);