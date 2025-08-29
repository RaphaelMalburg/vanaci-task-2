import { useCartStore } from '@/stores/cart-store';
import { logger } from '@/lib/logger';

interface CartSyncItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imagePath?: string;
  quantity: number;
}

interface CartSyncData {
  sessionId: string;
  items: CartSyncItem[];
  total: number;
}

export class CartSyncService {
  private static instance: CartSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private sessionId: string | null = null;
  private isClient = typeof window !== 'undefined';

  static getInstance(): CartSyncService {
    if (!CartSyncService.instance) {
      CartSyncService.instance = new CartSyncService();
    }
    return CartSyncService.instance;
  }

  private constructor() {
    if (this.isClient) {
      this.sessionId = this.getOrCreateSessionId();
    }
  }

  private getOrCreateSessionId(): string {
    if (!this.isClient) return 'server-session';
    
    let sessionId = localStorage.getItem('cart-session-id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cart-session-id', sessionId);
    }
    return sessionId;
  }

  getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = this.getOrCreateSessionId();
    }
    return this.sessionId;
  }

  async syncCartFromBackend(): Promise<void> {
    if (!this.isClient || !this.sessionId) {
      console.log('🔄 [CartSync] Sync cancelado - não é cliente ou sessionId ausente', { isClient: this.isClient, sessionId: this.sessionId });
      return;
    }

    try {
      console.log('🔄 [CartSync] Iniciando sincronização do backend', { sessionId: this.sessionId });
      const response = await fetch(`/api/cart?sessionId=${this.sessionId}`);
      console.log('🔄 [CartSync] Resposta da API cart:', { status: response.status, ok: response.ok });
      
      if (!response.ok) {
        logger.warn('Falha ao sincronizar carrinho do backend', { status: response.status });
        console.log('❌ [CartSync] Falha na sincronização - status não ok:', response.status);
        return;
      }

      const backendCart: CartSyncData = await response.json();
      console.log('📦 [CartSync] Carrinho do backend recebido:', backendCart);
      
      const cartStore = useCartStore.getState();
      console.log('🛒 [CartSync] Estado atual do Zustand:', { items: cartStore.items, total: cartStore.total });
      
      // Verificar se há diferenças entre o carrinho do backend e o frontend
      const needsSync = this.cartsDiffer(backendCart.items, cartStore.items);
      console.log('🔍 [CartSync] Necessita sincronização?', { needsSync, backendItemsCount: backendCart.items.length, frontendItemsCount: cartStore.items.length });
      
      if (needsSync) {
        logger.info('Sincronizando carrinho do backend para frontend', {
          backendItems: backendCart.items.length,
          frontendItems: cartStore.items.length
        });
        console.log('🔄 [CartSync] Sincronizando carrinho - limpando e adicionando itens');
        
        // Limpar carrinho atual e adicionar itens do backend
        cartStore.clearCart();
        console.log('🗑️ [CartSync] Carrinho limpo');
        
        backendCart.items.forEach((item, index) => {
          console.log(`➕ [CartSync] Adicionando item ${index + 1}/${backendCart.items.length}:`, item);
          cartStore.addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            imagePath: item.imagePath
          }, item.quantity);
        });
        
        console.log('✅ [CartSync] Sincronização concluída - novo estado:', useCartStore.getState());
      } else {
        console.log('✅ [CartSync] Carrinho já está sincronizado - nenhuma alteração necessária');
      }
    } catch (error) {
      logger.error('Erro ao sincronizar carrinho do backend', { error });
      console.error('❌ [CartSync] Erro na sincronização:', error);
    }
  }

  async syncCartToBackend(): Promise<void> {
    if (!this.isClient || !this.sessionId) return;

    try {
      const cartStore = useCartStore.getState();
      
      // Primeiro, limpar o carrinho no backend
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          clearAll: true
        })
      });

      // Depois, adicionar todos os itens do frontend ao backend
      for (const item of cartStore.items) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            productId: item.id,
            quantity: item.quantity
          })
        });
      }

      logger.info('Carrinho sincronizado do frontend para backend', {
        items: cartStore.items.length
      });
    } catch (error) {
      logger.error('Erro ao sincronizar carrinho para backend', { error });
    }
  }

  private cartsDiffer(backendItems: CartSyncItem[], frontendItems: any[]): boolean {
    if (backendItems.length !== frontendItems.length) {
      return true;
    }

    for (const backendItem of backendItems) {
      const frontendItem = frontendItems.find(item => item.id === backendItem.id);
      if (!frontendItem || frontendItem.quantity !== backendItem.quantity) {
        return true;
      }
    }

    return false;
  }

  startAutoSync(intervalMs: number = 5000): void {
    if (!this.isClient) return;
    
    this.stopAutoSync();
    
    this.syncInterval = setInterval(() => {
      this.syncCartFromBackend();
    }, intervalMs);
    
    logger.info('Auto-sincronização do carrinho iniciada', { intervalMs });
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Auto-sincronização do carrinho parada');
    }
  }

  // Método para sincronização manual
  async manualSync(): Promise<void> {
    await this.syncCartFromBackend();
  }
}

// Hook para usar o serviço de sincronização
export function useCartSync() {
  const syncService = CartSyncService.getInstance();
  
  return {
    syncFromBackend: () => syncService.syncCartFromBackend(),
    syncToBackend: () => syncService.syncCartToBackend(),
    startAutoSync: (interval?: number) => syncService.startAutoSync(interval),
    stopAutoSync: () => syncService.stopAutoSync(),
    getSessionId: () => syncService.getSessionId(),
    manualSync: () => syncService.manualSync()
  };
}