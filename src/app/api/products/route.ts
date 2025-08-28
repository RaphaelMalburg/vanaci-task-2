import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  console.log(`🔍 [DEBUG] === INICIANDO Products API GET ===`);
  console.log(`🔍 [DEBUG] Request URL: ${request.url}`);
  console.log(`🌐 [API DEBUG] GET /api/products - Requisição recebida`);
  
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const q = searchParams.get('q') // Para compatibilidade com searchProductsTool
    
    console.log(`🔍 [DEBUG] Parâmetros recebidos:`, { search, category, limit, q });
    
    // Usar 'q' se 'search' não estiver presente (compatibilidade)
    const searchTerm = search || q;
    console.log(`🔍 [DEBUG] Termo de busca final: ${searchTerm}`);

    // Construir filtros dinamicamente
    const where: any = {}
    
    if (searchTerm) {
      console.log(`🔍 [DEBUG] Construindo filtro de busca para: "${searchTerm}"`);
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { manufacturer: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      console.log(`🔍 [DEBUG] Adicionando filtro de categoria: ${category}`);
      where.category = { equals: category, mode: 'insensitive' }
    }
    
    console.log(`🔍 [DEBUG] Filtros construídos:`, JSON.stringify(where, null, 2));
    
    const queryOptions = {
      where,
      orderBy: [
        { category: 'asc' as const },
        { name: 'asc' as const }
      ],
      take: limit ? parseInt(limit) : undefined
    };
    console.log(`🔍 [DEBUG] Opções da query:`, JSON.stringify(queryOptions, null, 2));

    console.log(`📡 [DEBUG] Executando query no banco...`);
    const products = await prisma.product.findMany(queryOptions)
    console.log(`📊 [DEBUG] Produtos encontrados: ${products.length}`);
    console.log(`📊 [DEBUG] Produtos:`, JSON.stringify(products, null, 2));

    const response = { products };
    console.log(`✅ [DEBUG] Resposta final:`, JSON.stringify(response, null, 2));
    console.log(`✅ [API DEBUG] GET /api/products - Sucesso, retornando ${products.length} produtos`);
    console.log(`🔍 [DEBUG] === FIM Products API GET (SUCESSO) ===`);
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao buscar produtos:', error)
    console.error('❌ [API DEBUG] Erro ao buscar produtos:', error);
    console.error('❌ [DEBUG] Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace');
    console.log(`🔍 [DEBUG] === FIM Products API GET (ERRO) ===`);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}