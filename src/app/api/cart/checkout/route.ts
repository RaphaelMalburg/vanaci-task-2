import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateCart, deleteCart } from '@/lib/cart-storage'

// POST - Finalizar compra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, customerInfo } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID é obrigatório' },
        { status: 400 }
      )
    }

    // Obter carrinho
    const cart = await getOrCreateCart(sessionId)
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio ou não encontrado' },
        { status: 400 }
      )
    }

    // Verificar estoque de todos os itens
    for (const item of cart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id }
      })

      if (!product) {
        return NextResponse.json(
          { error: `Produto ${item.name} não encontrado` },
          { status: 404 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${item.name}. Disponível: ${product.stock}` },
          { status: 400 }
        )
      }
    }

    // Simular processamento do pedido
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase()
    const orderDate = new Date().toISOString()

    // Em um sistema real, aqui você:
    // 1. Criaria o pedido no banco de dados
    // 2. Atualizaria o estoque dos produtos
    // 3. Processaria o pagamento
    // 4. Enviaria emails de confirmação

    // Simular atualização de estoque
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    // Criar objeto do pedido para resposta
    const order = {
      id: orderId,
      sessionId,
      items: cart.items,
      total: cart.total,
      customerInfo: customerInfo || {},
      status: 'confirmed',
      createdAt: orderDate
    }

    // Limpar carrinho após checkout bem-sucedido
    await deleteCart(sessionId)

    return NextResponse.json({
      message: 'Pedido realizado com sucesso',
      order
    })
  } catch (error) {
    console.error('Erro ao finalizar compra:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Obter status do pedido
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID é obrigatório' },
        { status: 400 }
      )
    }

    // Em um sistema real, buscar o pedido no banco de dados
    // Por enquanto, retornar um status mockado
    const order = {
      id: orderId,
      status: 'confirmed',
      message: 'Pedido confirmado e em processamento'
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Erro ao buscar status do pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}