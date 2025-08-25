import { NextRequest, NextResponse } from 'next/server'
import { CartData, cartStorage, saveCart } from '@/lib/cart-storage'

// DELETE - Remover item específico do carrinho
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, productId } = body

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

    // Verificar se o item existe no carrinho
    const itemExists = cart.items.some(item => item.id === productId)
    if (!itemExists) {
      return NextResponse.json(
        { error: 'Item não encontrado no carrinho' },
        { status: 404 }
      )
    }

    // Remover item específico
    cart.items = cart.items.filter(item => item.id !== productId)

    // Salvar carrinho atualizado
    saveCart(cart)

    return NextResponse.json({
      message: 'Item removido do carrinho com sucesso',
      cart,
      removedProductId: productId
    })
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Método alternativo para remover item (compatibilidade)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, productId } = body

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

    // Verificar se o item existe no carrinho
    const itemExists = cart.items.some(item => item.id === productId)
    if (!itemExists) {
      return NextResponse.json(
        { error: 'Item não encontrado no carrinho' },
        { status: 404 }
      )
    }

    // Remover item específico
    cart.items = cart.items.filter(item => item.id !== productId)

    // Salvar carrinho atualizado
    saveCart(cart)

    return NextResponse.json({
      message: 'Item removido do carrinho com sucesso',
      cart,
      removedProductId: productId
    })
  } catch (error) {
    console.error('Erro ao remover item do carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}