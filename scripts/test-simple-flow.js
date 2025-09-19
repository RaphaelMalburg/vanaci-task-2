// Usar tsx para executar TypeScript diretamente
const { execSync } = require('child_process');

// Executar o teste usando tsx
try {
  const result = execSync('npx tsx scripts/test-simple-flow.ts', { encoding: 'utf8' });
  console.log(result);
} catch (error) {
  console.error('Erro:', error.message);
  process.exit(1);
}