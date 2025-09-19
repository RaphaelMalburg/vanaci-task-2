const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuração
const BASE_URL = 'http://localhost:3007';
const TEST_SESSION_ID = 'test-debug-session';

// Função auxiliar para fazer requisições
function makeRequest(endpoint, options = {}) {
  return new Promise((resolve) => {
    try {
      const url = new URL(`${BASE_URL}${endpoint}`);
      console.log(`🔗 Fazendo requisição: ${options.method || 'GET'} ${url.href}`);
      
      const requestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };
      
      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`✅ Sucesso ${res.statusCode}`);
              resolve({ success: true, data: jsonData, status: res.statusCode });
            } else {
              console.log(`❌ Erro ${res.statusCode}: ${jsonData.error || res.statusMessage}`);
              resolve({ success: false, error: jsonData.error || res.statusMessage, status: res.statusCode });
            }
          } catch (parseError) {
            console.log(`💥 Erro ao parsear JSON: ${parseError.message}`);
            resolve({ success: false, error: `Erro ao parsear resposta: ${parseError.message}` });
          }
        });
      });
      
      req.on('error', (error) => {
        console.log(`💥 Erro de rede: ${error.message}`);
        resolve({ success: false, error: error.message });
      });
      
      // Enviar dados do body se fornecido
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    } catch (error) {
      console.log(`💥 Erro na requisição: ${error.message}`);
      resolve({ success: false, error: error.message });
    }
  });
}

// Função para buscar produtos e encontrar IDs corretos
async function findProductIds() {
  console.log('\n🔍 Buscando produtos para encontrar IDs corretos...');
  
  const result = await makeRequest('/api/products');
  if (!result.success) {
    console.log('❌ Falha ao buscar produtos');
    return null;
  }
  
  const products = result.data;
  console.log(`📦 Total de produtos encontrados: ${products.length}`);
  
  // Buscar Aspirina Express
  const aspirina = products.find(p => p.name.toLowerCase().includes('aspirina'));
  if (aspirina) {
    console.log(`💊 Aspirina encontrada: ID=${aspirina.id}, Nome="${aspirina.name}"`);
  } else {
    console.log('❌ Aspirina não encontrada');
  }
  
  // Buscar Momendol
  const momendol = products.find(p => p.name.toLowerCase().includes('momendol'));
  if (momendol) {
    console.log(`💊 Momendol encontrado: ID=${momendol.id}, Nome="${momendol.name}"`);
  } else {
    console.log('❌ Momendol não encontrado');
  }
  
  // Retornar os primeiros 3 produtos para teste
  const testProducts = products.slice(0, 3);
  console.log('\n🧪 Produtos para teste:');
  testProducts.forEach((product, index) => {
    console.log(`  ${index + 1}. ID=${product.id}, Nome="${product.name}", Preço=€${product.price}`);
  });
  
  return { aspirina, momendol, testProducts };
}

// Função para testar adição ao carrinho
async function testAddToCart(productId, productName) {
  console.log(`\n🛒 Testando adição ao carrinho: ${productName} (ID: ${productId})`);
  
  const result = await makeRequest('/api/cart', {
    method: 'POST',
    body: JSON.stringify({
      productId: productId,
      quantity: 1,
      sessionId: TEST_SESSION_ID
    })
  });
  
  if (result.success) {
    console.log(`✅ Produto adicionado com sucesso`);
    console.log(`   Carrinho: ${result.data.cart?.itemCount || 0} itens, Total: €${result.data.cart?.total || 0}`);
  } else {
    console.log(`❌ Falha ao adicionar produto: ${result.error}`);
    if (result.status === 404) {
      console.log(`   🔍 Produto com ID "${productId}" não foi encontrado no banco de dados`);
    }
  }
  
  return result;
}

// Função para verificar carrinho
async function checkCart() {
  console.log('\n👀 Verificando estado atual do carrinho...');
  
  const result = await makeRequest(`/api/cart?sessionId=${TEST_SESSION_ID}`);
  
  if (result.success) {
    const cart = result.data;
    console.log(`📊 Carrinho: ${cart.itemCount} itens, Total: €${cart.total}`);
    
    if (cart.items && cart.items.length > 0) {
      console.log('📋 Itens no carrinho:');
      cart.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - Qtd: ${item.quantity} - €${item.price}`);
      });
    } else {
      console.log('🛒 Carrinho vazio');
    }
  } else {
    console.log(`❌ Erro ao verificar carrinho: ${result.error}`);
  }
  
  return result;
}

// Função para limpar carrinho
async function clearCart() {
  console.log('\n🧹 Limpando carrinho...');
  
  const result = await makeRequest('/api/cart', {
    method: 'DELETE',
    body: JSON.stringify({
      sessionId: TEST_SESSION_ID,
      clearAll: true
    })
  });
  
  if (result.success) {
    console.log('✅ Carrinho limpo com sucesso');
  } else {
    console.log(`❌ Erro ao limpar carrinho: ${result.error}`);
  }
  
  return result;
}

// Função principal
async function main() {
  console.log('🚀 Iniciando debug dos problemas do carrinho...');
  console.log(`🔧 URL Base: ${BASE_URL}`);
  console.log(`🆔 Session ID: ${TEST_SESSION_ID}`);
  
  try {
    // 1. Buscar produtos e IDs corretos
    const productData = await findProductIds();
    if (!productData) {
      console.log('❌ Não foi possível buscar produtos. Encerrando.');
      return;
    }
    
    // 2. Limpar carrinho antes dos testes
    await clearCart();
    
    // 3. Verificar carrinho vazio
    await checkCart();
    
    // 4. Testar com produtos válidos
    if (productData.testProducts.length > 0) {
      console.log('\n🧪 Testando com produtos válidos...');
      
      for (const product of productData.testProducts) {
        await testAddToCart(product.id, product.name);
        await checkCart();
      }
    }
    
    // 5. Testar com IDs inválidos (que causam 404)
    console.log('\n🚫 Testando com IDs inválidos...');
    await testAddToCart('invalid-id-123', 'Produto Inexistente');
    await testAddToCart('momendol', 'Momendol (ID incorreto)');
    await testAddToCart('aspirina', 'Aspirina (ID incorreto)');
    
    // 6. Verificar carrinho final
    console.log('\n📊 Estado final do carrinho:');
    await checkCart();
    
    console.log('\n✅ Debug concluído!');
    
    // 7. Análise dos problemas encontrados
    console.log('\n📋 ANÁLISE DOS PROBLEMAS:');
    console.log('1. Os produtos têm IDs gerados automaticamente pelo Prisma (UUIDs)');
    console.log('2. Os testes estavam usando nomes como IDs ("momendol", "aspirina")');
    console.log('3. Isso causa erros 404 porque esses IDs não existem no banco');
    console.log('4. É necessário usar os IDs reais dos produtos para adicionar ao carrinho');
    
    if (productData.aspirina) {
      console.log(`5. ID correto da Aspirina: ${productData.aspirina.id}`);
    }
    if (productData.momendol) {
      console.log(`6. ID correto do Momendol: ${productData.momendol.id}`);
    }
    
  } catch (error) {
    console.error('💥 Erro durante o debug:', error);
  }
}

// Executar
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, findProductIds, testAddToCart, checkCart };