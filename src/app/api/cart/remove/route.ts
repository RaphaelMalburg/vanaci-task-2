import { NextRequest, NextResponse } from 'next/server'
import { SimpleCartData, removeFromSimpleCart } from '@/lib/cart-storage-simple'

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

    // Remover item específico do carrinho
    const success = await removeFromSimpleCart(sessionId, productId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Item não encontrado no carrinho' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Item removido do carrinho com sucesso',
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

    // Remover item específico do carrinho
    const success = await removeFromSimpleCart(sessionId, productId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Item não encontrado no carrinho' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Item removido do carrinho com sucesso',
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