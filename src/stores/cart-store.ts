import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imagePath?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  itemCount: number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getItemQuantity: (id: string) => number;
  calculateTotal: () => void;
}

const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

export const useCartStore = create<CartStore>()(
  (set, get) => ({
    items: [],
    total: 0,
    itemCount: 0,

    addItem: (item, quantity = 1) => {
      const { items } = get();
      const existingItem = items.find(i => i.id === item.id);
      
      let newItems: CartItem[];
      
      if (existingItem) {
        newItems = items.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        newItems = [...items, { ...item, quantity }];
      }
      
      const newTotal = calculateCartTotal(newItems);
      const newItemCount = calculateItemCount(newItems);
      
      set({ 
        items: newItems, 
        total: newTotal, 
        itemCount: newItemCount 
      });
    },

    removeItem: (id) => {
      const { items } = get();
      const newItems = items.filter(item => item.id !== id);
      const newTotal = calculateCartTotal(newItems);
      const newItemCount = calculateItemCount(newItems);
      
      set({ 
        items: newItems, 
        total: newTotal, 
        itemCount: newItemCount 
      });
    },

    updateQuantity: (id, quantity) => {
      const { items } = get();
      
      if (quantity <= 0) {
        get().removeItem(id);
        return;
      }
      
      const newItems = items.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      const newTotal = calculateCartTotal(newItems);
      const newItemCount = calculateItemCount(newItems);
      
      set({ 
        items: newItems, 
        total: newTotal, 
        itemCount: newItemCount 
      });
    },

    clearCart: () => {
      set({ items: [], total: 0, itemCount: 0 });
    },

    getItemCount: () => {
      return get().itemCount;
    },

    getItemQuantity: (id) => {
      const { items } = get();
      const item = items.find(item => item.id === id);
      return item ? item.quantity : 0;
    },

    calculateTotal: () => {
      const { items } = get();
      const newTotal = calculateCartTotal(items);
      const newItemCount = calculateItemCount(items);
      set({ total: newTotal, itemCount: newItemCount });
    }
  })
);