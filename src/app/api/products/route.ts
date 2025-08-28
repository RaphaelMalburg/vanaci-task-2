import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const q = searchParams.get('q') // Para compatibilidade com searchProductsTool
    
    // Usar 'q' se 'search' não estiver presente (compatibilidade)
    const searchTerm = search || q;

    // Construir filtros dinamicamente
    const where: any = {}
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { manufacturer: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      where.category = { equals: category, mode: 'insensitive' }
    }
    
    const queryOptions = {
      where,
      orderBy: [
        { category: 'asc' as const },
        { name: 'asc' as const }
      ],
      take: limit ? parseInt(limit) : undefined
    };

    const products = await prisma.product.findMany(queryOptions)
    
    // Retornar diretamente o array de produtos
    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}