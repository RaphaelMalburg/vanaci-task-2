import { useCartStore } from '@/stores/cart-store';
import { useCartService } from '@/lib/services/cart.service';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imagePath?: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imagePath?: string;
}

export function useCart() {
  const { items, total, itemCount } = useCartStore();
  const cartService = useCartService();

  const addItem = async (product: Product, quantity: number = 1) => {
    const result = await cartService.addItem(product.id, quantity);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
      throw new Error(result.error);
    }
    
    return result;
  };

  const removeItem = async (productId: string) => {
    const result = await cartService.removeItem(productId);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
      throw new Error(result.error);
    }
    
    return result;
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const result = await cartService.updateQuantity(productId, quantity);
    
    if (result.success) {
      // Não mostrar toast para updates de quantidade (muito verboso)
    } else {
      toast.error(result.message);
      throw new Error(result.error);
    }
    
    return result;
  };

  const clearCart = async () => {
    const result = await cartService.clearCart();
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
      throw new Error(result.error);
    }
    
    return result;
  };

  const syncCart = async () => {
    const result = await cartService.syncCart();
    
    if (!result.success) {
      toast.error('Erro ao sincronizar carrinho');
    }
    
    return result;
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getItemCount = (): number => {
    return itemCount;
  };

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    syncCart,
    getItemQuantity,
    getItemCount
  };
}