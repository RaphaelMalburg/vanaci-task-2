import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapeamento de produtos para imagens específicas
const imageMapping: { [key: string]: string } = {
  'Álcool Gel 70%': '/imagensRemedios/alcool.png',
  'Shampoo Anticaspa': '/imagensRemedios/anticaspa.png',
  'Soro Fisiológico': '/imagensRemedios/fisiologica.png',
  'Fita Teste Glicemia': '/imagensRemedios/glicemia.png',
  'Hidratante Facial': '/imagensRemedios/hidratante.png',
  'Aparelho de Pressão': '/imagensRemedios/pressao.png',
  'Protetor Solar FPS 60': '/imagensRemedios/protetorsolar.png',
  'Termômetro Digital': '/imagensRemedios/termometro.png'
}

// Função para obter caminho da imagem
function getImagePath(productName: string): string {
  return imageMapping[productName] || '/imagensRemedios/remedio.png'
}

// Mock de produtos farmacêuticos divididos por categorias
const products = [
  // ANALGÉSICOS E ANTI-INFLAMATÓRIOS
  {
    name: 'Dipirona 500mg',
    description: 'Analgésico e antitérmico para dores e febre',
    category: 'Analgésicos',
    price: 8.50,
    stock: 150,
    prescription: false,
    manufacturer: 'EMS',
    imageUrl: '' // Adicionar URL da imagem aqui
  },
  {
    name: 'Ibuprofeno 600mg',
    description: 'Anti-inflamatório não esteroidal',
    category: 'Anti-inflamatórios',
    price: 12.90,
    stock: 80,
    prescription: false,
    manufacturer: 'Medley',
    imageUrl: ''
  },
  {
    name: 'Paracetamol 750mg',
    description: 'Analgésico e antitérmico',
    category: 'Analgésicos',
    price: 6.80,
    stock: 200,
    prescription: false,
    manufacturer: 'Eurofarma',
    imageUrl: ''
  },
  {
    name: 'Diclofenaco Sódico 50mg',
    description: 'Anti-inflamatório para dores musculares',
    category: 'Anti-inflamatórios',
    price: 15.40,
    stock: 60,
    prescription: false,
    manufacturer: 'Voltaren',
    imageUrl: ''
  },
  {
    name: 'Nimesulida 100mg',
    description: 'Anti-inflamatório e analgésico',
    category: 'Anti-inflamatórios',
    price: 18.70,
    stock: 45,
    prescription: false,
    manufacturer: 'Apsen',
    imageUrl: ''
  },

  // ANTIBIÓTICOS
  {
    name: 'Amoxicilina 500mg',
    description: 'Antibiótico de amplo espectro',
    category: 'Antibióticos',
    price: 25.90,
    stock: 40,
    prescription: true,
    manufacturer: 'Neo Química',
    imageUrl: ''
  },
  {
    name: 'Azitromicina 500mg',
    description: 'Antibiótico para infecções respiratórias',
    category: 'Antibióticos',
    price: 32.50,
    stock: 35,
    prescription: true,
    manufacturer: 'Sandoz',
    imageUrl: ''
  },
  {
    name: 'Cefalexina 500mg',
    description: 'Antibiótico cefalosporínico',
    category: 'Antibióticos',
    price: 28.90,
    stock: 30,
    prescription: true,
    manufacturer: 'Cimed',
    imageUrl: ''
  },
  {
    name: 'Ciprofloxacino 500mg',
    description: 'Antibiótico quinolona',
    category: 'Antibióticos',
    price: 35.80,
    stock: 25,
    prescription: true,
    manufacturer: 'Eurofarma',
    imageUrl: ''
  },

  // VITAMINAS E SUPLEMENTOS
  {
    name: 'Vitamina C 1g',
    description: 'Suplemento vitamínico efervescente',
    category: 'Vitaminas',
    price: 22.90,
    stock: 100,
    prescription: false,
    manufacturer: 'Redoxon',
    imageUrl: ''
  },
  {
    name: 'Complexo B',
    description: 'Vitaminas do complexo B',
    category: 'Vitaminas',
    price: 18.50,
    stock: 75,
    prescription: false,
    manufacturer: 'Centrum',
    imageUrl: ''
  },
  {
    name: 'Vitamina D3 2000UI',
    description: 'Suplemento de vitamina D',
    category: 'Vitaminas',
    price: 35.90,
    stock: 60,
    prescription: false,
    manufacturer: 'Addera',
    imageUrl: ''
  },
  {
    name: 'Ômega 3 1000mg',
    description: 'Suplemento de ácidos graxos',
    category: 'Suplementos',
    price: 45.90,
    stock: 50,
    prescription: false,
    manufacturer: 'Vitafor',
    imageUrl: ''
  },
  {
    name: 'Ferro Quelato',
    description: 'Suplemento de ferro',
    category: 'Suplementos',
    price: 28.90,
    stock: 40,
    prescription: false,
    manufacturer: 'Noripurum',
    imageUrl: ''
  },

  // MEDICAMENTOS PARA PRESSÃO
  {
    name: 'Losartana 50mg',
    description: 'Anti-hipertensivo',
    category: 'Cardiovascular',
    price: 15.90,
    stock: 80,
    prescription: true,
    manufacturer: 'EMS',
    imageUrl: ''
  },
  {
    name: 'Enalapril 10mg',
    description: 'Inibidor da ECA',
    category: 'Cardiovascular',
    price: 12.50,
    stock: 90,
    prescription: true,
    manufacturer: 'Medley',
    imageUrl: ''
  },
  {
    name: 'Amlodipina 5mg',
    description: 'Bloqueador de canal de cálcio',
    category: 'Cardiovascular',
    price: 18.90,
    stock: 70,
    prescription: true,
    manufacturer: 'Eurofarma',
    imageUrl: ''
  },
  {
    name: 'Hidroclorotiazida 25mg',
    description: 'Diurético tiazídico',
    category: 'Cardiovascular',
    price: 8.90,
    stock: 100,
    prescription: true,
    manufacturer: 'Neo Química',
    imageUrl: ''
  },

  // MEDICAMENTOS PARA DIABETES
  {
    name: 'Metformina 850mg',
    description: 'Antidiabético oral',
    category: 'Diabetes',
    price: 22.90,
    stock: 60,
    prescription: true,
    manufacturer: 'Glifage',
    imageUrl: ''
  },
  {
    name: 'Glibenclamida 5mg',
    description: 'Hipoglicemiante oral',
    category: 'Diabetes',
    price: 16.50,
    stock: 45,
    prescription: true,
    manufacturer: 'EMS',
    imageUrl: ''
  },

  // MEDICAMENTOS DIGESTIVOS
  {
    name: 'Omeprazol 20mg',
    description: 'Inibidor da bomba de prótons',
    category: 'Digestivo',
    price: 25.90,
    stock: 85,
    prescription: false,
    manufacturer: 'Eurofarma',
    imageUrl: ''
  },
  {
    name: 'Ranitidina 150mg',
    description: 'Bloqueador H2',
    category: 'Digestivo',
    price: 18.50,
    stock: 70,
    prescription: false,
    manufacturer: 'Label',
    imageUrl: ''
  },
  {
    name: 'Domperidona 10mg',
    description: 'Procinético digestivo',
    category: 'Digestivo',
    price: 22.90,
    stock: 55,
    prescription: false,
    manufacturer: 'Motilium',
    imageUrl: ''
  },
  {
    name: 'Simeticona 40mg',
    description: 'Antiflatulento',
    category: 'Digestivo',
    price: 12.90,
    stock: 90,
    prescription: false,
    manufacturer: 'Luftal',
    imageUrl: ''
  },

  // MEDICAMENTOS RESPIRATÓRIOS
  {
    name: 'Salbutamol 100mcg',
    description: 'Broncodilatador spray',
    category: 'Respiratório',
    price: 35.90,
    stock: 30,
    prescription: true,
    manufacturer: 'Aerolin',
    imageUrl: ''
  },
  {
    name: 'Loratadina 10mg',
    description: 'Anti-histamínico',
    category: 'Respiratório',
    price: 15.90,
    stock: 80,
    prescription: false,
    manufacturer: 'Claritin',
    imageUrl: ''
  },
  {
    name: 'Dextrometorfano 15mg',
    description: 'Antitussígeno',
    category: 'Respiratório',
    price: 18.50,
    stock: 65,
    prescription: false,
    manufacturer: 'Bisolvon',
    imageUrl: ''
  },
  {
    name: 'Carbocisteína 250mg',
    description: 'Mucolítico',
    category: 'Respiratório',
    price: 24.90,
    stock: 50,
    prescription: false,
    manufacturer: 'Fluimucil',
    imageUrl: ''
  },

  // MEDICAMENTOS NEUROLÓGICOS
  {
    name: 'Rivotril 2mg',
    description: 'Ansiolítico benzodiazepínico',
    category: 'Neurológico',
    price: 45.90,
    stock: 20,
    prescription: true,
    manufacturer: 'Roche',
    imageUrl: ''
  },
  {
    name: 'Fluoxetina 20mg',
    description: 'Antidepressivo ISRS',
    category: 'Neurológico',
    price: 32.90,
    stock: 35,
    prescription: true,
    manufacturer: 'Prozac',
    imageUrl: ''
  },
  {
    name: 'Sertralina 50mg',
    description: 'Antidepressivo ISRS',
    category: 'Neurológico',
    price: 38.50,
    stock: 30,
    prescription: true,
    manufacturer: 'Zoloft',
    imageUrl: ''
  },

  // DERMOCOSMÉTICOS
  {
    name: 'Protetor Solar FPS 60',
    description: 'Proteção solar facial',
    category: 'Dermocosmético',
    price: 55.90,
    stock: 40,
    prescription: false,
    manufacturer: 'La Roche-Posay',
    imageUrl: ''
  },
  {
    name: 'Hidratante Facial',
    description: 'Creme hidratante para rosto',
    category: 'Dermocosmético',
    price: 42.90,
    stock: 35,
    prescription: false,
    manufacturer: 'Vichy',
    imageUrl: ''
  },
  {
    name: 'Shampoo Anticaspa',
    description: 'Tratamento para caspa',
    category: 'Dermocosmético',
    price: 28.90,
    stock: 50,
    prescription: false,
    manufacturer: 'Selsun',
    imageUrl: ''
  },

  // HIGIENE E CUIDADOS
  {
    name: 'Álcool Gel 70%',
    description: 'Higienizador de mãos',
    category: 'Higiene',
    price: 8.90,
    stock: 200,
    prescription: false,
    manufacturer: 'Antisséptico',
    imageUrl: ''
  },
  {
    name: 'Termômetro Digital',
    description: 'Medidor de temperatura corporal',
    category: 'Equipamentos',
    price: 25.90,
    stock: 25,
    prescription: false,
    manufacturer: 'G-Tech',
    imageUrl: ''
  },
  {
    name: 'Aparelho de Pressão',
    description: 'Monitor de pressão arterial',
    category: 'Equipamentos',
    price: 89.90,
    stock: 15,
    prescription: false,
    manufacturer: 'Omron',
    imageUrl: ''
  },
  {
    name: 'Fita Teste Glicemia',
    description: 'Tiras para medição de glicose',
    category: 'Equipamentos',
    price: 45.90,
    stock: 30,
    prescription: false,
    manufacturer: 'Accu-Chek',
    imageUrl: ''
  },

  // MEDICAMENTOS GINECOLÓGICOS
  {
    name: 'Anticoncepcional Yasmin',
    description: 'Contraceptivo oral combinado',
    category: 'Ginecológico',
    price: 35.90,
    stock: 40,
    prescription: true,
    manufacturer: 'Bayer',
    imageUrl: ''
  },
  {
    name: 'Ácido Fólico 5mg',
    description: 'Suplemento para gestantes',
    category: 'Ginecológico',
    price: 18.90,
    stock: 60,
    prescription: false,
    manufacturer: 'Folifolim',
    imageUrl: ''
  },

  // MEDICAMENTOS PEDIÁTRICOS
  {
    name: 'Paracetamol Gotas',
    description: 'Analgésico infantil',
    category: 'Pediátrico',
    price: 12.90,
    stock: 80,
    prescription: false,
    manufacturer: 'Tylenol',
    imageUrl: ''
  },
  {
    name: 'Soro Fisiológico',
    description: 'Solução para higiene nasal',
    category: 'Pediátrico',
    price: 8.50,
    stock: 100,
    prescription: false,
    manufacturer: 'Rinosoro',
    imageUrl: ''
  },
  {
    name: 'Probiótico Infantil',
    description: 'Regulador da flora intestinal',
    category: 'Pediátrico',
    price: 32.90,
    stock: 45,
    prescription: false,
    manufacturer: 'Floratil',
    imageUrl: ''
  }
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.product.deleteMany()
  console.log('🗑️ Dados existentes removidos')

  // Inserir produtos
  for (const product of products) {
    const { imageUrl, ...productData } = product
    const imagePath = getImagePath(product.name)
    
    await prisma.product.create({
      data: {
        ...productData,
        imagePath: imagePath // Caminho da imagem no diretório public
      }
    })
  }

  console.log(`✅ ${products.length} produtos inseridos com sucesso!`)
  
  // Mostrar estatísticas por categoria
  const categories = await prisma.product.groupBy({
    by: ['category'],
    _count: {
      category: true
    }
  })
  
  console.log('\n📊 Produtos por categoria:')
  categories.forEach(cat => {
    console.log(`   ${cat.category}: ${cat._count.category} produtos`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })