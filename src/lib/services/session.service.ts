import { prisma } from '@/lib/prisma'
import type { AgentSession, AgentMessage } from '@/lib/types'
import { logger } from '@/lib/logger'

export class SessionService {
  private static instance: SessionService
  private sessions: Map<string, AgentSession> = new Map()
  private dbAvailable = true

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      this.dbAvailable = true
      return true
    } catch (error) {
      logger.warn('Database not available, using in-memory storage for sessions')
      this.dbAvailable = false
      return false
    }
  }

  async createSession(sessionId: string, context: Record<string, unknown> = {}, userId?: string): Promise<AgentSession> {
    const session: AgentSession = {
      id: sessionId,
      messages: [],
      context: { ...context, userId }
    }

    // Tentar salvar no banco de dados
    if (await this.checkDatabaseConnection()) {
      try {
        await prisma.chatSession.create({
          data: {
            sessionId,
            context: { ...context, userId } as any
          }
        })
        logger.info(`Session ${sessionId} created in database${userId ? ` for user ${userId}` : ''}`)
      } catch (error) {
        logger.error('Failed to create session in database:', error)
        this.dbAvailable = false
      }
    }

    // Sempre manter em memória como fallback
    this.sessions.set(sessionId, session)
    logger.info(`Session ${sessionId} created in memory`)
    
    return session
  }

  async getSession(sessionId: string): Promise<AgentSession | null> {
    // Primeiro tentar buscar no banco de dados
    if (this.dbAvailable) {
      try {
        const dbSession = await prisma.chatSession.findUnique({
          where: { sessionId },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' }
            }
          }
        })

        if (dbSession) {
          const session: AgentSession = {
            id: sessionId,
            messages: dbSession.messages.map((msg: any) => ({
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              timestamp: msg.timestamp,
              toolCalls: msg.toolCalls as unknown[]
            })),
            context: dbSession.context as Record<string, unknown> || {}
          }
          
          // Sincronizar com memória
          this.sessions.set(sessionId, session)
          return session
        }
      } catch (error) {
        logger.error('Failed to fetch session from database:', error)
        this.dbAvailable = false
      }
    }

    // Fallback para memória
    return this.sessions.get(sessionId) || null
  }

  async addMessage(sessionId: string, message: AgentMessage, userId?: string): Promise<void> {
    // Adicionar à sessão em memória
    const session = this.sessions.get(sessionId)
    if (session) {
      session.messages.push(message)
    }

    // Tentar salvar no banco de dados
    if (this.dbAvailable) {
      try {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            role: message.role,
            content: message.content,
            toolCalls: message.toolCalls as any,
            timestamp: message.timestamp
          }
        })
        logger.debug(`Message added to database for session ${sessionId}${userId ? ` by user ${userId}` : ''}`)
      } catch (error) {
        logger.error('Failed to save message to database:', error)
        this.dbAvailable = false
      }
    }
  }

  async updateSessionContext(sessionId: string, context: Record<string, unknown>): Promise<void> {
    // Atualizar em memória
    const session = this.sessions.get(sessionId)
    if (session) {
      session.context = { ...session.context, ...context }
    }

    // Tentar atualizar no banco de dados
    if (this.dbAvailable) {
      try {
        await prisma.chatSession.update({
          where: { sessionId },
          data: { context: context as any }
        })
        logger.debug(`Session context updated in database for ${sessionId}`)
      } catch (error) {
        logger.error('Failed to update session context in database:', error)
        this.dbAvailable = false
      }
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    // Remover da memória
    this.sessions.delete(sessionId)

    // Tentar remover do banco de dados
    if (this.dbAvailable) {
      try {
        await prisma.chatSession.delete({
          where: { sessionId }
        })
        logger.info(`Session ${sessionId} deleted from database`)
      } catch (error) {
        logger.error('Failed to delete session from database:', error)
        this.dbAvailable = false
      }
    }
  }

  async getAllSessions(): Promise<AgentSession[]> {
    // Tentar buscar do banco de dados primeiro
    if (this.dbAvailable) {
      try {
        const dbSessions = await prisma.chatSession.findMany({
          include: {
            messages: {
              orderBy: { timestamp: 'asc' }
            }
          },
          orderBy: { updatedAt: 'desc' }
        })

        const sessions = dbSessions.map((dbSession: any) => ({
          id: dbSession.sessionId,
          messages: dbSession.messages.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: msg.timestamp,
            toolCalls: msg.toolCalls as unknown[]
          })),
          context: dbSession.context as Record<string, unknown> || {}
        }))

        // Sincronizar com memória
        sessions.forEach((session: AgentSession) => {
          this.sessions.set(session.id, session)
        })

        return sessions
      } catch (error) {
        logger.error('Failed to fetch sessions from database:', error)
        this.dbAvailable = false
      }
    }

    // Fallback para memória
    return Array.from(this.sessions.values())
  }

  getMemorySessionCount(): number {
    return this.sessions.size
  }

  isDatabaseAvailable(): boolean {
    return this.dbAvailable
  }
}