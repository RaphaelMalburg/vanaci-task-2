import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validação básica
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username e password são obrigatórios' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username deve ter pelo menos 3 caracteres' },
        { status: 400 }
      )
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password deve ter pelo menos 4 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username já existe' },
        { status: 409 }
      )
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        username,
        password // Em POC, salvamos senha em texto simples
      }
    })

    // Criar carrinho vazio para o usuário
    await prisma.userCart.create({
      data: {
        userId: user.id,
        total: 0
      }
    })

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          username: user.username
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}