
#!/usr/bin/env node

/**
 * Comprehensive test suite for pharmacy agent tools
 * Tests real scenarios with actual API calls
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3007';
const API_BASE = `${BASE_URL}/api`;

// Generate session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

const testConfig = {
  sessionId: generateSessionId(),
  userId: 'test-user-123'
};

console.log('🧪 Starting comprehensive agent tools test suite...');
console.log(`📋 Test Session ID: ${testConfig.sessionId}`);

// Test utilities
async function makeRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 1: Product Search
async function testProductSearch() {
  console.log('\n🔍 Test 1: Product Search');
  
  const queries = ['dipirona', 'paracetamol', 'vitamina', 'termômetro'];
  
  for (const query of queries) {
    console.log(`  Searching for: "${query}"`);
    const result = await makeRequest(`/ai-chat`, 'POST', {
      message: `buscar ${query}`,
      sessionId: testConfig.sessionId
    });
    
    if (result.success) {
      console.log(`  ✅ Found products for "${query}"`);
    } else {
      console.log(`  ❌ Failed to search for "${query}": ${result.error}`);
    }
  }
}

// Test 2: Cart Operations
async function testCartOperations() {
  console.log('\n🛒 Test 2: Cart Operations');
  
  // Test 2.1: View empty cart
  console.log('  2.1 Viewing empty cart...');
  let result = await makeRequest(`/ai-chat`, 'POST', {
    message: 'mostrar carrinho',
    sessionId: testConfig.sessionId
  });
  console.log(result.success ? '  ✅ Empty cart viewed' : '  ❌ Failed to view cart');
  
  // Test 2.2: Add products to cart
  console.log('  2.2 Adding products to cart...');
  const productsToAdd = [
    { name: 'dipirona', quantity: 2 },
    { name: 'paracetamol', quantity: 1 },
    { name: 'vitamina c', quantity: 3 }
  ];
  
  for (const product of productsToAdd) {
    console.log(`    Adding ${product.quantity}x ${product.name}...`);
    result = await makeRequest(`/ai-chat`, 'POST', {
      message: `adicionar ${product.quantity} ${product.name}`,
      sessionId: testConfig.sessionId
    });
    
    if (result.success) {
      console.log(`    ✅ Added ${product.name}`);
    } else {
      console.log(`    ❌ Failed to add ${product.name}: ${result.error}`);
    }
  }
  
  // Test 2.3: View cart with items
  console.log('  2.3 Viewing cart with items...');
  result = await makeRequest(`/ai-chat`, 'POST', {
    message: 'ver meu carrinho',
    sessionId: testConfig.sessionId
  });
  console.log(result.success ? '  ✅ Cart with items viewed' : '  ❌ Failed to view cart');
  
  // Test 2.4: Remove item from cart
  console.log('  2.4 Removing item from cart...');
  result = await makeRequest(`/ai-chat`, 'POST', {
    message: 'remover dipirona do carrinho',
    sessionId: testConfig.sessionId
  });
  console.log(result.success ? '  ✅ Item removed' : '  ❌ Failed to remove item');
}

// Test 3: Navigation
async function testNavigation() {
  console.log('\n🧭 Test 3: Navigation');
  
  const pages = ['home', 'products', 'cart', 'checkout'];
  
  for (const page of pages) {
    console.log(`  Navigating to ${page}...`);
    const result = await make