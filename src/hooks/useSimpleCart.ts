
import { useState, useEffect, useCallback } from 'react';
import type { SimpleCartData, SimpleCartItem } from '@/lib/cart-storage-simple';

interface UseSimpleCartReturn {
  cart: SimpleCartData;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export function useSimpleCart(sessionId: string): UseSimpleCartReturn {
  const [cart, setCart] = useState<SimpleCartData>({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/cart-simple?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const addItem = useCallback(async (productId: string, quantity: number = 1) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cart-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, productId, quantity }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add item');
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const removeItem = useCallback(async (productId: string) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cart-simple', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, productId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove item');
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cart-simple', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, productId, quantity }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update quantity');
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const clearCart = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cart-simple', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, clearAll: true }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear cart');
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Auto-refresh cart when sessionId changes
  useEffect(() => {
    if (sessionId) {
      refreshCart();
    }
  }, [sessionId, refreshCart]);

  return {
    cart,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
  };
}