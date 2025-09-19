const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔍 Verificando se usuário de teste já existe...');
    
    const existingUser = await prisma.user.findUnique({
      where: { username: 'testuser' }
    });
    
    if (existingUser) {
      console.log('✅ Usuário de teste já existe:', existingUser.username);
      console.log('📧 ID:', existingUser.id);
      return existingUser;
    }
    
    console.log('👤 Criando usuário de teste...');
    
    // Senha em texto simples (POC)
    const password = '123456';
    
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        password: password
      }
    });
    
    // Criar carrinho vazio para o usuário
    await prisma.userCart.create({
      data: {
        userId: user.id,
        total: 0
      }
    });
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('👤 Username:', user.username);
    console.log('📧 ID:', user.id);
    console.log('🔑 Password: 123456');
    
    return user;
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestUser().catch(console.error);
}

module.exports = { createTestUser };