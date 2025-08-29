import { toast } from 'sonner';
import type { Product } from '@/lib/types';

/**
 * Utilitário para buscar todos os produtos
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Falha ao buscar produtos');
    }
    const data = await response.json();
    return data.products || data || [];
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    toast.error('Não foi possível carregar os produtos. Tente novamente.');
    return [];
  }
}

/**
 * Utilitário para buscar um produto específico por ID
 */
export async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${productId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        toast.error('Produto não encontrado');
      } else {
        toast.error('Erro ao carregar produto');
      }
      return null;
    }

    const productData = await response.json();
    return productData;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    toast.error('Erro ao carregar produto. Tente novamente.');
    return null;
  }
}

/**
 * Utilitário para simular processo de checkout
 */
export async function processCheckout(): Promise<string | null> {
  try {
    // Simular processo de checkout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular sucesso do checkout
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    
    toast.success(`Pedido ${orderId} realizado com sucesso!`);
    return orderId;
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Erro ao processar pedido. Tente novamente.');
    return null;
  }
}

/**
 * Utilitário para gerar ID de pedido
 */
export function generateOrderId(): string {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
}

/**
 * Utilitário para geração de IDs únicos
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Utilitário para calcular total do carrinho
 */
export function calculateCartTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

/**
 * Utilitário para validar se o carrinho não está vazio
 */
export function validateCartNotEmpty(cartItems: any[]): boolean {
  if (cartItems.length === 0) {
    toast.error('Carrinho vazio');
    return false;
  }
  return true;
}