import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateJWTToken } from '@/lib/auth-utils'

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

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar senha (comparação simples para POC)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      )
    }

    // Login bem-sucedido - gerar token JWT
    const userData = {
      id: user.id,
      username: user.username
    }
    const token = generateJWTToken(userData)
    
    return NextResponse.json(
      { 
        message: 'Login realizado com sucesso',
        user: userData,
        token: token
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}