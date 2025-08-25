import { NextResponse } from 'next/server'

// Informações de navegação do site
const navigationInfo = {
  pages: [
    {
      name: 'Home',
      path: '/',
      description: 'Página inicial da farmácia com informações gerais'
    },
    {
      name: 'Produtos',
      path: '/products',
      description: 'Catálogo completo de medicamentos e produtos de saúde'
    },
    {
      name: 'Sobre',
      path: '/about',
      description: 'Informações sobre a Farmácia Vanaci'
    },
    {
      name: 'Contato',
      path: '/contact',
      description: 'Formulário de contato e informações de localização'
    },
    {
      name: 'Chat N8N',
      path: '/n8n-chat',
      description: 'Interface de chat inteligente com assistente AI'
    }
  ],
  categories: [
    'Medicamentos',
    'Higiene',
    'Beleza',
    'Suplementos',
    'Equipamentos Médicos'
  ],
  features: [
    'Busca de produtos',
    'Carrinho de compras',
    'Checkout simplificado',
    'Chat inteligente',
    'Catálogo organizado por categorias'
  ]
}

export async function GET() {
  try {
    return NextResponse.json(navigationInfo)
  } catch (error) {
    console.error('Erro ao buscar informações de navegação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query é obrigatória' },
        { status: 400 }
      )
    }

    // Buscar páginas relevantes baseado na query
    const relevantPages = navigationInfo.pages.filter(page => 
      page.name.toLowerCase().includes(query.toLowerCase()) ||
      page.description.toLowerCase().includes(query.toLowerCase())
    )

    const relevantCategories = navigationInfo.categories.filter(category =>
      category.toLowerCase().includes(query.toLowerCase())
    )

    const response = {
      query,
      relevantPages,
      relevantCategories,
      suggestions: [
        'Você pode navegar para a página de produtos para ver nosso catálogo',
        'Use o chat inteligente para obter ajuda personalizada',
        'Visite a página sobre para conhecer mais sobre a farmácia'
      ]
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao processar busca de navegação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}