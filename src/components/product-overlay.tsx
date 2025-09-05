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
import { Sparkles, Gift, Clock, Star, ShoppingCart, Info, Package, Heart } from "lucide-react";

export function ProductOverlay() {
  const { isOpen, isLoading, title, query, products, hide } = useProductOverlay();
  const { addItem, isItemLoading } = useCart();
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
    try {
      await addItem({ id: product.id, name: product.name, price: product.price, category: product.category, imagePath: product.image }, 1);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
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
                      className={`group relative flex gap-4 p-5 border rounded-2xl transition-all duration-500 transform hover:shadow-xl hover:scale-[1.02] ${
                        animateProducts ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                      } ${
                        isOnPromotion 
                          ? 'bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 dark:from-orange-900/20 dark:via-yellow-900/10 dark:to-orange-900/20 border-orange-300 dark:border-orange-700 shadow-lg hover:shadow-orange-200/50 dark:hover:shadow-orange-900/30' 
                          : 'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20'
                      }`}
                      style={{ animationDelay }}
                    >
                      {isOnPromotion && (
                        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xl z-10 animate-pulse">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-semibold">Oferta</span>
                        </div>
                      )}
                      
                      {/* Indicador de categoria */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-sm"
                        >
                          <Package className="h-3 w-3 mr-1" />
                          {product.category}
                        </Badge>
                      </div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300">
                        {product.image ? (
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-300" 
                            sizes="96px" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <Package className="h-6 w-6 mb-1" />
                            <span className="text-xs text-center">Sem imagem</span>
                          </div>
                        )}
                        
                        {/* Overlay de hover na imagem */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 shadow-lg">
                              <Info className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-3">
                          <div className="min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 cursor-help hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight">
                                    {product.name}
                                  </h3>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm p-4">
                                  <div className="space-y-3">
                                    <div className="font-bold text-base text-gray-900 dark:text-gray-100">{product.name}</div>
                                    {product.description && (
                                      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">Categoria</div>
                                        <div className="text-gray-600 dark:text-gray-400">{product.category}</div>
                                      </div>
                                      {typeof product.stock === 'number' && (
                                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                          <div className="font-medium text-gray-900 dark:text-gray-100">Estoque</div>
                                          <div className="text-gray-600 dark:text-gray-400">{product.stock} unidades</div>
                                        </div>
                                      )}
                                    </div>
                                    {product.prescription && (
                                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 rounded text-xs">
                                        <div className="font-medium text-red-700 dark:text-red-300">⚠️ Medicamento controlado</div>
                                        <div className="text-red-600 dark:text-red-400">Necessária apresentação de receita médica</div>
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                              
                              {/* Botão de favorito */}
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
                              </button>
                            </div>
                            
                            {product.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-lg font-bold text-lg ${
                                isOnPromotion 
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                              }`}>
                                {isOnPromotion && <Gift className="h-4 w-4 mr-1.5" />}
                                R$ {product.price.toFixed(2)}
                              </div>
                              
                              {product.prescription && (
                                <Badge variant="destructive" className="text-xs font-medium px-2 py-1">
                                  <span className="mr-1">🔒</span>
                                  Receita
                                </Badge>
                              )}
                              
                              {isOnPromotion && (
                                <Badge className="text-xs bg-gradient-to-r from-orange-400 to-red-400 text-white font-medium px-2 py-1 animate-pulse">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Oferta Limitada
                                </Badge>
                              )}
                              
                              {typeof product.stock === 'number' && product.stock <= 5 && (
                                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700">
                                  <span className="mr-1">⚠️</span>
                                  Últimas {product.stock} unidades
                                </Badge>
                              )}
                            </div>
                            <Button 
                              size="lg" 
                              className={`transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl ${
                                isOnPromotion 
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0' 
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0'
                              }`}
                              onClick={() => handleAdd(product)} 
                              disabled={isItemLoading(product.id)}
                            >
                              {isItemLoading(product.id) ? (
                                <ButtonLoading />
                              ) : (
                                <>
                                  {isOnPromotion ? (
                                    <>
                                      <Gift className="h-4 w-4 mr-2" />
                                      Aproveitar Oferta
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Adicionar ao Carrinho
                                    </>
                                  )}
                                </>
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

