"use client";

import { useEffect } from 'react';
import { useCartSync } from '@/lib/services/cart-sync.service';
import { useAuth } from '@/contexts/auth-context';
import { logger } from '@/lib/logger';

interface CartSyncProviderProps {
  children: React.ReactNode;
}

export function CartSyncProvider({ children }: CartSyncProviderProps) {
  const { startAutoSync, stopAutoSync } = useCartSync();
  const { user } = useAuth();

  useEffect(() => {
    // Only start sync if user is authenticated
    if (user) {
      logger.info('Iniciando sincronização automática do carrinho para usuário autenticado');
      startAutoSync(5000); // Sincronizar a cada 5 segundos (reduzido de 3s)
    } else {
      logger.info('Parando sincronização automática - usuário não autenticado');
      stopAutoSync();
    }

    // Cleanup: parar sincronização quando o componente desmonta
    return () => {
      logger.info('Parando sincronização automática do carrinho');
      stopAutoSync();
    };
  }, [user, startAutoSync, stopAutoSync]); // Add user as dependency

  return <>{children}</>;
}