const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Verificando produtos no banco de dados...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        stock: true,
        prescription: true
      }
    });
    
    console.log(`\n📦 Total de produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ Nenhum produto encontrado no banco de dados!');
      return;
    }
    
    console.log('\n📋 Lista de produtos:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product.id}`);
      console.log(`   Nome: ${product.name}`);
      console.log(`   Preço: R$ ${product.price}`);
      console.log(`   Categoria: ${product.category}`);
      console.log(`   Estoque: ${product.stock}`);
      console.log(`   Prescrição: ${product.prescription ? 'Sim' : 'Não'}`);
      console.log('---');
    });
    
    // Verificar se há produtos em estoque
    const inStockProducts = products.filter(p => p.stock > 0);
    console.log(`\n✅ Produtos em estoque: ${inStockProducts.length}`);
    
    if (inStockProducts.length === 0) {
      console.log('⚠️  Nenhum produto em estoque!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar produtos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();