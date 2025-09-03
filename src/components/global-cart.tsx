"use client";

import { useState, useEffect } from 'react';
import { Cart } from '@/components/Cart';
import { useCartContext } from '@/contexts/cart-context';
import { fetchProducts } from '@/lib/utils/api';
import type { Product } from '@/lib/types';

export function GlobalCart() {
  const { isCartOpen, closeCart } = useCartContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar produtos quando o carrinho for aberto
  useEffect(() => {
    if (isCartOpen && products.length === 0) {
      loadProducts();
    }
  }, [isCartOpen, products.length]);

  const loadProducts = async () => {
    setIsLoading(true);
    const products = await fetchProducts();
    setProducts(products);
    setIsLoading(false);
  };

  return (
    <Cart 
      products={products} 
      isOpen={isCartOpen} 
      onClose={closeCart} 
    />
  );
}