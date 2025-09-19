/**
 * Script para testar as correções do fluxo de limpar carrinho
 * Testa se o parâmetro clearAll=true está sendo enviado corretamente
 */

const { default: fetch } = require('node-fetch');

// Configuração
const BASE_URL = 'http://localhost:3007';
const TEST_USER = {
  username: 'admin',
  password: '12345'
};

// Função para registrar usuário de teste
async function registerTestUser() {
  console.log('👤 Registrando usuário de teste...');
  
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(TEST_USER)
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Usuário registrado com sucesso');
    return data.token;
  } else if (response.status === 409) {
    console.log('ℹ️  Usuário já existe, tentando login...');
    return null;
  } else {
    const errorText = await response.text();
    throw new Error(`Registro falhou: ${response.status} ${errorText}`);
  }
}

// Função para fazer login e obter token
async function login() {
  console.log('🔐 Fazendo login...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(TEST_USER)
  });
  
  if (!response.ok) {
    throw new Error(`Login falhou: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Login realizado com sucesso');
  console.log('👤 Usuário:', data.user.username);
  
  return data.token;
}

// Função para adicionar item ao carrinho
async function addItemToCart(token, productId = 'cmfb674mt0001vb7gnhau6fon') {
  console.log('\n🛒 Adicionando item ao carrinho...');
  
  const response = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      productId: productId,
      quantity: 2
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao adicionar item: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Item adicionado com sucesso');
  console.log('📊 Itens no carrinho:', data.cart.items.length);
  
  return data.cart;
}

// Função para obter carrinho atual
async function getCart(token) {
  console.log('\n📋 Obtendo carrinho atual...');
  
  const response = await fetch(`${BASE_URL}/api/cart`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao obter carrinho: ${response.status} ${errorText}`);
  }
  
  const cart = await response.json();
  console.log('📊 Itens no carrinho:', cart.items.length);
  console.log('💰 Total:', cart.total);
  
  return cart;
}

// Função para limpar carrinho (testando a correção)
async function clearCart(token) {
  console.log('\n🧹 Limpando carrinho (testando correção)...');
  
  const response = await fetch(`${BASE_URL}/api/cart`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ clearAll: true })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro ao limpar carrinho:', response.status, errorText);
    throw new Error(`Erro ao limpar carrinho: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  console.log('✅ Carrinho limpo com sucesso');
  console.log('📊 Itens restantes:', data.cart.items.length);
  console.log('💰 Total:', data.cart.total);
  
  return data.cart;
}

// Função principal de teste
async function testClearCartFix() {
  try {
    console.log('🧪 === TESTE DE CORREÇÃO DO CLEAR CART ===\n');
    
    // 1. Tentar registrar usuário (se não existir)
    let token = await registerTestUser();
    
    // 2. Se usuário já existe, fazer login
    if (!token) {
      token = await login();
    }
    
    // 3. Verificar carrinho inicial
    await getCart(token);
    
    // 4. Adicionar alguns itens
    await addItemToCart(token);
    
    // 5. Verificar carrinho com itens
    const cartWithItems = await getCart(token);
    
    if (cartWithItems.items.length === 0) {
      console.log('⚠️  Carrinho vazio, adicionando item novamente...');
      await addItemToCart(token);
    }
    
    // 6. Limpar carrinho (testando a correção)
    const clearedCart = await clearCart(token);
    
    // 7. Verificar se carrinho foi limpo
    if (clearedCart.items.length === 0 && clearedCart.total === 0) {
      console.log('\n🎉 TESTE PASSOU! Carrinho foi limpo corretamente.');
      console.log('✅ A correção do parâmetro clearAll=true funcionou!');
    } else {
      console.log('\n❌ TESTE FALHOU! Carrinho não foi limpo completamente.');
      console.log('📊 Itens restantes:', clearedCart.items.length);
      console.log('💰 Total restante:', clearedCart.total);
    }
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    process.exit(1);
  }
}

// Executar teste
if (require.main === module) {
  testClearCartFix();
}

module.exports = { testClearCartFix };