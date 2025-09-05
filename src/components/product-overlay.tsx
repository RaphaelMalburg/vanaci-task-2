"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonLoader, ButtonLoading } from "@/components/loading";
import { useProductOverlay } from "@/contexts/product-overlay-context";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Gift, Clock, Star } from "lucide-react";

export function ProductOverlay() {
  const { isOpen, isLoading, title, query, products, hide } = useProductOverlay();
  const { addItem } = useCart();
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});
  const [showPromotions, setShowPromotions] = useState(false);
  const [animateProducts, setAnimateProducts] = useState(false);

  const headerTitle = useMemo(() => {
    if (title) return title;
    if (query) return `Resultados para "${query}"`;
    return "Recomendações";
  }, [title, query]);

  // Animação de entrada dos produtos
  useEffect(() => {
    if (products.length > 0 && !isLoading) {
      setAnimateProducts(false);
      const timer = setTimeout(() => setAnimateProducts(true), 100);
      return () => clearTimeout(timer);
    }
  }, [products, isLoading]);

  // Verificar se há promoções ativas
  const hasPromotions = useMemo(() => {
    return products.some(product => 
      product.category === 'Vitaminas' || 
      product.name.toLowerCase().includes('vitamina') ||
      product.price < 20 // Produtos em promoção
    );
  }, [products]);

  const handleAdd = async (product: Product) => {
    if (loadingById[product.id]) return;
    setLoadingById((s) => ({ ...s, [product.id]: true }));
    try {
      await addItem({ id: product.id, name: product.name, price: product.price, category: product.category, imagePath: product.image }, 1);
    } catch {}
    finally {
      setLoadingById((s) => ({ ...s, [product.id]: false }));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (!o ? hide() : undefined)}>
      <SheetContent side="right" className="sm:max-w-xl w-full bg-white dark:bg-gray-900 border-l dark:border-gray-800">
        <div className="flex flex-col h-full">
          <SheetHeader className="relative">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                {headerTitle}
              </SheetTitle>
              {hasPromotions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPromotions(!showPromotions)}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <Gift className="h-4 w-4 mr-1" />
                  Promoções
                </Button>
              )}
            </div>
            {showPromotions && hasPromotions && (
              <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-sm font-medium mb-1">
                  <Gift className="h-4 w-4" />
                  Ofertas Especiais Disponíveis!
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Produtos em destaque com preços especiais. Aproveite enquanto durarem os estoques!
                </p>
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700" />
                    <div className="flex-1">
                      <SkeletonLoader lines={2} className="mb-2" />
                      <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-600 dark:text-gray-300">
                Nenhum produto encontrado.
              </div>
            ) : (
              <TooltipProvider>
                <div className="space-y-4">
                  {products.map((product, index) => {
                    const isOnPromotion = product.category === 'Vitaminas' || product.name.toLowerCase().includes('vitamina') || product.price < 20;
                    const animationDelay = animateProducts ? `${index * 100}ms` : '0ms';
                    
                    return (
                    <div 
                      key={product.id} 
                      className={`relative flex gap-4 p-4 border rounded-xl transition-all duration-500 transform hover:shadow-lg ${
                        animateProducts ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                      } ${
                        isOnPromotion 
                          ? 'bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 border-orange-200 dark:border-orange-800 shadow-md' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={{ animationDelay }}
                    >
                      {isOnPromotion && (
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                          <Star className="h-3 w-3" />
                          Oferta
                        </div>
                      )}
                      <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-3">
                          <div className="min-w-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate cursor-help hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  {product.name}
                                </h3>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-2">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                  {product.description && (
                                    <div className="text-sm text-gray-600 dark:text-gray-300">{product.description}</div>
                                  )}
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Categoria: {product.category}</div>
                                  {typeof product.stock === 'number' && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Estoque: {product.stock} unidades</div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-sm font-medium ${
                                  isOnPromotion 
                                    ? 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700' 
                                    : 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                                }`}
                              >
                                {isOnPromotion && <Gift className="h-4 w-4 mr-1" />}
                                R$ {product.price.toFixed(2)}
                              </Badge>
                              {product.prescription && (
                                <Badge variant="destructive" className="text-xs">Receita</Badge>
                              )}
                              {isOnPromotion && (
                                <Badge className="text-xs bg-orange-500 text-white">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Oferta
                                </Badge>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              className={`transition-all duration-200 ${
                                isOnPromotion 
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                              onClick={() => handleAdd(product)} 
                              disabled={!!loadingById[product.id]}
                            >
                              {loadingById[product.id] ? <ButtonLoading /> : (
                                isOnPromotion ? (
                                  <>
                                    <Gift className="h-4 w-4 mr-2" />
                                    Aproveitar
                                  </>
                                ) : (
                                  <>
                                    Adicionar
                                  </>
                                )
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </TooltipProvider>
            )}
          </div>

          <div className="pt-4">
            <Button variant="outline" className="w-full" onClick={hide}>Fechar</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

