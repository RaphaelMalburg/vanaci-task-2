const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testKneePain() {
  console.log('🧪 Testando caso específico: "algo pra dor no joelho"');
  
  const testMessage = 'algo pra dor no joelho';
  
  try {
    console.log(`📝 Enviando: "${testMessage}"`);
    
    const response = await fetch('http://localhost:3007/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        sessionId: 'knee-pain-test-session'
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
    let toolResultsWithProducts = 0;
    let overlayData = null;
    let foundProducts = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          
          // Debug: mostrar todos os dados que contêm 'tool'
          if (JSON.stringify(data).toLowerCase().includes('tool')) {
            console.log(`🔍 Debug - Linha ${index}: ${JSON.stringify(data)}`);
          }
          
          // Detect tool_result specifically
          if (data.type === 'tool_result') {
            console.log('🔧 Tool result detected:', {
              toolCallId: data.toolResult?.toolCallId,
              hasResult: !!data.toolResult?.result,
              resultType: typeof data.toolResult?.result
            });
            
            if (data.toolResult?.result?.data?.products) {
              const products = data.toolResult.result.data.products;
              console.log(`📦 Tool result has ${products.length} products:`, products.map(p => p.name));
              
              if (data.toolResult.result.data.showInOverlay) {
                console.log('✅ Overlay data detected in tool result!');
                overlayData = data.toolResult.result.data;
              }
            }
          }
          
          if (data.type === 'tool_call') {
            console.log(`🔧 Tool Call: ${data.toolCall?.toolName}`);
            
            if (data.toolCall?.toolName === 'search_products') {
              searchProductsCalls++;
              console.log(`  Query: ${data.toolCall?.args?.query}`);
            }
            
            if (data.toolCall?.toolName === 'show_multiple_products') {
              showMultipleProductsCalls++;
              console.log(`  Product IDs: ${JSON.stringify(data.toolCall?.args?.productIds)}`);
            }
            
            if (data.toolCall?.toolName === 'list_recommended_products') {
              console.log(`  🎯 list_recommended_products chamada`);
              console.log(`  Query: ${data.toolCall?.args?.symptomOrNeed}`);
            }
          }
          
          if (data.type === 'tool_result') {
            console.log(`🔧 Tool Result:`, data.toolResult?.toolCallId);
            
            // Verificar se é resultado de list_recommended_products
            if (data.toolResult?.result?.products) {
              toolResultsWithProducts++;
              foundProducts = data.toolResult.result.products;
              console.log(`  📦 Produtos encontrados (list_recommended_products): ${foundProducts.length}`);
              foundProducts.forEach((product, i) => {
                console.log(`    ${i+1}. ${product.name} - €${product.price}`);
              });
              
              // Verificar se tem showInOverlay
              if (data.toolResult?.result?.showInOverlay) {
                overlayData = {
                  title: "Produtos Recomendados",
                  products: foundProducts,
                  showInOverlay: true
                };
                console.log(`  🎨 Overlay configurado para list_recommended_products`);
              }
            }
            
            // Verificar formato antigo (show_multiple_products)
            if (data.toolResult?.result?.data?.products) {
              toolResultsWithProducts++;
              foundProducts = data.toolResult.result.data.products;
              console.log(`  📦 Produtos encontrados (show_multiple_products): ${foundProducts.length}`);
              foundProducts.forEach((product, i) => {
                console.log(`    ${i+1}. ${product.name} - €${product.price}`);
              });
            }
            
            if (data.toolResult?.result?.data?.showInOverlay) {
              overlayData = data.toolResult.result.data;
              console.log(`  🎨 Dados do overlay:`, {
                title: overlayData.title,
                productsCount: overlayData.products?.length,
                showInOverlay: overlayData.showInOverlay
              });
            }
          }
          
          if (data.type === 'text') {
            console.log(`📝 Texto: ${data.content?.substring(0, 100)}...`);
          }
        } catch (e) {
          // Ignorar erros de parse
        }
      }
    });
    
    console.log(`\n📊 Resumo do teste:`);
    console.log(`  - search_products calls: ${searchProductsCalls}`);
    console.log(`  - show_multiple_products calls: ${showMultipleProductsCalls}`);
    console.log(`  - Tool results com produtos: ${toolResultsWithProducts}`);
    console.log(`  - Produtos encontrados: ${foundProducts.length}`);
    console.log(`  - Overlay data presente: ${overlayData ? 'SIM' : 'NÃO'}`);
    
    if (foundProducts.length > 0 && overlayData) {
      console.log('✅ SUCESSO: Produtos encontrados e overlay configurado!');
    } else if (foundProducts.length > 0 && !overlayData) {
      console.log('⚠️ PROBLEMA: Produtos encontrados mas overlay não configurado');
    } else {
      console.log('❌ PROBLEMA: Nenhum produto encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

testKneePain().catch(console.error);