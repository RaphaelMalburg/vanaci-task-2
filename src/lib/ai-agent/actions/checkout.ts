import { tool } from 'ai';
import { z } from 'zod';
import type { ToolResult, NavigationResult, PaymentMethod, ShippingInfo, DiscountCode } from '../types';

// Função auxiliar para fazer chamadas à API
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// Tool: Ir para checkout
export const goToCheckoutTool = tool({
  description: 'Inicia o processo de checkout',
  inputSchema: z.object({}),
  execute: async (): Promise<NavigationResult> => {
    try {
      // Verificar se há itens no carrinho
      const cartData = await apiCall('/cart');
      
      if (cartData.items.length === 0) {
        return {
          success: false,
          message: 'Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.',
        };
      }
      
      return {
        success: true,
        message: `Redirecionando para checkout. Total: R$ ${cartData.total.toFixed(2)}`,
        redirectUrl: '/checkout',
        data: cartData,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao acessar checkout: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
});

// Tool: Aplicar código de desconto
export const applyDiscountCodeTool = tool({
  description: 'Aplica um código de desconto ao pedido',
  inputSchema: z.object({
    code: z.string().describe('Código de desconto a ser aplicado'),
  }),
  execute: async ({ code }: {
    code: string;
  }) => {
    try {
      const result = await apiCall('/checkout/discount', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });

      return {
        ...result,
        message: `Código de desconto '${code}' aplicado com sucesso!`,
      };
    } catch (error) {
      throw new Error(`Código de desconto inválido ou expirado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Calcular frete
export const calculateShippingTool = tool({
  description: 'Calcula o frete baseado no CEP de entrega',
  inputSchema: z.object({
    zipCode: z.string().describe('CEP para cálculo do frete (formato: 12345-678 ou 12345678)'),
  }),
  execute: async ({ zipCode }: {
    zipCode: string;
  }) => {
    try {
      const result = await apiCall('/checkout/shipping', {
        method: 'POST',
        body: JSON.stringify({ zipCode }),
      });

      return {
        ...result,
        message: 'Custo de frete calculado com sucesso!',
      };
    } catch (error) {
      throw new Error(`Erro ao calcular frete: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Definir método de pagamento
export const setPaymentMethodTool = tool({
  description: 'Define o método de pagamento para o pedido',
  inputSchema: z.object({
    method: z.enum(['credit', 'debit', 'pix', 'boleto']).describe('Método de pagamento'),
    installments: z.number().min(1).max(12).optional().describe('Número de parcelas (apenas para cartão de crédito)'),
  }),
  execute: async ({ method, installments }: {
    method: 'credit' | 'debit' | 'pix' | 'boleto';
    installments?: number;
  }) => {
    try {
      const result = await apiCall('/checkout/payment', {
        method: 'POST',
        body: JSON.stringify({ method, installments }),
      });

      return {
        ...result,
        message: 'Pagamento processado com sucesso!',
      };
    } catch (error) {
      throw new Error(`Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Tool: Finalizar pedido
export const placeOrderTool = tool({
  description: 'Finaliza e confirma o pedido',
  inputSchema: z.object({
    paymentMethod: z.enum(['credit', 'debit', 'pix', 'boleto']).describe('Método de pagamento'),
    shippingZipCode: z.string().describe('CEP para entrega'),
    discountCode: z.string().optional().describe('Código de desconto (opcional)'),
  }),
  execute: async ({ paymentMethod, shippingZipCode, discountCode }: {
    paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto';
    shippingZipCode: string;
    discountCode?: string;
  }) => {
    try {
      const result = await apiCall('/checkout/finalize', {
        method: 'POST',
        body: JSON.stringify({ paymentMethod, shippingZipCode, discountCode }),
      });

      return {
        ...result,
        message: 'Compra finalizada com sucesso!',
      };
    } catch (error) {
      throw new Error(`Erro ao finalizar compra: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  },
});

// Exportar todas as tools de checkout
export const checkoutTools = {
  go_to_checkout: goToCheckoutTool,
  apply_discount_code: applyDiscountCodeTool,
  calculate_shipping: calculateShippingTool,
  set_payment_method: setPaymentMethodTool,
  place_order: placeOrderTool,
};