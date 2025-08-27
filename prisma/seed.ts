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
    description: 'Analgésico e antitérmico potente para alívio de dores de intensidade leve a moderada e redução da febre. Eficaz contra dor de cabeça, dor de dente, dores musculares, cólicas menstruais e febre. Ação rápida com início do efeito em 30-60 minutos. Pode ser usado por adultos e crianças acima de 3 meses (com orientação médica). Comprimidos de fácil deglutição. Posologia: adultos 1-2 comprimidos até 4 vezes ao dia. Não exceder 4g por dia.',
    category: 'Analgésicos',
    price: 4.25,
    stock: 150,
    prescription: false,
    manufacturer: 'EMS',
    imageUrl: '' // Adicionar URL da imagem aqui
  },
  {
    name: 'Ibuprofeno 600mg',
    description: 'Anti-inflamatório não esteroidal (AINE) com ação analgésica, anti-inflamatória e antitérmica. Indicado para dores musculares, articulares, dor de cabeça, dor de dente, cólicas menstruais e processos inflamatórios. Reduz inchaço, vermelhidão e dor. Especialmente eficaz em lesões esportivas e artrite. Duração de ação de 6-8 horas. Tomar com alimento para reduzir irritação gástrica. Posologia: 1 comprimido 2-3 vezes ao dia.',
    category: 'Anti-inflamatórios',
    price: 6.45,
    stock: 80,
    prescription: false,
    manufacturer: 'Medley',
    imageUrl: ''
  },
  {
    name: 'Paracetamol 750mg',
    description: 'Analgésico e antitérmico de primeira escolha para dor e febre. Seguro e eficaz para dor de cabeça, dor muscular, dor de dente, dores articulares leves e febre. Não possui ação anti-inflamatória, sendo mais suave para o estômago. Pode ser usado por gestantes e crianças (com orientação médica). Início de ação em 30-60 minutos com duração de 4-6 horas. Posologia: adultos 1 comprimido até 4 vezes ao dia, respeitando intervalo mínimo de 6 horas.',
    category: 'Analgésicos',
    price: 3.40,
    stock: 200,
    prescription: false,
    manufacturer: 'Eurofarma',
    imageUrl: ''
  },
  {
    name: 'Diclofenaco Sódico 50mg',
    description: 'Anti-inflamatório não esteroidal potente para dores musculares, articulares e inflamações. Muito eficaz em lesões esportivas, tendinites, bursites, artrite e dores nas costas. Reduz significativamente a inflamação, inchaço e dor. Ação prolongada de 8-12 horas. Recomendado para processos inflamatórios agudos e crônicos. Tomar com alimento. Posologia: 1 comprimido 2-3 vezes ao dia. Não usar por mais de 7 dias sem orientação médica.',
    category: 'Anti-inflamatórios',
    price: 7.70,
    stock: 60,
    prescription: false,
    manufacturer: 'Voltaren',
    imageUrl: ''
  },
  {
    name: 'Nimesulida 100mg',
    description: 'Anti-inflamatório e analgésico seletivo com excelente perfil de segurança gástrica. Indicado para dores agudas, inflamações, dor de dente, dor pós-operatória e processos inflamatórios. Possui ação anti-inflamatória potente com menor risco de efeitos colaterais gastrointestinais. Início de ação rápido (30 minutos) com duração de 8-12 horas. Posologia: 1 comprimido 2 vezes ao dia após as refeições. Tratamento máximo de 15 dias.',
    category: 'Anti-inflamatórios',
    price: 9.35,
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
    price: 12.95,
    stock: 40,
    prescription: true,
    manufacturer: 'Neo Química',
    imageUrl: ''
  },
  {
    name: 'Azitromicina 500mg',
    description: 'Antibiótico para infecções respiratórias',
    category: 'Antibióticos',
    price: 16.25,
    stock: 35,
    prescription: true,
    manufacturer: 'Sandoz',
    imageUrl: ''
  },
  {
    name: 'Cefalexina 500mg',
    description: 'Antibiótico cefalosporínico',
    category: 'Antibióticos',
    price: 14.45,
    stock: 30,
    prescription: true,
    manufacturer: 'Cimed',
    imageUrl: ''
  },
  {
    name: 'Ciprofloxacino 500mg',
    description: 'Antibiótico quinolona',
    category: 'Antibióticos',
    price: 17.90,
    stock: 25,
    prescription: true,
    manufacturer: 'Eurofarma',
    imageUrl: ''
  },

  // VITAMINAS E SUPLEMENTOS
  {
    name: 'Vitamina C 1g',
    description: 'Suplemento vitamínico efervescente de Vitamina C 1000mg. Fortalece o sistema imunológico, possui ação antioxidante e auxilia na absorção de ferro. Ideal para prevenção de gripes e resfriados, cicatrização de feridas e manutenção da saúde da pele. Comprimidos efervescentes com sabor laranja, de fácil dissolução e absorção. Recomendado para adultos e crianças acima de 12 anos. Tomar 1 comprimido ao dia dissolvido em água.',
    category: 'Vitaminas',
    price: 11.45,
    stock: 100,
    prescription: false,
    manufacturer: 'Redoxon',
    imageUrl: ''
  },
  {
    name: 'Complexo B',
    description: 'Suplemento vitamínico completo com todas as vitaminas do complexo B (B1, B2, B3, B5, B6, B7, B9, B12). Essencial para o metabolismo energético, funcionamento do sistema nervoso e formação de glóbulos vermelhos. Auxilia no combate ao cansaço, fadiga e estresse. Melhora a concentração, memória e disposição. Importante para a saúde dos cabelos, pele e unhas. Cápsulas de fácil deglutição. Tomar 1 cápsula ao dia com água.',
    category: 'Vitaminas',
    price: 9.25,
    stock: 75,
    prescription: false,
    manufacturer: 'Centrum',
    imageUrl: ''
  },
  {
    name: 'Vitamina D3 2000UI',
    description: 'Suplemento de Vitamina D3 (colecalciferol) 2000 UI. Fundamental para a absorção de cálcio e fósforo, fortalecimento dos ossos e dentes. Auxilia no funcionamento do sistema imunológico e muscular. Previne osteoporose, raquitismo e osteomalácia. Especialmente importante para pessoas com pouca exposição solar, idosos e crianças em crescimento. Cápsulas gelatinosas moles para melhor absorção. Tomar 1 cápsula ao dia com alimento.',
    category: 'Vitaminas',
    price: 17.95,
    stock: 60,
    prescription: false,
    manufacturer: 'Addera',
    imageUrl: ''
  },
  {
    name: 'Ômega 3 1000mg',
    description: 'Suplemento de ácidos graxos essenciais EPA e DHA extraídos de óleo de peixe. Beneficia a saúde cardiovascular, reduzindo triglicerídeos e colesterol. Possui ação anti-inflamatória natural e auxilia no funcionamento cerebral, melhorando memória e concentração. Importante para a saúde ocular e desenvolvimento neurológico. Cápsulas gelatinosas sem sabor residual de peixe. Rico em antioxidantes naturais. Tomar 1-2 cápsulas ao dia com as refeições.',
    category: 'Suplementos',
    price: 22.95,
    stock: 50,
    prescription: false,
    manufacturer: 'Vitafor',
    imageUrl: ''
  },
  {
    name: 'Ferro Quelato',
    description: 'Suplemento de ferro quelato de alta biodisponibilidade para tratamento e prevenção da anemia ferropriva. O ferro quelato é melhor absorvido pelo organismo e causa menos efeitos colaterais gastrointestinais. Essencial para a formação de hemoglobina e transporte de oxigênio. Combate fadiga, fraqueza e palidez. Especialmente indicado para gestantes, crianças em crescimento e pessoas com deficiência de ferro. Cápsulas vegetais. Tomar 1 cápsula ao dia com estômago vazio.',
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
    price: 7.95,
    stock: 80,
    prescription: true,
    manufacturer: 'EMS',
    imageUrl: ''
  },
  {
    name: 'Enalapril 10mg',
    description: 'Inibidor da ECA',
    category: 'Cardiovascular',
    price: 6.25,
    stock: 90,
    prescription: true,
    manufacturer: 'Medley',
    imageUrl: ''
  },
  {
    name: 'Amlodipina 5mg',
    description: 'Bloqueador de canal de cálcio',
    category: 'Cardiovascular',
    price: 9.45,
    stock: 70,
    prescription: true,
    manufacturer: 'Eurofarma',
    imageUrl: ''
  },
  {
    name: 'Hidroclorotiazida 25mg',
    description: 'Diurético tiazídico',
    category: 'Cardiovascular',
    price: 4.45,
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
    price: 8.25,
    stock: 45,
    prescription: true,
    manufacturer: 'EMS',
    imageUrl: ''
  },

  // MEDICAMENTOS DIGESTIVOS
  {
    name: 'Omeprazol 20mg',
    description: 'Inibidor da bomba de prótons para tratamento de úlceras, gastrite, esofagite e refluxo gastroesofágico. Reduz significativamente a produção de ácido gástrico, promovendo cicatrização e alívio dos sintomas. Eficaz contra azia, queimação, dor epigástrica e regurgitação ácida. Cápsulas com revestimento entérico para proteção do princípio ativo. Tomar em jejum, 30-60 minutos antes do café da manhã. Posologia: 1 cápsula ao dia. Tratamento usual de 4-8 semanas.',
    category: 'Digestivo',
    price: 25.90,
    stock: 85,
    prescription: false,
    manufacturer: 'Eurofarma',
    imageUrl: ''
  },
  {
    name: 'Ranitidina 150mg',
    description: 'Bloqueador dos receptores H2 da histamina para redução da acidez gástrica. Indicado para úlceras duodenais, úlceras gástricas, síndrome de Zollinger-Ellison e refluxo gastroesofágico. Alívio rápido de azia, queimação e dor estomacal. Ação prolongada de 8-12 horas. Pode ser usado preventivamente antes de refeições que causam desconforto. Comprimidos revestidos de fácil deglutição. Posologia: 1 comprimido 2 vezes ao dia ou conforme orientação médica.',
    category: 'Digestivo',
    price: 18.50,
    stock: 70,
    prescription: false,
    manufacturer: 'Label',
    imageUrl: ''
  },
  {
    name: 'Domperidona 10mg',
    description: 'Procinético digestivo que acelera o esvaziamento gástrico e melhora a motilidade intestinal. Indicado para náuseas, vômitos, sensação de empachamento, digestão lenta e refluxo gastroesofágico. Especialmente eficaz em náuseas pós-operatórias e induzidas por medicamentos. Não atravessa a barreira hematoencefálica, causando menos efeitos colaterais neurológicos. Comprimidos de ação rápida. Posologia: 1 comprimido 3-4 vezes ao dia, 15-30 minutos antes das refeições.',
    category: 'Digestivo',
    price: 22.90,
    stock: 55,
    prescription: false,
    manufacturer: 'Motilium',
    imageUrl: ''
  },
  {
    name: 'Simeticona 40mg',
    description: 'Antiflatulento que reduz a tensão superficial das bolhas de gás no trato digestivo, facilitando sua eliminação. Alívio rápido de gases, distensão abdominal, cólicas intestinais e desconforto pós-prandial. Não é absorvido pelo organismo, sendo eliminado inalterado. Seguro para uso prolongado e em todas as idades. Especialmente útil após cirurgias abdominais e em bebês com cólicas. Comprimidos mastigáveis com sabor agradável. Posologia: 1-2 comprimidos após as refeições e ao deitar.',
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
    price: 12.45,
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
    price: 16.45,
    stock: 35,
    prescription: true,
    manufacturer: 'Prozac',
    imageUrl: ''
  },
  {
    name: 'Sertralina 50mg',
    description: 'Antidepressivo ISRS',
    category: 'Neurológico',
    price: 19.25,
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
    price: 27.95,
    stock: 40,
    prescription: false,
    manufacturer: 'La Roche-Posay',
    imageUrl: ''
  },
  {
    name: 'Hidratante Facial',
    description: 'Creme hidratante para rosto',
    category: 'Dermocosmético',
    price: 21.45,
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
    price: 44.95,
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
  categories.forEach((cat: { category: string; _count: { category: number } }) => {
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