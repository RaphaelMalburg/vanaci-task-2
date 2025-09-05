"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreadcrumbsContainer } from "@/components/breadcrumbs";
import { ShoppingCart, Search, Filter, Loader2, ChevronDown, ChevronUp, Info, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Cart } from "@/components/Cart";
import { useAuth } from "@/contexts/auth-context";
import { useProductOverlay } from "@/contexts/product-overlay-context";
import { useRouter } from "next/navigation";

import type { Product } from '@/lib/types';

// Produtos serão carregados do banco de dados

type SortOption = "name" | "price-low" | "price-high" | "category";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, getItemCount, getItemQuantity, total, isItemLoading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const overlay = useProductOverlay();

  // Fetch produtos do banco de dados
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Erro ao carregar produtos');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Extrair categorias únicas dos produtos
  const categories = useMemo(() => {
    if (!products || products.length === 0) {
      return ['Todos'];
    }
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['Todos', ...uniqueCategories.sort()];
  }, [products]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredAndSortedProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesStock = !showOnlyInStock || product.stock > 0;
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "category":
          return a.category.localeCompare(b.category);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, showOnlyInStock]);

  const handleAddToCart = async (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
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

  // Agrupar produtos por categoria
  const productsByCategory = useMemo(() => {
    const grouped: { [key: string]: Product[] } = {};
    
    filteredAndSortedProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    
    return grouped;
  }, [filteredAndSortedProducts]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Erro ao carregar produtos: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }







  return (
    <div className="min-h-screen relative bg-gradient-to-br from-sky-100/60 via-white to-emerald-100/60 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300 py-12">
      <BreadcrumbsContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
        {/* Agent Suggestions - full width section pushing content down */}
        {overlay.isOpen && (
          <div className="mb-8">
            <div className="rounded-2xl border border-white/40 dark:border-gray-700/40 bg-white/70 dark:bg-gray-800/60 backdrop-blur-md shadow-xl">
              <div className="p-4 md:p-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">{overlay.title || 'Sugestões de produtos'}</h3>
                  {overlay.query && (
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">para "{overlay.query}"</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={overlay.hide}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                {overlay.isLoading ? (
                  <div className="text-sm text-gray-600 dark:text-gray-300 p-4">Carregando sugestões...</div>
                ) : overlay.products.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-300 p-4">Nenhum produto encontrado.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {overlay.products.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/40 dark:border-gray-700/40">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem imagem</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{p.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">R$ {p.price.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => router.push(`/products/${p.id}`)}>
                            Detalhes
                          </Button>
                          <Button size="sm" onClick={() => handleAddToCart(p)}>
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4">
                <Button variant="outline" className="w-full" onClick={overlay.hide}>Fechar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12 slide-up">
          <div className="flex flex-col gap-4 items-center justify-between mb-8">
            <div className="flex-1 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Nossos Produtos
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Produtos de qualidade para sua saúde e bem-estar
              </p>
            </div>
            
            <Button
              onClick={() => setIsCartOpen(true)}
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4" />
              Carrinho ({getItemCount()})
              {getItemCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getItemCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Cart Summary */}
        {getItemCount() > 0 && (
          <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 transition-colors duration-300 scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-100 transition-colors duration-300">
                  {getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'} no carrinho
                </span>
              </div>
              <div className="text-green-800 dark:text-green-100 font-bold transition-colors duration-300">
                Total: R$ {total.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 slide-up">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 transition-colors duration-300" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-gray-700/40 text-gray-900 dark:text-white transition-colors duration-300"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-gray-700/40 text-gray-900 dark:text-white transition-colors duration-300">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/40 dark:border-gray-700/40">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-white/40 dark:border-gray-700/40 text-gray-900 dark:text-white transition-colors duration-300">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-white/40 dark:border-gray-700/40">
                <SelectItem value="name">Nome A-Z</SelectItem>
                <SelectItem value="price-low">Menor Preço</SelectItem>
                <SelectItem value="price-high">Maior Preço</SelectItem>
                <SelectItem value="rating">Melhor Avaliação</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyInStock}
                onChange={(e) => setShowOnlyInStock(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 transition-colors duration-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">Apenas em estoque</span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Mostrando {filteredAndSortedProducts.length} de {products.length} produtos
          </p>
        </div>

        {/* Former floating suggestions panel removed in favor of full-width section above */}

        {/* Produtos organizados por categoria */}
        {selectedCategory === 'Todos' ? (
          <div className="space-y-8">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {categoryProducts.map((product) => {
                    const cartQuantity = getItemQuantity(product.id);
                    
                    return (
                      <Card key={product.id} className="h-full flex flex-col hover:shadow-2xl transition-shadow bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/40 dark:border-gray-700/40">
                        <CardHeader>
                          <div onClick={() => router.push(`/products/${product.id}`)} className="relative w-full h-48 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span>Sem imagem</span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <CardTitle className="text-lg leading-tight cursor-pointer hover:underline" onClick={() => router.push(`/products/${product.id}`)}>{product.name}</CardTitle>
                              <Badge variant="outline" className="text-xs mt-1">
                                {product.category}
                              </Badge>
                            </div>
                            {product.prescription && (
                              <Badge variant="destructive" className="text-xs">
                                Receita
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 flex flex-col">
                          <div className="mb-3">
                            <button className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline" onClick={() => toggleExpanded(product.id)}>
                              {expanded[product.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              {expanded[product.id] ? 'Esconder descrição' : 'Ver descrição'}
                            </button>
                            {expanded[product.id] && (
                              <CardDescription className="mt-2 text-sm">
                                {product.description}
                              </CardDescription>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-green-600">
                                R$ {product.price.toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${
                                product.stock > 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {product.stock > 0 ? `Em estoque (${product.stock})` : "Fora de estoque"}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => router.push(`/products/${product.id}`)}>
                                <Info className="h-4 w-4 mr-1" /> Detalhes
                              </Button>
                            </div>
                            
                            {product.stock > 0 ? (
                              cartQuantity > 0 ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{cartQuantity} no carrinho</span>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    R$ {(product.price * cartQuantity).toFixed(2)}
                                  </span>
                                </div>
                              ) : null
                            ) : null}
                            
                            <Button
                              size="sm"
                              onClick={(e) => handleAddToCart(product, e)}
                              disabled={product.stock <= 0 || isItemLoading(product.id)}
                              className="w-full"
                            >
                              {isItemLoading(product.id) ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <ShoppingCart className="h-4 w-4 mr-2" />
                              )}
                              {isItemLoading(product.id) ? 'Adicionando...' : 
                               product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAndSortedProducts.map((product) => {
              const cartQuantity = getItemQuantity(product.id);
              
              return (
                <Card key={product.id} className="h-full flex flex-col hover:shadow-2xl transition-shadow bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/40 dark:border-gray-700/40">
                  <CardHeader>
                    <div onClick={() => router.push(`/products/${product.id}`)} className="relative w-full h-48 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span>Sem imagem</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight cursor-pointer hover:underline" onClick={() => router.push(`/products/${product.id}`)}>{product.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {product.category}
                        </Badge>
                      </div>
                      {product.prescription && (
                        <Badge variant="destructive" className="text-xs">
                          Receita
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-3">
                      <button className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline" onClick={() => toggleExpanded(product.id)}>
                        {expanded[product.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {expanded[product.id] ? 'Esconder descrição' : 'Ver descrição'}
                      </button>
                      {expanded[product.id] && (
                        <CardDescription className="mt-2 text-sm">
                          {product.description}
                        </CardDescription>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {product.stock > 0 ? `Em estoque (${product.stock})` : "Fora de estoque"}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/products/${product.id}`)}>
                          <Info className="h-4 w-4 mr-1" /> Detalhes
                        </Button>
                      </div>
                      
                      {product.stock > 0 ? (
                        cartQuantity > 0 ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{cartQuantity} no carrinho</span>
                            </div>
                            <span className="text-sm text-gray-600">
                              R$ {(product.price * cartQuantity).toFixed(2)}
                            </span>
                          </div>
                        ) : null
                      ) : null}
                      
                      <Button
                        size="sm"
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock <= 0 || isItemLoading(product.id)}
                        className="w-full"
                      >
                        {isItemLoading(product.id) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        {isItemLoading(product.id) ? 'Adicionando...' : 
                         product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12 fade-in">
            <p className="text-gray-500 dark:text-gray-400 text-lg transition-colors duration-300">Nenhum produto encontrado com os filtros selecionados.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todos");
                setShowOnlyInStock(false);
              }}
              className="mt-4"
            >
              Limpar Filtros
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-100 mb-2 transition-colors duration-300">
            Aviso Importante
          </h3>
          <p className="text-yellow-700 dark:text-yellow-200 transition-colors duration-300">
            Este é um site de demonstração. Todos os produtos e preços mostrados são apenas 
            para fins demonstrativos. Consulte sempre um profissional de saúde antes de tomar 
            qualquer medicamento. Para prescrições reais e orientação médica, visite uma farmácia licenciada.
          </p>
        </div>
      </div>
      
      {/* Cart Component */}
      <Cart 
        products={products} 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
}