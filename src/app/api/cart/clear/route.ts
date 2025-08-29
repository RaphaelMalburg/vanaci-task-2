import { NextRequest, NextResponse } from 'next/server'
import { deleteCart } from '@/lib/cart-storage'

// POST - Limpar carrinho
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      )
    }

    // Limpar carrinho
    await deleteCart(sessionId)

    return NextResponse.json({
      message: 'Carrinho limpo com sucesso',
      cart: {
        sessionId,
        items: [],
        total: 0
      }
    })
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Limpar carrinho (método alternativo)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      )
    }

    // Limpar carrinho
    await deleteCart(sessionId)

    return NextResponse.json({
      message: 'Carrinho limpo com sucesso',
      cart: {
        sessionId,
        items: [],
        total: 0
      }
    })
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}