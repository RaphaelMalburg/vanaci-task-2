"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/hooks/useCart';
import { logger } from '@/lib/logger';

interface CartInitializerProps {
  children: React.ReactNode;
}

export function CartInitializer({ children }: CartInitializerProps) {
  const { user, isLoading } = useAuth();
  const { syncCart } = useCart();

  useEffect(() => {
    // Só inicializar o carrinho quando:
    // 1. Não estiver carregando o estado de autenticação
    // 2. Usuário estiver logado
    if (!isLoading && user) {
      logger.info('Usuário logado detectado, inicializando carrinho', { userId: user.id });
      
      // Fazer fetch do carrinho do usuário e popular o componente
      syncCart()
        .then((result) => {
          if (result.success) {
            logger.info('Carrinho inicializado com sucesso', { 
              userId: user.id, 
              itemCount: result.data?.itemCount || 0 
            });
          } else {
            logger.error('Erro ao inicializar carrinho', { 
              userId: user.id, 
              error: result.error 
            });
          }
        })
        .catch((error) => {
          logger.error('Erro ao sincronizar carrinho na inicialização', { 
            userId: user.id, 
            error: error.message 
          });
        });
    }
  }, [user, isLoading, syncCart]);

  return <>{children}</>;
}