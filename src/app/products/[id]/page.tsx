'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, Package, Clock, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { fetchProductById } from '@/lib/utils/api';
import { useAuth } from '@/contexts/auth-context';
import type { Product } from '@/lib/types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, getItemQuantity, isItemLoading } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      const productData = await fetchProductById(productId);
      
      if (productData) {
        setProduct(productData);
      } else {
        setError('Produto não encontrado');
      }
      
      setLoading(false);
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!user) {
      toast.error('Você precisa estar logado para adicionar produtos ao carrinho');
      return;
    }
    
    if (product.stock <= 0) {
      toast.error('Produto fora de estoque');
      return;
    }

    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imagePath: product.image || undefined,
        category: product.category
      });

      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho:', error);
      toast.error('Erro ao adicionar produto ao carrinho. Tente novamente.');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {error || 'Produto não encontrado'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                O produto que você está procurando não existe ou foi removido.
              </p>
              <Button onClick={() => router.push('/products')}>
                Ver todos os produtos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const cartQuantity = getItemQuantity(product.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            <span>Produtos</span>
            <span className="mx-2">›</span>
            <span>{product.category}</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
          </nav>
        </div>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <Card>
            <CardContent className="p-6">
              <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="h-16 w-16" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline">{product.category}</Badge>
                {product.prescription && (
                  <Badge variant="destructive">Receita Obrigatória</Badge>
                )}
              </div>


            </div>

            <div className="text-3xl font-bold text-green-600">
              R$ {product.price.toFixed(2)}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Fabricante:</span>
                <span className="font-medium">{product.manufacturer}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Estoque:</span>
                <span className={`font-medium ${
                  product.stock > 10 ? 'text-green-600' : 
                  product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock} unidades` : 'Fora de estoque'}
                </span>
              </div>
            </div>

            {cartQuantity > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-800 dark:text-green-100">
                    {cartQuantity} {cartQuantity === 1 ? 'item' : 'itens'} no carrinho
                  </span>
                  <span className="font-bold text-green-800 dark:text-green-100">
                    R$ {(product.price * cartQuantity).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || isItemLoading(product.id)}
              className="w-full"
              size="lg"
            >
              {isItemLoading(product.id) ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              {isItemLoading(product.id) ? 'Adicionando...' : 
               product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
            </Button>
          </div>
        </div>

        {/* Product Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Descrição do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description || 'Descrição não disponível.'}
            </p>
          </CardContent>
        </Card>

        {/* Safety Information */}
        {product.prescription && (
          <Card className="border-red-200 dark:border-red-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <Shield className="h-5 w-5" />
                Informações Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 font-medium mb-2">
                  ⚠️ Este medicamento requer receita médica
                </p>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  Consulte sempre um profissional de saúde antes de usar este medicamento. 
                  A automedicação pode ser prejudicial à sua saúde.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}