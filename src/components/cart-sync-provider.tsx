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
      logger.info('Iniciando sincronização do carrinho para usuário autenticado');
      
      // Fazer uma sincronização inicial imediata apenas uma vez
      if (!hasInitialSyncRef.current) {
        manualSync();
        hasInitialSyncRef.current = true;
      }
      
      // Reduzir drasticamente a frequência de polling para 30 segundos
      // Em vez de 5 segundos que estava causando spam
      startAutoSync(30000);
    } else {
      logger.info('Parando sincronização automática - usuário não autenticado');
      stopAutoSync();
      hasInitialSyncRef.current = false;
    }

    // Cleanup: parar sincronização quando o componente desmonta
    return () => {
      logger.info('Parando sincronização automática do carrinho');
      stopAutoSync();
    };
  }, [user, startAutoSync, stopAutoSync, manualSync]);

  return <>{children}</>;
}