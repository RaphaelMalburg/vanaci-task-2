// Teste específico para verificar se o agente executa múltiplas tools em sequência
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testMultipleTools() {
  console.log('🧪 Testando execução de múltiplas tools em sequência...');
  
  const baseUrl = 'http://localhost:3007';
  const sessionId = `test-multi-${Date.now()}`;
  
  async function sendMessageAndMonitorStream(message) {
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
      console.log('📄 Stream completo recebido');
      
      // Analisar o stream linha por linha
      const lines = responseText.split('\n').filter(line => line.trim());
      const toolCalls = [];
      const textResponses = [];
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            
            if (data.type === 'tool_call') {
              const toolName = data.toolCall?.toolName;
              if (toolName) {
                toolCalls.push(toolName);
                console.log(`🔧 Tool executada: ${toolName}`);
              }
            } else if (data.type === 'text') {
              textResponses.push(data.content);
            }
          } catch (e) {
            // Ignorar linhas que não são JSON válido
          }
        }
      }
      
      console.log(`\n📊 Resumo:`);
      console.log(`   Tools executadas: ${toolCalls.length} - [${toolCalls.join(', ')}]`);
      console.log(`   Respostas de texto: ${textResponses.length}`);
      
      return { toolCalls, textResponses };
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
      return { toolCalls: [], textResponses: [] };
    }
  }
  
  // Teste 1: Comando de adicionar ao carrinho
  console.log('\n=== TESTE 1: Adicionar ao carrinho ===');
  const result1 = await sendMessageAndMonitorStream('adicione 2 dipirona ao carrinho');
  
  if (result1.toolCalls.includes('search_products') && result1.toolCalls.includes('add_to_cart')) {
    console.log('✅ SUCESSO: Ambas as tools foram executadas!');
  } else if (result1.toolCalls.includes('search_products')) {
    console.log('⚠️ PROBLEMA: Apenas search_products foi executada, faltou add_to_cart');
  } else {
    console.log('❌ FALHA: Nenhuma tool foi executada');
  }
  
  // Teste 2: Comando de busca simples (deve executar apenas search_products)
  console.log('\n=== TESTE 2: Busca simples ===');
  const result2 = await sendMessageAndMonitorStream('busque paracetamol');
  
  if (result2.toolCalls.length === 1 && result2.toolCalls.includes('search_products')) {
    console.log('✅ SUCESSO: Apenas search_products foi executada (correto)');
  } else {
    console.log('⚠️ PROBLEMA: Comportamento inesperado para busca simples');
  }
  
  // Teste 3: Ver carrinho
  console.log('\n=== TESTE 3: Ver carrinho ===');
  const result3 = await sendMessageAndMonitorStream('mostre meu carrinho');
  
  if (result3.toolCalls.length === 1 && result3.toolCalls.includes('view_cart')) {
    console.log('✅ SUCESSO: Apenas view_cart foi executada (correto)');
  } else {
    console.log('⚠️ PROBLEMA: Comportamento inesperado para ver carrinho');
  }
  
  console.log('\n🏁 Teste concluído!');
}

testMultipleTools().catch(console.error);