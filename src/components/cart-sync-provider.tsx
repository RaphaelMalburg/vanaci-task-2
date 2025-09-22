"use client";

import { useEffect, useRef } from 'react';
import { useCartSync } from '@/lib/services/cart-sync.service';
import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/lib/logger';

interface CartSyncProviderProps {
  children: React.ReactNode;
}

export function CartSyncProvider({ children }: CartSyncProviderProps) {
  const { startAutoSync, stopAutoSync, manualSync } = useCartSync();
  const { user } = useAuth();
  const hasInitialSyncRef = useRef(false);

  useEffect(() => {
    // Only start sync if user is authenticated
    if (user) {
      logger.info('Usuário autenticado detectado - fazendo sincronização inicial do carrinho');
      
      // Fazer uma sincronização inicial imediata apenas uma vez
      if (!hasInitialSyncRef.current) {
        manualSync();
        hasInitialSyncRef.current = true;
      }
      
      // DESABILITADO: Auto-sync polling que estava causando chamadas excessivas à API
      // O carrinho agora será sincronizado apenas:
      // 1. Na inicialização (acima)
      // 2. Em ações específicas do usuário (via cart service)
      // 3. Quando necessário (via manual sync)
      
      // startAutoSync(30000); // COMENTADO - não mais necessário
    } else {
      logger.info('Usuário não autenticado - limpando estado de sincronização');
      stopAutoSync(); // Garantir que qualquer sync ativo seja parado
      hasInitialSyncRef.current = false;
    }

    // Cleanup: parar sincronização quando o componente desmonta
    return () => {
      logger.info('Parando qualquer sincronização ativa do carrinho');
      stopAutoSync();
    };
  }, [user, startAutoSync, stopAutoSync, manualSync]);

  return <>{children}</>;
}