"use client";

import { useState, useEffect } from 'react';
import { Cart } from '@/components/Cart';
import { useCartContext } from '@/contexts/cart-context';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  imagePath: string | null;
  stock: number;
  prescription: boolean;
  manufacturer: string | null;
  createdAt: string;
  updatedAt: string;
}

export function GlobalCart() {
  const { isCartOpen, closeCart } = useCartContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar produtos quando o carrinho for aberto
  useEffect(() => {
    if (isCartOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isCartOpen, products.length]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Cart 
      products={products} 
      isOpen={isCartOpen} 
      onClose={closeCart} 
    />
  );
}