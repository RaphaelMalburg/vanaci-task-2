const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('Verificando produtos no banco de dados...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      },
      take: 10 // Limitar a 10 produtos para não sobrecarregar
    });
    
    console.log('Produtos encontrados:');
    products.forEach(product => {
      console.log(`- ID: ${product.id}, Nome: ${product.name}, Preço: ${product.price}, Estoque: ${product.stock}`);
    });
    
    if (products.length === 0) {
      console.log('Nenhum produto encontrado no banco de dados.');
    }
    
  } catch (error) {
    console.error('Erro ao verificar produtos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();