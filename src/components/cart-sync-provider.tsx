"use client";

import { useEffect } from 'react';
import { useCartSync } from '@/lib/services/cart-sync.service';
import { logger } from '@/lib/logger';

interface CartSyncProviderProps {
  children: React.ReactNode;
}

export function CartSyncProvider({ children }: CartSyncProviderProps) {
  const { startAutoSync, stopAutoSync } = useCartSync();

  useEffect(() => {
    // Iniciar sincronização automática quando o componente monta
    logger.info('Iniciando sincronização automática do carrinho');
    startAutoSync(3000); // Sincronizar a cada 3 segundos

    // Cleanup: parar sincronização quando o componente desmonta
    return () => {
      logger.info('Parando sincronização automática do carrinho');
      stopAutoSync();
    };
  }, [startAutoSync, stopAutoSync]);

  return <>{children}</>;
}