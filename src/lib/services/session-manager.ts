/**
 * SessionManager - Gerenciador centralizado de sessões
 * 
 * Este serviço centraliza o gerenciamento de session IDs para garantir
 * consistência entre frontend e backend, evitando conflitos e duplicações.
 */

export class SessionManager {
  private static instance: SessionManager;
  private sessionId: string | null = null;
  private readonly SESSION_KEY = 'farmacia-session-id';
  private readonly isClient = typeof window !== 'undefined';

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Obtém ou cria um session ID
   * Prioriza session ID existente no localStorage, depois cookies, depois cria novo
   */
  getSessionId(): string {
    if (this.sessionId) {
      return this.sessionId;
    }

    if (!this.isClient) {
      // No servidor, gerar um ID temporário
      this.sessionId = this.generateSessionId();
      return this.sessionId;
    }

    // Tentar recuperar do localStorage
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    
    // Se não encontrar, tentar recuperar de cookie
    if (!sessionId) {
      sessionId = this.getSessionFromCookie();
    }

    // Se ainda não encontrar, criar novo
    if (!sessionId) {
      sessionId = this.generateSessionId();
      this.persistSession(sessionId);
    }

    this.sessionId = sessionId;
    return sessionId;
  }

  /**
   * Define um session ID específico (útil para sincronização com backend)
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    if (this.isClient) {
      this.persistSession(sessionId);
    }
  }

  /**
   * Limpa a sessão atual
   */
  clearSession(): void {
    this.sessionId = null;
    if (this.isClient) {
      localStorage.removeItem(this.SESSION_KEY);
      this.clearSessionCookie();
    }
  }

  /**
   * Renova a sessão (útil para logout/login)
   */
  renewSession(): string {
    this.clearSession();
    return this.getSessionId();
  }

  /**
   * Verifica se a sessão é válida
   */
  isValidSession(): boolean {
    const sessionId = this.getSessionId();
    return sessionId.length > 0 && sessionId.startsWith('session_');
  }

  /**
   * Gera um novo session ID único
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Persiste a sessão no localStorage e cookie
   */
  private persistSession(sessionId: string): void {
    try {
      localStorage.setItem(this.SESSION_KEY, sessionId);
      this.setSessionCookie(sessionId);
    } catch (error) {
      console.warn('Falha ao persistir sessão:', error);
    }
  }

  /**
   * Recupera session ID do cookie
   */
  private getSessionFromCookie(): string | null {
    if (!this.isClient) return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.SESSION_KEY) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Define session ID no cookie
   */
  private setSessionCookie(sessionId: string): void {
    if (!this.isClient) return;
    
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 dias
    
    document.cookie = `${this.SESSION_KEY}=${encodeURIComponent(sessionId)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  /**
   * Remove session ID do cookie
   */
  private clearSessionCookie(): void {
    if (!this.isClient) return;
    
    document.cookie = `${this.SESSION_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

// Hook para usar o SessionManager
export function useSessionManager() {
  const sessionManager = SessionManager.getInstance();
  
  return {
    getSessionId: () => sessionManager.getSessionId(),
    setSessionId: (id: string) => sessionManager.setSessionId(id),
    clearSession: () => sessionManager.clearSession(),
    renewSession: () => sessionManager.renewSession(),
    isValidSession: () => sessionManager.isValidSession()
  };
}

// Instância global para uso direto
export const sessionManager = SessionManager.getInstance();