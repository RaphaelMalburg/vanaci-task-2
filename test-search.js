const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSearch() {
  try {
    console.log('🔍 Testando busca por "dor"...');
    const dorProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'dor', mode: 'insensitive' } },
          { description: { contains: 'dor', mode: 'insensitive' } },
          { manufacturer: { contains: 'dor', mode: 'insensitive' } }
        ]
      },
      take: 10
    });
    console.log(`Produtos com "dor": ${dorProducts.length}`);
    dorProducts.forEach(p => console.log(`- ${p.name} (${p.category})`));

    console.log('\n🔍 Testando busca por "analgésico"...');
    const analgesicProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'analgésico', mode: 'insensitive' } },
          { description: { contains: 'analgésico', mode: 'insensitive' } },
          { category: { contains: 'analgésico', mode: 'insensitive' } }
        ]
      },
      take: 10
    });
    console.log(`Produtos analgésicos: ${analgesicProducts.length}`);
    analgesicProducts.forEach(p => console.log(`- ${p.name} (${p.category})`));

    console.log('\n🔍 Testando busca por categoria "Analgésicos"...');
    const categoryProducts = await prisma.product.findMany({
      where: {
        category: { equals: 'Analgésicos', mode: 'insensitive' }
      },
      take: 10
    });
    console.log(`Produtos na categoria Analgésicos: ${categoryProducts.length}`);
    categoryProducts.forEach(p => console.log(`- ${p.name} - €${p.price}`));

    console.log('\n📊 Total de produtos no banco:');
    const totalProducts = await prisma.product.count();
    console.log(`Total: ${totalProducts} produtos`);

    console.log('\n📋 Categorias disponíveis:');
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    });
    categories.forEach(c => console.log(`- ${c.category}`));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearch();