import { PharmacyAIAgent } from '../src/lib/ai-agent/index';

async function testSimpleFlow() {
  console.log('🧪 Testando fluxo simples do agente...');
  
  try {
    const agent = new PharmacyAIAgent();
    console.log('🔧 Agente criado com sucesso');
    
    console.log('📝 Enviando mensagem: "preciso de paracetamol"');
    const response = await agent.processMessage('test-session', 'preciso de paracetamol');
    
    console.log('✅ Resposta do agente:');
    console.log('---START RESPONSE---');
    console.log(JSON.stringify(response));
    console.log('---END RESPONSE---');
    console.log('Tipo da resposta:', typeof response);
    console.log('Tamanho da resposta:', response ? response.length : 'null/undefined');
    
    // Verificar se a resposta contém informações de produtos
    if (response && response.trim() && (response.includes('paracetamol') || response.includes('produto') || response.includes('€') || response.includes('preço'))) {
      console.log('✅ Agente encontrou produtos relacionados');
    } else {
      console.log('❌ Agente não encontrou produtos');
      console.log('Resposta vazia ou sem informações de produtos');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível');
    process.exit(1);
  }
}

testSimpleFlow();