const fetch = require('node-fetch');

// Verificar se fetch está disponível
if (typeof fetch !== 'function') {
  console.error('❌ node-fetch não está funcionando corretamente');
  process.exit(1);
}

async function testDipirona() {
  console.log('🧪 Testando problema específico com dipirona...');
  
  const testMessage = 'add dipirona ao carrinho';
  
  try {
    console.log(`📝 Enviando: "${testMessage}"`);
    
    const response = await fetch('http://localhost:3007/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        sessionId: 'dipirona-test-session'
      })
    });

    console.log(`📊 Status da resposta: ${response.status}`);
    console.log(`📊 Headers:`, response.headers.raw());
    
    if (!response.ok) {
      console.error(`❌ Erro HTTP: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`❌ Corpo do erro:`, errorText);
      return;
    }

    const responseText = await response.text();
    console.log(`📥 Resposta completa (${responseText.length} caracteres):`);
    console.log('---START RESPONSE---');
    console.log(responseText);
    console.log('---END RESPONSE---');
    
    // Parse das linhas de dados SSE
    const lines = responseText.split('\n').filter(line => line.trim());
    console.log(`📊 Total de linhas: ${lines.length}`);
    
    let hasToolCall = false;
    let hasTextResponse = false;
    
    lines.forEach((line, index) => {
      console.log(`Linha ${index + 1}: ${line}`);
      
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          console.log(`  Tipo: ${data.type}`);
          
          if (data.type === 'tool_call') {
            hasToolCall = true;
            console.log(`  Tool: ${data.toolCall?.toolName}`);
            console.log(`  Args:`, data.toolCall?.args);
          } else if (data.type === 'text') {
            hasTextResponse = true;
            console.log(`  Conteúdo: "${data.content}"`);
          }
        } catch (e) {
          console.log(`  Erro ao parsear JSON: ${e.message}`);
        }
      }
    });
    
    console.log(`\n📊 Resumo:`);
    console.log(`  - Tool call detectado: ${hasToolCall ? '✅' : '❌'}`);
    console.log(`  - Resposta de texto: ${hasTextResponse ? '✅' : '❌'}`);
    
    if (!hasToolCall && !hasTextResponse) {
      console.log('❌ PROBLEMA: Nenhuma resposta útil foi gerada!');
    } else {
      console.log('✅ Resposta gerada com sucesso');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDipirona().catch(console.error);