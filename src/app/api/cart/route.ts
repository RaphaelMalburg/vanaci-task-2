import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-utils'
import { getOrCreateUserCart, addToUserCart, updateUserCartQuantity, removeFromUserCart, clearUserCart } from '@/lib/cart-storage-user'

// Cache simples para carrinho (em memória)
const cartCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5000 // 5 segundos

function getCachedCart(userId: string) {
  const cached = cartCache.get(userId)
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCachedCart(userId: string, data: any) {
  cartCache.set(userId, { data, timestamp: Date.now() })
}

function invalidateCartCache(userId: string) {
  cartCache.delete(userId)
}

// GET - Obter carrinho do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    // Verificar cache primeiro
    const cachedCart = getCachedCart(user.id)
    if (cachedCart) {
      return NextResponse.json(cachedCart)
    }
    
    const cart = await getOrCreateUserCart(user.id)
    
    // Armazenar no cache
    setCachedCart(user.id, cart)

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
  
  try {
    const user = getUserFromRequest(request)
    
    if (!user) {
      console.log(`❌ [Cart API POST] Usuário não autenticado`);
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    console.log(`📥 [DEBUG] Parseando body da requisição...`);
    const body = await request.json()
    console.log(`📋 [API DEBUG] Body da requisição:`, body);

    const { productId, quantity = 1 } = body
    console.log(`🔑 [DEBUG] Dados extraídos: userId=${user.id}, productId=${productId}, quantity=${quantity}`);

    if (!productId) {
      console.log(`❌ [DEBUG] Product ID obrigatório`);
      return NextResponse.json(
        { error: 'Product ID é obrigatório' },
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
    console.log(`🛒 [DEBUG] Obtendo carrinho atual para userId: ${user.id}`);
    let cart = await getOrCreateUserCart(user.id)
    console.log(`🛒 [DEBUG] Carrinho atual:`, JSON.stringify(cart, null, 2));

    // Adicionar item ao carrinho usando a função específica
    console.log(`➕ [DEBUG] Adicionando item ao carrinho usando addToUserCart`);
    const updatedCart = await addToUserCart(user.id, productId, quantity);
    console.log(`✅ [DEBUG] Item adicionado com sucesso`);
    
    // Invalidar cache após modificação
    invalidateCartCache(user.id);

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
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID e quantity são obrigatórios' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      // Remover item se quantidade for 0 ou negativa
      const updatedCart = await removeFromUserCart(user.id, productId)
      
      // Invalidar cache após modificação
      invalidateCartCache(user.id)
      
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
      const updatedCart = await updateUserCartQuantity(user.id, productId, quantity)
      
      // Invalidar cache após modificação
      invalidateCartCache(user.id)
      
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
    const user = getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Tentar obter dados do body primeiro (para clearAll)
    let productId: string | null = null;
    let clearAll = false;
    
    try {
      const body = await request.json();
      productId = body.productId;
      clearAll = body.clearAll || false;
    } catch {
      // Se não conseguir parsear o body, usar query params
      const { searchParams } = new URL(request.url);
      productId = searchParams.get('productId');
    }

    // Se clearAll for true, limpar todo o carrinho
    if (clearAll) {
      const cart = await clearUserCart(user.id);
      
      // Invalidar cache após modificação
      invalidateCartCache(user.id);
      
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
    const cart = await removeFromUserCart(user.id, productId)
    
    // Invalidar cache após modificação
    invalidateCartCache(user.id)

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