'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts, processCheckout, validateCartNotEmpty } from '@/lib/utils/api';
import type { Product } from '@/lib/types';

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart, isItemLoading, isLoading: cartLoading } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Buscar produtos ao carregar a página
  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProducts();
      setProducts(products);
      setIsLoading(false);
    };

    loadProducts();
  }, []);

  // Melhor sincronização: usar dados do carrinho como fonte principal
  const cartItems = items.map(cartItem => {
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

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast.error(`Apenas ${product.stock} unidades disponíveis em estoque`);
      return;
    }

    try {
      if (newQuantity <= 0) {
        await removeItem(productId);
      } else {
        await updateQuantity(productId, newQuantity);
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  const handleCheckout = async () => {
    if (!validateCartNotEmpty(cartItems)) {
      return;
    }

    setIsCheckingOut(true);
    
    const orderId = await processCheckout();
    if (orderId) {
      clearCart();
    }
    
    setIsCheckingOut(false);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Aplicar desconto de 5% para pedidos acima de R$ 100
  const discount = subtotal > 100 ? subtotal * 0.05 : 0;
  const finalTotal = subtotal - discount;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando seu carrinho...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/products" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar às compras
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seu Carrinho</h1>
        <Badge variant="outline" className="ml-2">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
        </Badge>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Seu carrinho está vazio</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Adicione produtos para continuar suas compras</p>
          <Link href="/products">
            <Button>Ver produtos</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Itens do Carrinho</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      try {
                        await clearCart();
                      } catch (error) {
                        console.error('Erro ao limpar carrinho:', error);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                </div>
                <Separator className="mb-4" />

                <div className="space-y-4">
                  {cartItems.map(({ product, quantity }) => (
                    <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mr-4 mb-4 sm:mb-0">
                        {product.image ? (
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            width={80} 
                            height={80} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                            <ShoppingCart className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                        <div className="mt-1 flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            R$ {product.price.toFixed(2)}
                          </span>
                          {quantity > 1 && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              (R$ {(product.price * quantity).toFixed(2)} total)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-4 sm:mt-0">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(product.id, quantity - 1)}
                            disabled={isItemLoading(product.id)}
                          >
                            {isItemLoading(product.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                          </Button>
                          <span className="w-8 text-center text-sm">{quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-none"
                            onClick={() => handleQuantityChange(product.id, quantity + 1)}
                            disabled={isItemLoading(product.id)}
                          >
                            {isItemLoading(product.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={async () => {
                            try {
                              await removeItem(product.id);
                            } catch (error) {
                              console.error('Erro ao remover item:', error);
                            }
                          }}
                          disabled={isItemLoading(product.id)}
                        >
                          {isItemLoading(product.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden sticky top-4">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resumo do Pedido</h2>
                <Separator className="mb-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto (5%)</span>
                      <span>- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Frete</span>
                    <span className="text-gray-900 dark:text-white">Grátis</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-medium text-lg">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600">R$ {finalTotal.toFixed(2)}</span>
                  </div>
                  
                  {subtotal < 100 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Adicione mais R$ {(100 - subtotal).toFixed(2)} para ganhar 5% de desconto
                    </p>
                  )}
                </div>
                
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Finalizar Compra
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  Pagamentos processados com segurança
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}