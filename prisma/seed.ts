import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Produtos baseados em TODAS as imagens reais disponíveis
const products = [
  // ANALGÉSICOS E ANTI-INFLAMATÓRIOS
  {
    name: 'Paracetamol 500mg Dor e Febre',
    description: 'Analgésico e antitérmico eficaz para alívio de dores leves a moderadas e redução da febre. Indicado para dor de cabeça, dor de dente, dores musculares e febre. Seguro para uso em adultos e crianças.',
    category: 'Analgésicos',
    price: 4.50,
    stock: 150,
    prescription: false,
    manufacturer: 'Genérico',
    image: '/imagensRemedios/Paracetamol-500-mg-Dor-e-Febre.png'
  },
  {
    name: 'Benuron 500mg',
    description: 'Analgésico e antipirético à base de paracetamol. Eficaz no tratamento de dores e febre, com ação rápida e duradoura.',
    category: 'Analgésicos',
    price: 5.25,
    stock: 120,
    prescription: false,
    manufacturer: 'Benuron',
    image: '/imagensRemedios/Benuron-500-mg.png'
  },
  {
    name: 'Aspirina Express',
    description: 'Analgésico, antipirético e anti-inflamatório. Alívio rápido de dores de cabeça, dores musculares e febre. Fórmula de ação rápida.',
    category: 'Analgésicos',
    price: 6.80,
    stock: 100,
    prescription: false,
    manufacturer: 'Bayer',
    image: '/imagensRemedios/Aspirina-Express.png'
  },
  {
    name: 'Ilvico Comprimidos Dor e Febre',
    description: 'Analgésico e antipirético para alívio de dores e redução da febre. Fórmula eficaz e bem tolerada.',
    category: 'Analgésicos',
    price: 4.95,
    stock: 110,
    prescription: false,
    manufacturer: 'Ilvico',
    image: '/imagensRemedios/Ilvico-Comprimidos-Dor-e-Febre.png'
  },
  {
    name: 'Brufen 400mg Ibuprofeno',
    description: 'Anti-inflamatório não esteroidal com ação analgésica e antipirética. Eficaz contra dores musculares, articulares e processos inflamatórios.',
    category: 'Anti-inflamatórios',
    price: 7.95,
    stock: 80,
    prescription: false,
    manufacturer: 'Abbott',
    image: '/imagensRemedios/Brufen-400-mg-Comprimidos-Ibuprofeno.png'
  },
  {
    name: 'Ibuprofeno 200mg Farmoz',
    description: 'Anti-inflamatório para dores leves a moderadas. Reduz inflamação, dor e febre. Ideal para dores musculares e articulares.',
    category: 'Anti-inflamatórios',
    price: 5.50,
    stock: 90,
    prescription: false,
    manufacturer: 'Farmoz',
    image: '/imagensRemedios/Ibuprofeno-200-mg-Farmoz.png'
  },
  {
    name: 'Nurofen Xpress Cápsulas Moles',
    description: 'Ibuprofeno em cápsulas moles para absorção rápida. Alívio eficaz de dores e febre com ação prolongada.',
    category: 'Anti-inflamatórios',
    price: 9.45,
    stock: 70,
    prescription: false,
    manufacturer: 'Nurofen',
    image: '/imagensRemedios/Nurofen-Xpress-Cápsulas-Moles-Dor-e-Febre.png'
  },
  {
    name: 'Trifene 400 Comprimidos',
    description: 'Anti-inflamatório potente para dores e processos inflamatórios. Eficaz em dores musculares, articulares e pós-traumáticas.',
    category: 'Anti-inflamatórios',
    price: 8.75,
    stock: 60,
    prescription: false,
    manufacturer: 'Trifene',
    image: '/imagensRemedios/Trifene-400-Comprimidos-Dor-e-Febre.png'
  },
  {
    name: 'Momendol Anti-inflamatório',
    description: 'Anti-inflamatório específico para dores musculares e articulares. Ação localizada e duradoura.',
    category: 'Anti-inflamatórios',
    price: 11.20,
    stock: 50,
    prescription: false,
    manufacturer: 'Momendol',
    image: '/imagensRemedios/Momendol-Anti-inflamatório-Dores-Musculares.png'
  },
  {
    name: 'Voltaren Emulgel',
    description: 'Gel anti-inflamatório tópico com diclofenaco. Aplicação local para dores musculares, articulares e contusões.',
    category: 'Anti-inflamatórios',
    price: 13.50,
    stock: 45,
    prescription: false,
    manufacturer: 'Voltaren',
    image: '/imagensRemedios/Voltaren_emulgelex.png'
  },

  // GRIPES E CONSTIPAÇÕES
  {
    name: 'Ben-u-gripe 4mg + 500mg',
    description: 'Combinação de paracetamol e cloridrato de fenilefrina para alívio dos sintomas de gripes e constipações.',
    category: 'Gripes e Constipações',
    price: 7.25,
    stock: 85,
    prescription: false,
    manufacturer: 'Ben-u-ron',
    image: '/imagensRemedios/Ben-u-gripe-4mg-+-500mg.png'
  },
  {
    name: 'Cêgripe Comprimidos',
    description: 'Medicamento para alívio dos sintomas de gripes e constipações. Reduz dor, febre e congestão nasal.',
    category: 'Gripes e Constipações',
    price: 6.80,
    stock: 95,
    prescription: false,
    manufacturer: 'Cêgripe',
    image: '/imagensRemedios/Cêgripe-Comprimidos-Dor-e-Febre.png'
  },
  {
    name: 'Griponal',
    description: 'Tratamento completo para sintomas gripais. Combate febre, dores e congestão nasal.',
    category: 'Gripes e Constipações',
    price: 8.95,
    stock: 70,
    prescription: false,
    manufacturer: 'Griponal',
    image: '/imagensRemedios/Griponal.png'
  },
  {
    name: 'Antigrippine Trieffect Tosse',
    description: 'Saquetas para alívio da tosse e sintomas gripais. Fórmula tripla ação contra tosse, dor e febre.',
    category: 'Gripes e Constipações',
    price: 9.50,
    stock: 60,
    prescription: false,
    manufacturer: 'Antigrippine',
    image: '/imagensRemedios/Antigrippine-Trieffect-Tosse-Saquetas.png'
  },
  {
    name: 'Strepsils Mel e Limão',
    description: 'Pastilhas para dor de garganta com mel e limão. Ação antisséptica e analgésica local.',
    category: 'Gripes e Constipações',
    price: 5.95,
    stock: 120,
    prescription: false,
    manufacturer: 'Strepsils',
    image: '/imagensRemedios/Strepsils-Mel-e-Limão-Dor-de-Garganta.png'
  },
  {
    name: 'Oscillococcinum',
    description: 'Medicamento homeopático para prevenção e tratamento de estados gripais.',
    category: 'Gripes e Constipações',
    price: 12.80,
    stock: 40,
    prescription: false,
    manufacturer: 'Boiron',
    image: '/imagensRemedios/Oscilloncoccinum.png'
  },

  // SISTEMA DIGESTIVO
  {
    name: 'Buscopan',
    description: 'Antiespasmódico para alívio de cólicas e espasmos do trato digestivo. Ação rápida e eficaz.',
    category: 'Sistema Digestivo',
    price: 8.45,
    stock: 75,
    prescription: false,
    manufacturer: 'Boehringer',
    image: '/imagensRemedios/Buscopan.png'
  },
  {
    name: 'Aero-Om Cápsulas Antiflatulento',
    description: 'Tratamento para gases intestinais e distensão abdominal. Alívio rápido do desconforto.',
    category: 'Sistema Digestivo',
    price: 7.90,
    stock: 90,
    prescription: false,
    manufacturer: 'Aero-Om',
    image: '/imagensRemedios/Aero-Om-Cápsulas-Moles-Antiflatulento.png'
  },
  {
    name: 'Imodium Rapid',
    description: 'Tratamento rápido da diarreia. Reduz a frequência e urgência das evacuações.',
    category: 'Sistema Digestivo',
    price: 9.75,
    stock: 65,
    prescription: false,
    manufacturer: 'Imodium',
    image: '/imagensRemedios/Imodium-Rapid-Tratamento-da-Diarreia.png'
  },
  {
    name: 'Laevolac Xarope',
    description: 'Laxante suave para tratamento da obstipação. Ação gradual e eficaz.',
    category: 'Sistema Digestivo',
    price: 11.25,
    stock: 55,
    prescription: false,
    manufacturer: 'Laevolac',
    image: '/imagensRemedios/Laevolac-Xarope-Obstipação.png'
  },
  {
    name: 'Dulcolax',
    description: 'Laxante para alívio da obstipação. Ação suave e previsível.',
    category: 'Sistema Digestivo',
    price: 6.95,
    stock: 80,
    prescription: false,
    manufacturer: 'Dulcolax',
    image: '/imagensRemedios/Dulcolax.png'
  },
  {
    name: 'Vomidrine Direct Enjoos',
    description: 'Tratamento para náuseas e vômitos. Comprimidos de dissolução rápida.',
    category: 'Sistema Digestivo',
    price: 8.50,
    stock: 70,
    prescription: false,
    manufacturer: 'Vomidrine',
    image: '/imagensRemedios/Vomidrine-Direct-Comprimidos-Enjoos.png'
  },
  {
    name: 'Dioralyte Saquetas Limão',
    description: 'Solução de reidratação oral para reposição de líquidos e eletrólitos perdidos.',
    category: 'Sistema Digestivo',
    price: 7.80,
    stock: 85,
    prescription: false,
    manufacturer: 'Dioralyte',
    image: '/imagensRemedios/Dioralyte-Saquetas-Perda-de-Líquidos-Limão.png'
  },
  {
    name: 'Proton',
    description: 'Protetor gástrico para redução da acidez estomacal. Alívio de azia e queimação.',
    category: 'Sistema Digestivo',
    price: 12.90,
    stock: 60,
    prescription: false,
    manufacturer: 'Proton',
    image: '/imagensRemedios/Proton.png'
  },

  // SISTEMA CIRCULATÓRIO
  {
    name: 'Daflon 500mg',
    description: 'Venotônico para tratamento de insuficiência venosa e hemorroidas. Melhora a circulação.',
    category: 'Sistema Circulatório',
    price: 15.50,
    stock: 45,
    prescription: false,
    manufacturer: 'Servier',
    image: '/imagensRemedios/Daflon-500-mg.png'
  },

  // SISTEMA RESPIRATÓRIO
  {
    name: 'Vibrocil Actilong MD',
    description: 'Descongestionante nasal de longa duração. Alívio da congestão nasal por até 12 horas.',
    category: 'Sistema Respiratório',
    price: 8.95,
    stock: 75,
    prescription: false,
    manufacturer: 'Vibrocil',
    image: '/imagensRemedios/Descongestionante-Nasal-Vibrocil-Actilong-MD.png'
  },
  {
    name: 'Nasex Duo Spray Nasal',
    description: 'Solução para pulverização nasal. Higiene e descongestionamento das vias nasais.',
    category: 'Sistema Respiratório',
    price: 6.75,
    stock: 90,
    prescription: false,
    manufacturer: 'Nasex',
    image: '/imagensRemedios/Nasex-Duo-Solução-Pulverização-Nasal.png'
  },
  {
    name: 'Nasorhinathiol Descongestionante',
    description: 'Descongestionante nasal para alívio da obstrução nasal e sinusite.',
    category: 'Sistema Respiratório',
    price: 7.50,
    stock: 65,
    prescription: false,
    manufacturer: 'Nasorhinathiol',
    image: '/imagensRemedios/Nasorhinathiol-Descongestionante-Nasal.png'
  },

  // SUPLEMENTOS E VITAMINAS
  {
    name: 'Dolenio 1500mg Glucosamina',
    description: 'Suplemento de sulfato de glucosamina para saúde articular. Auxilia na manutenção das cartilagens.',
    category: 'Suplementos',
    price: 28.90,
    stock: 35,
    prescription: false,
    manufacturer: 'Dolenio',
    image: '/imagensRemedios/Dolenio-1500mg-Sulfato-de-Glucosamina.png'
  },
  {
    name: 'Kompensan',
    description: 'Suplemento vitamínico e mineral para reposição nutricional e fortalecimento do organismo.',
    category: 'Suplementos',
    price: 22.50,
    stock: 50,
    prescription: false,
    manufacturer: 'Kompensan',
    image: '/imagensRemedios/Kompensan.png'
  },

  // DERMOCOSMÉTICA
  {
    name: 'Protetor Solar',
    description: 'Protetor solar facial e corporal com alta proteção UVA/UVB. Resistente à água e ao suor.',
    category: 'Dermocosmética',
    price: 18.90,
    stock: 60,
    prescription: false,
    manufacturer: 'Genérico',
    image: '/imagensRemedios/protetorsolar.png'
  },
  {
    name: 'Hidratante Corporal',
    description: 'Loção hidratante para pele seca. Fórmula nutritiva com absorção rápida.',
    category: 'Dermocosmética',
    price: 12.50,
    stock: 80,
    prescription: false,
    manufacturer: 'Genérico',
    image: '/imagensRemedios/hidratante.png'
  },
  {
    name: 'Gel Limpeza Purificante Controlo Oleosidade',
    description: 'Gel de limpeza facial para pele oleosa. Remove impurezas e controla a oleosidade.',
    category: 'Dermocosmética',
    price: 14.90,
    stock: 45,
    prescription: false,
    manufacturer: 'Vichy',
    image: '/imagensRemedios/Gel-Limpeza-Purificante-Controlo-Oleosidade.png'
  },
  {
    name: 'Gel Limpeza Purificante Pele Oleosa e Acneica',
    description: 'Gel específico para pele oleosa e com tendência acneica. Ação purificante e matificante.',
    category: 'Dermocosmética',
    price: 16.50,
    stock: 40,
    prescription: false,
    manufacturer: 'La Roche-Posay',
    image: '/imagensRemedios/Gel-Limpeza-Purificante-Pele-Oleosa-e-Acneica.png'
  },
  {
    name: 'Gel Limpeza Rosto Purificante Micropeeling',
    description: 'Gel de limpeza com ação micropeeling. Remove células mortas e renova a pele.',
    category: 'Dermocosmética',
    price: 17.90,
    stock: 35,
    prescription: false,
    manufacturer: 'Eucerin',
    image: '/imagensRemedios/Gel-Limpeza-Rosto-Purificante-Micropeeling.png'
  },
  {
    name: 'Gel de Limpeza Controlo de Imperfeições',
    description: 'Gel específico para controlo de imperfeições e poros dilatados.',
    category: 'Dermocosmética',
    price: 15.75,
    stock: 50,
    prescription: false,
    manufacturer: 'Avène',
    image: '/imagensRemedios/Gel-de-Limpeza-Controlo-de-Imperfeições.png'
  },
  {
    name: 'Corretor Anti-Imperfeições Pele Oleosa',
    description: 'Corretor específico para pele oleosa. Cobre imperfeições e controla brilho.',
    category: 'Dermocosmética',
    price: 19.90,
    stock: 30,
    prescription: false,
    manufacturer: 'Vichy',
    image: '/imagensRemedios/Corretor-Anti-Imperfeições-da-Pele-Oleosa.png'
  },
  {
    name: 'Fluido Antiescurecimento Marcas Pós-Acne',
    description: 'Fluido para tratamento de marcas pós-acne e manchas escuras.',
    category: 'Dermocosmética',
    price: 24.90,
    stock: 25,
    prescription: false,
    manufacturer: 'La Roche-Posay',
    image: '/imagensRemedios/Fluido-Antiescurecimento-de-Marcas-Pós-Acne.png'
  },
  {
    name: 'Pasta Enxofre Borbulhas Normaderm',
    description: 'Pasta secativa com enxofre para tratamento localizado de borbulhas.',
    category: 'Dermocosmética',
    price: 13.50,
    stock: 40,
    prescription: false,
    manufacturer: 'Vichy',
    image: '/imagensRemedios/Pasta-Enxofre-Borbulhas-Normaderm-Acne.png'
  },
  {
    name: 'Pasta SOS Eliminação Borbulhas',
    description: 'Pasta de emergência para eliminação rápida de borbulhas.',
    category: 'Dermocosmética',
    price: 11.90,
    stock: 45,
    prescription: false,
    manufacturer: 'Eucerin',
    image: '/imagensRemedios/Pasta-SOS-Eliminação-Borbulhas-Pele-Oleosa.png'
  },
  {
    name: 'Sérum Antimanchas e Anti-Idade',
    description: 'Sérum concentrado para tratamento de manchas e sinais de envelhecimento.',
    category: 'Dermocosmética',
    price: 32.90,
    stock: 20,
    prescription: false,
    manufacturer: 'Vichy',
    image: '/imagensRemedios/Sérum-Antimanchas-e-Anti-Idade-Pele-Oleosa.png'
  },
  {
    name: 'Sérum Esfoliante Anti-Imperfeições',
    description: 'Sérum esfoliante para pele acneica. Reduz imperfeições e melhora textura.',
    category: 'Dermocosmética',
    price: 28.50,
    stock: 25,
    prescription: false,
    manufacturer: 'La Roche-Posay',
    image: '/imagensRemedios/Sérum-Esfoliante-Anti-Imperfeições-Pele-Acneica.png'
  },

  // CUIDADOS CAPILARES
  {
    name: 'Champô Volume Imediato Cabelos Finos',
    description: 'Champô volumizador para cabelos finos e sem volume. Proporciona corpo e densidade.',
    category: 'Cuidados Capilares',
    price: 8.90,
    stock: 60,
    prescription: false,
    manufacturer: 'L\'Oréal',
    image: '/imagensRemedios/Champô-Volume-Imediato-para-Cabelos-Finos.png'
  },
  {
    name: 'Champô Anticaspa',
    description: 'Champô medicinal para tratamento e prevenção da caspa. Ação antifúngica.',
    category: 'Cuidados Capilares',
    price: 12.50,
    stock: 50,
    prescription: false,
    manufacturer: 'Head & Shoulders',
    image: '/imagensRemedios/anticaspa.png'
  },
  {
    name: 'Condicionador Antiqueda Cabelo Enfraquecido',
    description: 'Condicionador fortalecedor para cabelos com tendência à queda.',
    category: 'Cuidados Capilares',
    price: 11.90,
    stock: 45,
    prescription: false,
    manufacturer: 'Vichy',
    image: '/imagensRemedios/Condicionador-Antiqueda-Cabelo-Infranquecido.png'
  },
  {
    name: 'Condicionador Co-Wash Ondulados',
    description: 'Condicionador co-wash para cabelos ondulados. Limpeza suave sem ressecamento.',
    category: 'Cuidados Capilares',
    price: 9.50,
    stock: 40,
    prescription: false,
    manufacturer: 'Lola Inc',
    image: '/imagensRemedios/Condicionador-Co-Wash-Ondulados-Lola-Inc.png'
  },
  {
    name: 'Condicionador Hidratante Meus Cachinhos',
    description: 'Condicionador específico para cabelos cacheados. Hidratação intensa e definição.',
    category: 'Cuidados Capilares',
    price: 10.90,
    stock: 35,
    prescription: false,
    manufacturer: 'Salon Line',
    image: '/imagensRemedios/Condicionador-Hidratante-Meus-Cachinhos.png'
  },
  {
    name: 'Coloração Cabelo 7R Louro Acobreado',
    description: 'Coloração permanente para cabelos. Tom louro acobreado com cobertura total.',
    category: 'Cuidados Capilares',
    price: 15.90,
    stock: 25,
    prescription: false,
    manufacturer: 'Garnier',
    image: '/imagensRemedios/Coloração-Cabelo-7R-Louro-Acobreado.png'
  },
  {
    name: 'Máscara Hidratante Morte Súbita',
    description: 'Máscara capilar hidratante intensiva. Recupera cabelos danificados e ressecados.',
    category: 'Cuidados Capilares',
    price: 13.50,
    stock: 30,
    prescription: false,
    manufacturer: 'Lola Inc',
    image: '/imagensRemedios/Máscara-Hidratante-Morte-Súbita.png'
  },
  {
    name: 'Sérum Diário Antiqueda Cabelo',
    description: 'Sérum leave-in para prevenção da queda capilar. Fortalece e estimula crescimento.',
    category: 'Cuidados Capilares',
    price: 22.90,
    stock: 20,
    prescription: false,
    manufacturer: 'Vichy',
    image: '/imagensRemedios/Sérum-Diário-Antiqueda-Cabelo-Enfranquecido.png'
  },
  {
    name: 'Spray Tónico Crescimento Rapunzel',
    description: 'Spray tónico estimulante do crescimento capilar. Ação revitalizante.',
    category: 'Cuidados Capilares',
    price: 18.90,
    stock: 25,
    prescription: false,
    manufacturer: 'Rapunzel',
    image: '/imagensRemedios/Spray-Tónico-de-Crescimento-Rapunzel.png'
  },

  // HIGIENE ÍNTIMA E FEMININA
  {
    name: 'Gel Íntimo Gravidez e Pós-Parto',
    description: 'Gel de higiene íntima específico para gravidez e pós-parto. Fórmula suave e hipoalergénica.',
    category: 'Higiene Íntima',
    price: 9.90,
    stock: 40,
    prescription: false,
    manufacturer: 'Lactacyd',
    image: '/imagensRemedios/Gel-Íntimo-Gravidez-e-Pós-Parto.png'
  },
  {
    name: 'Discos Absorventes Antibacterianos',
    description: 'Discos absorventes para seios com ação antibacteriana. Proteção e conforto.',
    category: 'Higiene Íntima',
    price: 6.50,
    stock: 60,
    prescription: false,
    manufacturer: 'Chicco',
    image: '/imagensRemedios/Discos-Absorventes-Antibacterianos.png'
  },

  // PEDIÁTRICO E BEBÉ
  {
    name: 'Fraldas Bebé 7-14kg T4',
    description: 'Fraldas descartáveis tamanho 4 para bebés de 7 a 14kg. Absorção superior e conforto.',
    category: 'Pediátrico',
    price: 12.90,
    stock: 50,
    prescription: false,
    manufacturer: 'Dodot',
    image: '/imagensRemedios/Fraldas-de-Bebé-7-14kg-T4.png'
  },
  {
    name: 'Pack XL Fraldas Ecológicas T4',
    description: 'Fraldas ecológicas tamanho 4 em embalagem XL. Respeitam o ambiente e a pele do bebé.',
    category: 'Pediátrico',
    price: 18.90,
    stock: 30,
    prescription: false,
    manufacturer: 'Bambo Nature',
    image: '/imagensRemedios/Pack-XL-Fraldas-Ecológicas-T4-7-14-kg.png'
  },
  {
    name: 'Compressas Bebé Tecido Não Tecido',
    description: 'Compressas suaves para higiene do bebé. Tecido não tecido hipoalergénico.',
    category: 'Pediátrico',
    price: 4.50,
    stock: 80,
    prescription: false,
    manufacturer: 'Mustela',
    image: '/imagensRemedios/Compressas-Bebé-Tecido-Não-Tecido.png'
  },
  {
    name: 'Pack Toalhitas 99% Água Limpeza Delicada',
    description: 'Toalhitas húmidas com 99% de água para limpeza delicada do bebé.',
    category: 'Pediátrico',
    price: 8.90,
    stock: 70,
    prescription: false,
    manufacturer: 'WaterWipes',
    image: '/imagensRemedios/Pack-Toalhitas-99%-de-Água-Limpeza-Delicada.png'
  },
  {
    name: 'Pack Leite Transição Profutura Duo 2',
    description: 'Leite de transição para bebés a partir dos 6 meses. Fórmula enriquecida.',
    category: 'Pediátrico',
    price: 24.90,
    stock: 25,
    prescription: false,
    manufacturer: 'Profutura',
    image: '/imagensRemedios/Pack-Leite-de-Transição-Profutura-Duo-2.png'
  },

  // HIGIENE E CUIDADOS GERAIS
  {
    name: 'Álcool Gel 70%',
    description: 'Higienizador de mãos à base de álcool. Elimina 99,9% dos germes e bactérias.',
    category: 'Higiene',
    price: 4.50,
    stock: 200,
    prescription: false,
    manufacturer: 'Genérico',
    image: '/imagensRemedios/alcool.png'
  },
  {
    name: 'Soro Fisiológico',
    description: 'Solução salina estéril para limpeza nasal e ocular.',
    category: 'Higiene',
    price: 3.50,
    stock: 150,
    prescription: false,
    manufacturer: 'Genérico',
    image: '/imagensRemedios/fisiologica.png'
  },

  // EQUIPAMENTOS MÉDICOS
  {
    name: 'Termômetro Digital',
    description: 'Termômetro digital para medição precisa da temperatura corporal.',
    category: 'Equipamentos',
    price: 15.90,
    stock: 30,
    prescription: false,
    manufacturer: 'G-Tech',
    image: '/imagensRemedios/termometro.png'
  },
  {
    name: 'Aparelho de Pressão',
    description: 'Monitor digital de pressão arterial para uso doméstico.',
    category: 'Equipamentos',
    price: 89.90,
    stock: 15,
    prescription: false,
    manufacturer: 'Omron',
    image: '/imagensRemedios/pressao.png'
  },
  {
    name: 'Fitas Teste Glicemia',
    description: 'Tiras reagentes para medição de glicose no sangue.',
    category: 'Equipamentos',
    price: 35.90,
    stock: 25,
    prescription: false,
    manufacturer: 'Accu-Chek',
    image: '/imagensRemedios/glicemia.png'
  },

  // MEDICAMENTO GENÉRICO
  {
    name: 'Medicamento Genérico',
    description: 'Medicamento genérico de uso geral. Consulte sempre um profissional de saúde.',
    category: 'Medicamentos Gerais',
    price: 8.50,
    stock: 100,
    prescription: true,
    manufacturer: 'Genérico',
    image: '/imagensRemedios/remedio.png'
  }
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  console.log('🧹 Limpando dados existentes...')
  await prisma.userCartItem.deleteMany({})
  await prisma.userCart.deleteMany({})
  await prisma.chatMessage.deleteMany({})
  await prisma.chatSession.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.product.deleteMany({})

  // Inserir produtos
  console.log('📦 Inserindo produtos...')
  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  console.log(`✅ Seed concluído! ${products.length} produtos inseridos.`)
  console.log('📊 Categorias criadas:')
  
  const categories = [...new Set(products.map(p => p.category))]
  categories.forEach(category => {
    const count = products.filter(p => p.category === category).length
    console.log(`   - ${category}: ${count} produtos`)
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