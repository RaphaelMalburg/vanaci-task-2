// Browser-based test for agent tools
// Run this in browser console when localhost:3007 is open

console.log('🧪 Testing Agent Tools via Browser...');

const BASE_URL = 'http://localhost:3007';

async function testAgentTools() {
  console.log('\n🔍 Testing Product Search...');
  const searchResult = await fetch(`${BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'buscar dipirona',
      sessionId: 'test-session-123'
    })
  }).then(r => r.json());
  console.log('Search:', searchResult.response ? '✅' : '❌', searchResult.response);

  console.log('\n🛒 Testing Add to Cart...');
  const addResult = await fetch(`${BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'adicionar 2 dipirona',
      sessionId: 'test-session-123'
    })
  }).then(r => r.json());
  console.log('Add:', addResult.response ? '✅' : '❌', addResult.response);

  console.log('\n👀 Testing View Cart...');
  const cartResult = await fetch(`${BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'ver carrinho',
      sessionId: 'test-session-123'
    })
  }).then(r => r.json());
  console.log('Cart:', cartResult.response ? '✅' : '❌', cartResult.response);

  console.log('\n🧭 Testing Navigation...');
  const navResult = await fetch(`${BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'ir para produtos',
      sessionId: 'test-session-123'
    })
  }).then(r => r.json());
  console.log('Navigation:', navResult.response ? '✅' : '❌', navResult.response);
}

// Run tests
testAgentTools().then(() => {
  console.log('\n✅ All browser tests completed!');
}).catch(console.error);