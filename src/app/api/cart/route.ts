import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tipo para os dados do carrinho
interface CartItem {
  id: string
  name: string
  price: number
  imagePath: string | null
  category: string
  quantity: number
}

interface CartData {
  sessionId: string
  items: CartItem[]
  total: number
}

// Simular armazenamento em memória (em produção, usar Redis ou banco de dados)
const cartStorage = new Map<string, CartData>()

// GET - Obter carrinho por session ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      )
    }

    const cart = cartStorage.get(sessionId) || {
      sessionId,
      items: [],
      total: 0
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Adicionar item ao carrinho
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, productId, quantity = 1 } = body

    if (!sessionId || !productId) {
      return NextResponse.json(
        { error: 'Session ID e Product ID são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar produto no banco
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Estoque insuficiente' },
        { status: 400 }
      )
    }

    // Obter carrinho atual
    let cart: CartData = cartStorage.get(sessionId) || {
      sessionId,
      items: [] as CartItem[],
      total: 0
    }

    // Verificar se item já existe no carrinho
    const existingItemIndex = cart.items.findIndex(item => item.id === productId)
    
    if (existingItemIndex >= 0) {
      // Atualizar quantidade
      const newQuantity = cart.items[existingItemIndex].quantity + quantity
      
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: 'Quantidade excede estoque disponível' },
          { status: 400 }
        )
      }
      
      cart.items[existingItemIndex].quantity = newQuantity
    } else {
      // Adicionar novo item
      cart.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imagePath: product.imagePath,
        category: product.category,
        quantity
      })
    }

    // Recalcular total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Salvar carrinho
    cartStorage.set(sessionId, cart)

    return NextResponse.json({
      message: 'Item adicionado ao carrinho',
      cart
    })
  } catch (error) {
    console.error('Erro ao adicionar item ao carrinho:', error)
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

    // Recalcular total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Salvar carrinho
    cartStorage.set(sessionId, cart)

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
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const productId = searchParams.get('productId')

    if (!sessionId || !productId) {
      return NextResponse.json(
        { error: 'Session ID e Product ID são obrigatórios' },
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

    // Remover item
    cart.items = cart.items.filter(item => item.id !== productId)

    // Recalcular total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Salvar carrinho
    cartStorage.set(sessionId, cart)

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