const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDipironaSearch() {
  try {
    console.log('🔍 Testando busca por dipirona...');
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'dipirona', mode: 'insensitive' } },
          { description: { contains: 'dipirona', mode: 'insensitive' } }
        ]
      }
    });
    
    console.log(`Produtos encontrados: ${products.length}`);
    products.forEach(p => {
      console.log(`- ${p.name} (ID: ${p.id}) - €${p.price}`);
    });
    
    console.log('\n🔍 Testando busca por paracetamol...');
    
    const paracetamolProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'paracetamol', mode: 'insensitive' } },
          { description: { contains: 'paracetamol', mode: 'insensitive' } }
        ]
      }
    });
    
    console.log(`Produtos encontrados: ${paracetamolProducts.length}`);
    paracetamolProducts.forEach(p => {
      console.log(`- ${p.name} (ID: ${p.id}) - €${p.price}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDipironaSearch();