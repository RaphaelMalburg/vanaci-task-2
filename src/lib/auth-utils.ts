import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface UserPayload {
  id: string
  username: string
}

/**
 * Extrai o usuário autenticado do token JWT no header Authorization
 */
export function getUserFromRequest(request: NextRequest): UserPayload | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer '
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    
    const decoded = jwt.verify(token, secret) as UserPayload
    return decoded
  } catch (error) {
    console.error('Erro ao verificar token JWT:', error)
    return null
  }
}

/**
 * Extrai o usuário do localStorage (para uso no frontend)
 */
export function getUserFromLocalStorage(): UserPayload | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      return null
    }

    return JSON.parse(userStr) as UserPayload
  } catch (error) {
    console.error('Erro ao ler usuário do localStorage:', error)
    return null
  }
}