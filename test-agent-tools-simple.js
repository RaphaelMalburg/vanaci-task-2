const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3007';

async function testAgentTools() {
  console.log('🧪 Testing Agent Tools...');
  
  // Test 1: Product Search
  console.log('\n🔍 Testing Product Search...');
  const searchResult = await fetch(`${BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'buscar dipirona',
      sessionId: 'test-session-123'
    })
  });
  const searchData = await searchResult.json();
  console.log('Search Result:', searchData.response ? '✅ Success' : '❌ Failed');
  
  // Test 2: Add to Cart
  console.log('\n🛒 Testing Add to Cart...');
  const addResult = await fetch(`${BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'adicionar 2 dipirona',
      sessionId: 'test-session-123'
    })
  });
  const addData = await addResult.json();
  console.log('Add Result:', addData.response ? '✅ Success' : '❌ Failed');
  
  // Test 3: View Cart
  console.log('\n👀 Testing View Cart...');
  const cartResult = await fetch(`${BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'ver carrinho',
      sessionId: 'test-session-123'
    })
  });
  const cartData = await cartResult.json();
  console.log('Cart Result:', cartData.response ? '✅ Success' : '❌ Failed');
  
  // Test 4: Navigation
  console.log('\n🧭 Testing Navigation...');
  const navResult = await fetch(`${BASE_URL}/api/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'ir para produtos',
      sessionId: 'test-session-123'
    })
  });
  const navData = await navResult.json();
  console.log('Navigation Result:', navData.response ? '✅ Success' : '❌ Failed');
  
  console.log('\n✅ All tests completed!');
}

testAgentTools().catch(console.error);