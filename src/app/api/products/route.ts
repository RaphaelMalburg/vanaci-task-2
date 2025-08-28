import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    // Construir filtros dinamicamente
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      where.category = { equals: category, mode: 'insensitive' }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
      take: limit ? parseInt(limit) : undefined
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}