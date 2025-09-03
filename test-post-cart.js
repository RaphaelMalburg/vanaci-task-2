const http = require('http');

function testPostCart() {
  console.log('🧪 Testando POST /api/cart...');
  
  const postData = JSON.stringify({
    sessionId: 'test-session-manual',
    productId: '1',
    quantity: 1
  });
  
  const options = {
    hostname: 'localhost',
    port: 3007,
    path: '/api/cart',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('📊 Status:', res.statusCode);
    console.log('📋 Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Resposta:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('📄 Resposta (texto):', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Erro:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testPostCart();