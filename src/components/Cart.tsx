'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { processCheckout, validateCartNotEmpty } from '@/lib/utils/api';
import type { Product } from '@/lib/types';

interface CartProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ products, isOpen, onClose }: CartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, getItemCount } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Melhor sincronização: usar dados do carrinho como fonte principal
  const cartItems = (cart.items || []).map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (product) {
      return { product, quantity: cartItem.quantity };
    }
    // Se o produto não for encontrado na lista, usar dados do carrinho
    return {
      product: {
        id: cartItem.id,
        name: cartItem.name,
        price: cartItem.price,
        category: cartItem.category,
        description: '',
        image: cartItem.imagePath || undefined,
        stock: 999, // Assumir disponível se não encontrado
        prescription: false,
        manufacturer: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Product,
      quantity: cartItem.quantity
    };
  }).filter(item => item.quantity > 0);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast.error(`Apenas ${product.stock} unidades disponíveis em estoque`);
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Item removido do carrinho');
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!validateCartNotEmpty(cartItems)) {
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const orderId = await processCheckout();
      if (orderId) {
        clearCart();
        onClose();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Carrinho ({getItemCount()})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(({ product, quantity }) => {
                  const isProductNotFound = !products.find(p => p.id === product.id);
                  
                  if (isProductNotFound) {
                    return (
                      <div key={product.id} className="flex gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {product.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Quantidade: {quantity}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Produto temporariamente indisponível
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(product.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div key={product.id} className="flex gap-3 p-3 border rounded-lg">
                      <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Sem imagem
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            R$ {product.price.toFixed(2)}
                          </Badge>
                          {product.prescription && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                              Receita
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(product.id)}
                          className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[20px] text-center">
                            {quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-sm font-medium text-green-600">
                          R$ {(product.price * quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>R$ {cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frete:</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {cart.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isCheckingOut ? 'Processando...' : 'Finalizar Compra'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearCart();
                      toast.success('Carrinho limpo');
                    }}
                    className="w-full"
                    size="sm"
                  >
                    Limpar Carrinho
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}