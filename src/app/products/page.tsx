"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreadcrumbsContainer } from "@/components/breadcrumbs";
import { ShoppingCart, Search, Filter, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { Cart } from "@/components/Cart";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  prescription: boolean;
  manufacturer: string | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

// Produtos serão carregados do banco de dados

type SortOption = "name" | "price-low" | "price-high" | "category";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, getItemQuantity, getItemCount, items, total } = useCartStore();

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

  const filteredAndSortedProducts = useMemo(() => {
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

  const handleAddToCart = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (product.stock <= 0) {
      toast.error('Produto fora de estoque');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imagePath: product.imagePath || undefined,
      category: product.category
    });

    toast.success(`${product.name} adicionado ao carrinho!`);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12">
      <BreadcrumbsContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
        {/* Header */}
        <div className="text-center mb-12 slide-up">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Nossos Produtos
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Produtos de qualidade para sua saúde e bem-estar
              </p>
            </div>
            
            <Button
              onClick={() => setIsCartOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
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
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
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

        {/* Produtos organizados por categoria */}
        {selectedCategory === 'Todos' ? (
          <div className="space-y-8">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">{category}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryProducts.map((product) => {
                    const cartQuantity = getItemQuantity(product.id);
                    
                    return (
                      <Card key={product.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="relative w-full h-48 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {product.imagePath ? (
                              <Image
                                src={product.imagePath}
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
                              <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
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
                          <CardDescription className="mb-4 flex-1 text-sm">
                            {product.description}
                          </CardDescription>
                          
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
                              disabled={product.stock <= 0}
                              className="w-full"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => {
              const cartQuantity = getItemQuantity(product.id);
              
              return (
                <Card key={product.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="relative w-full h-48 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {product.imagePath ? (
                        <Image
                          src={product.imagePath}
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
                        <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
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
                    <CardDescription className="mb-4 flex-1 text-sm">
                      {product.description}
                    </CardDescription>
                    
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
                        disabled={product.stock <= 0}
                        className="w-full"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
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