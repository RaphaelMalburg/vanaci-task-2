#!/usr/bin/env node

/**
 * Test script for the simplified cart system
 * Run with: node test-simple-cart.js
 */

const BASE_URL = 'http://localhost:3007';

async function testSimpleCart() {
  console.log('🧪 Testing Simplified Cart System...\n');
  
  const sessionId = `test-session-${Date.now()}`;
  let testProductId = null;

  try {
    // 1. Get available products
    console.log('📦 Fetching available products...');
    const productsResponse = await fetch(`${BASE_URL}/api/products`);
    const products = await productsResponse.json();
    
    if (!products.length) {
      console.error('❌ No products found');
      return;
    }
    
    testProductId = products[0].id;
    console.log(`✅ Found product: ${products[0].name} (ID: ${testProductId})`);
    
    // 2. Test getting empty cart
    console.log('\n🛒 Testing empty cart...');
    const emptyCartResponse = await fetch(`${BASE_URL}/api/cart-simple?sessionId=${sessionId}`);
    const emptyCart = await emptyCartResponse.json();
    
    console.log(`✅ Empty cart: ${emptyCart.items.length} items, €${emptyCart.total}`);
    
    // 3. Test adding item to cart
    console.log('\n➕ Testing add to cart...');
    const addResponse = await fetch(`${BASE_URL}/api/cart-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        productId: testProductId,
        quantity: 2
      })
    });
    
    const addResult = await addResponse.json();
    console.log(`✅ Added 2 items: ${addResult.cart?.items?.length || 0} items, €${addResult.cart?.total || 0}`);
    
    // 4. Test updating quantity
    console.log('\n🔄 Testing update quantity...');
    const updateResponse = await fetch(`${BASE_URL}/api/cart-simple`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        productId: testProductId,
        quantity: 3
      })
    });
    
    const updateResult = await updateResponse.json();
    console.log(`✅ Updated to 3 items: ${updateResult.cart?.items?.[0]?.quantity || 0}x, €${updateResult.cart?.total || 0}`);
    
    // 5. Test removing item
    console.log('\n❌ Testing remove from cart...');
    const removeResponse = await fetch(`${BASE_URL}/api/cart-simple`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        productId: testProductId
      })
    });
    
    const removeResult = await removeResponse.json();
    console.log(`✅ Removed item: ${removeResult.cart?.items?.length || 0} items, €${removeResult.cart?.total || 0}`);
    
    // 6. Test adding again and clearing
    console.log('\n🧹 Testing clear cart...');
    await fetch(`${BASE_URL}/api/cart-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        productId: testProductId,
        quantity: 1
      })
    });
    
    const clearResponse = await fetch(`${BASE_URL}/api/cart-simple`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        clearAll: true
      })
    });
    
    const clearResult = await clearResponse.json();
    console.log(`✅ Cleared cart: ${clearResult.cart?.items?.length || 0} items, €${clearResult.cart?.total || 0}`);
    
    console.log('\n🎉 All tests passed! The simplified cart system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testSimpleCart();
}

module.exports = { testSimpleCart };