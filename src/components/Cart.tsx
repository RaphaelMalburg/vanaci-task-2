'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

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

interface CartProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ products, isOpen, onClose }: CartProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, getItemCount } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cartItems = cart.items.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    return product ? { product, quantity: cartItem.quantity } : null;
  }).filter(Boolean) as { product: Product; quantity: number }[];

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
    if (cartItems.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    setIsCheckingOut(true);
    
    // Simular processo de checkout
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso do checkout
      const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
      
      toast.success(`Pedido ${orderId} realizado com sucesso!`);
      clearCart();
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full overflow-y-auto shadow-2xl border-l">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({getItemCount()})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                      {product.imagePath ? (
                        <Image
                          src={product.imagePath}
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
                          <Badge variant="destructive" className="text-xs">
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
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
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
                ))}

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}