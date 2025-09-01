// Sistema de contexto global para compatibilidade com a biblioteca AI da Vercel
// Substitui o sistema de contexto do LangChain que é incompatível

interface GlobalContext {
  sessionId?: string;
  cartId?: string;
  userId?: string;
  currentPage?: string;
  user?: { id: string; username: string };
}

// Contexto global para armazenar dados da sessão
let globalContext: GlobalContext = {};

// Função para definir variáveis no contexto global
export function setGlobalContext<T extends keyof GlobalContext>(key: T, value: GlobalContext[T]): void {
  globalContext[key] = value;
  console.log(`🔧 [Global Context] ${key} definido:`, value);
}

// Função para obter variáveis do contexto global
export function getGlobalContext<T extends keyof GlobalContext>(key: T): GlobalContext[T] | undefined {
  const value = globalContext[key];
  console.log(`🔍 [Global Context] Obtendo ${key}:`, value);
  return value;
}

// Função para limpar o contexto global
export function clearGlobalContext(): void {
  globalContext = {};
  console.log(`🧹 [Global Context] Contexto limpo`);
}

// Função para obter todo o contexto
export function getAllGlobalContext(): GlobalContext {
  return { ...globalContext };
}

// Função para atualizar múltiplas variáveis do contexto
export function updateGlobalContext(updates: Partial<GlobalContext>): void {
  globalContext = { ...globalContext, ...updates };
  console.log(`🔄 [Global Context] Contexto atualizado:`, globalContext);
}