"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonLoader, ButtonLoading } from "@/components/loading";
import { useProductOverlay } from "@/contexts/product-overlay-context";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ProductOverlay() {
  const { isOpen, isLoading, title, query, products, hide } = useProductOverlay();
  const { addItem } = useCart();
  const [loadingById, setLoadingById] = useState<Record<string, boolean>>({});

  const headerTitle = useMemo(() => {
    if (title) return title;
    if (query) return `Resultados para "${query}"`;
    return "Recomendações";
  }, [title, query]);

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
          <SheetHeader>
            <SheetTitle className="text-gray-900 dark:text-white">{headerTitle}</SheetTitle>
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
                  {products.map((product) => (
                    <div key={product.id} className="flex gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{product.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.description}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">R$ {product.price.toFixed(2)}</Badge>
                              {product.prescription && (
                                <Badge variant="destructive" className="text-xs">Receita</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="text-sm"
                                >
                                  Detalhes
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-left">
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                  {product.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{product.description}</div>
                                  )}
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Categoria: {product.category}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-300">Preço: R$ {product.price.toFixed(2)}</div>
                                  {typeof product.stock === 'number' && (
                                    <div className="text-xs text-gray-600 dark:text-gray-300">Estoque: {product.stock}</div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                            <Button size="sm" className="text-sm" onClick={() => handleAdd(product)} disabled={!!loadingById[product.id]}>
                              {loadingById[product.id] ? <ButtonLoading /> : 'Adicionar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

