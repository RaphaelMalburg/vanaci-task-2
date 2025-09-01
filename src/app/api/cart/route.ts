import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SimpleCartItem, SimpleCartData, getOrCreateSimpleCart, addToSimpleCart, updateSimpleCartQuantity, removeFromSimpleCart, clearSimpleCart } from '@/lib/cart-storage-simple'

// GET - Obter carrinho por session ID
export async function GET(request: NextRequest) {
  console.log(`🛒 [Cart API GET] INICIANDO requisição`);
  
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    console.log(`🔑 [Cart API GET] SessionId recebido: ${sessionId}`);
    console.log(`🔑 [Cart API GET] URL completa: ${request.url}`);
    console.log(`🔑 [Cart API GET] Search params:`, Object.fromEntries(searchParams.entries()));

    if (!sessionId) {
      console.log(`❌ [Cart API GET] SessionId não fornecido`);
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      )
    }

    const cart = await getOrCreateSimpleCart(sessionId)
    console.log(`✅ [Cart API GET] Carrinho obtido:`, cart);

    return NextResponse.json(cart)
  } catch (error) {
    console.error('❌ [Cart API GET] Erro ao buscar carrinho:', error)
    console.error('🔍 [Cart API GET] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Adicionar item ao carrinho
export async function POST(request: NextRequest) {
  console.log(`🌐 [API DEBUG] POST /api/cart - Requisição recebida`);
  console.log(`🛒 [DEBUG] === INICIANDO Cart API POST ===`);
  console.log(`🛒 [DEBUG] Request URL: ${request.url}`);
  console.log(`🛒 [DEBUG] Request method: ${request.method}`);
  console.log(`🛒 [DEBUG] Request headers:`, Object.fromEntries(request.headers.entries()));
  
  try {
    console.log(`📥 [DEBUG] Parseando body da requisição...`);
    const body = await request.json()
    console.log(`📋 [API DEBUG] Body da requisição:`, body);
    console.log(`📦 [DEBUG] Body completo recebido:`, JSON.stringify(body, null, 2));
    
    const { sessionId, productId, quantity = 1 } = body
    console.log(`📦 [DEBUG] Dados extraídos:`, { sessionId, productId, quantity });
    console.log(`📦 [DEBUG] Tipos dos dados:`, { 
      sessionId: typeof sessionId, 
      productId: typeof productId, 
      quantity: typeof quantity 
    });
    console.log(`📦 [DEBUG] SessionId valor exato: '${sessionId}'`);
    console.log(`📦 [DEBUG] SessionId length: ${sessionId?.length || 'undefined'}`);

    if (!sessionId || !productId) {
      console.log(`❌ [DEBUG] Validação falhou - dados obrigatórios não fornecidos`);
      console.log(`❌ [DEBUG] sessionId presente: ${!!sessionId}`);
      console.log(`❌ [DEBUG] productId presente: ${!!productId}`);
      return NextResponse.json(
        { error: 'Session ID e Product ID são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar produto no banco
    console.log(`🔍 [DEBUG] Buscando produto no banco com ID: ${productId}`);
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    console.log(`🔍 [DEBUG] Produto encontrado:`, product ? JSON.stringify(product, null, 2) : 'null');

    if (!product) {
      console.log(`❌ [DEBUG] Produto não encontrado no banco`);
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    console.log(`📊 [DEBUG] Verificando estoque: ${product.stock} >= ${quantity}`);
    if (product.stock < quantity) {
      console.log(`❌ [DEBUG] Estoque insuficiente: ${product.stock} < ${quantity}`);
      return NextResponse.json(
        { error: 'Estoque insuficiente' },
        { status: 400 }
      )
    }

    // Obter carrinho atual
    console.log(`🛒 [DEBUG] Obtendo carrinho atual para sessionId: ${sessionId}`);
    let cart: SimpleCartData = await getOrCreateSimpleCart(sessionId)
    console.log(`🛒 [DEBUG] Carrinho atual:`, JSON.stringify(cart, null, 2));

    // Adicionar item ao carrinho usando a função específica
    console.log(`➕ [DEBUG] Adicionando item ao carrinho usando addToSimpleCart`);
    const updatedCart = await addToSimpleCart(sessionId, productId, quantity);
    console.log(`✅ [DEBUG] Item adicionado com sucesso`);

    const response = {
      message: 'Item adicionado ao carrinho',
      cart: updatedCart
    };
    console.log(`✅ [DEBUG] Resposta final:`, JSON.stringify(response, null, 2));
    console.log(`✅ [API DEBUG] POST /api/cart - Sucesso, retornando carrinho:`, cart);
    console.log(`🛒 [DEBUG] === FIM Cart API POST (SUCESSO) ===`);
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ [API DEBUG] Erro ao adicionar produto ao carrinho:', error)
    console.error('❌ [Cart API POST] Erro ao adicionar item ao carrinho:', error)
    console.error('🔍 [Cart API POST] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar quantidade de item no carrinho
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, productId, quantity } = body

    if (!sessionId || !productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Session ID, Product ID e quantity são obrigatórios' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      // Remover item se quantidade for 0 ou negativa
      const updatedCart = await removeFromSimpleCart(sessionId, productId)
      return NextResponse.json({
        message: 'Item removido do carrinho',
        cart: updatedCart
      })
    } else {
      // Verificar estoque
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Produto não encontrado' },
          { status: 404 }
        )
      }

      if (quantity > product.stock) {
        return NextResponse.json(
          { error: 'Quantidade excede estoque disponível' },
          { status: 400 }
        )
      }

      // Atualizar quantidade
      const updatedCart = await updateSimpleCartQuantity(sessionId, productId, quantity)
      
      return NextResponse.json({
        message: 'Carrinho atualizado',
        cart: updatedCart
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover item do carrinho
export async function DELETE(request: NextRequest) {
  try {
    // Tentar obter dados do body primeiro (para clearAll)
    let sessionId: string | null = null;
    let productId: string | null = null;
    let clearAll = false;
    
    try {
      const body = await request.json();
      sessionId = body.sessionId;
      productId = body.productId;
      clearAll = body.clearAll || false;
    } catch {
      // Se não conseguir parsear o body, usar query params
      const { searchParams } = new URL(request.url);
      sessionId = searchParams.get('sessionId');
      productId = searchParams.get('productId');
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      )
    }

    // Se clearAll for true, limpar todo o carrinho
    if (clearAll) {
      const cart = await clearSimpleCart(sessionId);
      
      return NextResponse.json({
        message: 'Carrinho limpo com sucesso',
        cart
      });
    }

    // Caso contrário, remover item específico
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID é obrigatório para remover item específico' },
        { status: 400 }
      )
    }

    // Remover item específico
    const cart = await removeFromSimpleCart(sessionId, productId)

    return NextResponse.json({
      message: 'Item removido do carrinho',
      cart
    })
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}