import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CartItem, CartData, cartStorage, getOrCreateCart, saveCart } from '@/lib/cart-storage'

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

    const cart = getOrCreateCart(sessionId)
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
    let cart: CartData = getOrCreateCart(sessionId)
    console.log(`🛒 [DEBUG] Carrinho atual:`, JSON.stringify(cart, null, 2));

    // Verificar se item já existe no carrinho
    console.log(`🔍 [DEBUG] Verificando se produto já existe no carrinho...`);
    const existingItemIndex = cart.items.findIndex(item => item.id === productId)
    console.log(`🔍 [DEBUG] Índice do item existente: ${existingItemIndex}`);
    
    if (existingItemIndex >= 0) {
      console.log(`🔄 [DEBUG] Item já existe no carrinho - atualizando quantidade`);
      console.log(`🔄 [DEBUG] Quantidade atual: ${cart.items[existingItemIndex].quantity}`);
      // Atualizar quantidade
      const newQuantity = cart.items[existingItemIndex].quantity + quantity
      console.log(`🔄 [DEBUG] Nova quantidade calculada: ${newQuantity}`);
      
      if (newQuantity > product.stock) {
        console.log(`❌ [DEBUG] Nova quantidade excede estoque: ${newQuantity} > ${product.stock}`);
        return NextResponse.json(
          { error: 'Quantidade excede estoque disponível' },
          { status: 400 }
        )
      }
      
      cart.items[existingItemIndex].quantity = newQuantity
      console.log(`✅ [DEBUG] Quantidade atualizada para: ${newQuantity}`);
    } else {
      console.log(`➕ [DEBUG] Adicionando novo item ao carrinho`);
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        imagePath: product.image,
        category: product.category,
        quantity
      };
      console.log(`➕ [DEBUG] Novo item:`, JSON.stringify(newItem, null, 2));
      // Adicionar novo item
      cart.items.push(newItem)
      console.log(`✅ [DEBUG] Item adicionado. Total de itens no carrinho: ${cart.items.length}`);
    }

    console.log(`🛒 [DEBUG] Carrinho antes de salvar:`, JSON.stringify(cart, null, 2));
    // Salvar carrinho
    console.log(`💾 [DEBUG] Salvando carrinho...`);
    saveCart(cart)
    console.log(`💾 [DEBUG] Carrinho salvo com sucesso`);

    const response = {
      message: 'Item adicionado ao carrinho',
      cart
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

    const cart = cartStorage.get(sessionId)
    if (!cart) {
      return NextResponse.json(
        { error: 'Carrinho não encontrado' },
        { status: 404 }
      )
    }

    if (quantity <= 0) {
      // Remover item se quantidade for 0 ou negativa
      cart.items = cart.items.filter(item => item.id !== productId)
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
      const itemIndex = cart.items.findIndex(item => item.id === productId)
      if (itemIndex >= 0) {
        cart.items[itemIndex].quantity = quantity
      } else {
        return NextResponse.json(
          { error: 'Item não encontrado no carrinho' },
          { status: 404 }
        )
      }
    }

    // Salvar carrinho
    saveCart(cart)

    return NextResponse.json({
      message: 'Carrinho atualizado',
      cart
    })
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
      const cart = {
        sessionId,
        items: [],
        total: 0
      };
      cartStorage.set(sessionId, cart);
      
      return NextResponse.json({
        message: 'Carrinho limpo com sucesso',
        ...cart
      });
    }

    // Caso contrário, remover item específico
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID é obrigatório para remover item específico' },
        { status: 400 }
      )
    }

    const cart = cartStorage.get(sessionId)
    if (!cart) {
      return NextResponse.json(
        { error: 'Carrinho não encontrado' },
        { status: 404 }
      )
    }

    // Remover item específico
    cart.items = cart.items.filter(item => item.id !== productId)

    // Salvar carrinho
    saveCart(cart)

    return NextResponse.json({
      message: 'Item removido do carrinho',
      ...cart
    })
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}