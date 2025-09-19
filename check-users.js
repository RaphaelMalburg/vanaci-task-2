const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Verificando usuários no banco de dados...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        password: true,
        createdAt: true
      }
    });
    
    console.log('Usuários encontrados:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Password: ${user.password}, Created: ${user.createdAt}`);
    });
    
    if (users.length === 0) {
      console.log('Nenhum usuário encontrado no banco de dados.');
    }
    
  } catch (error) {
    console.error('Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();