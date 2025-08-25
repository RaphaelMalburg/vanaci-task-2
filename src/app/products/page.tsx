"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreadcrumbsContainer } from "@/components/breadcrumbs";
import { ShoppingCart, Search, Filter, Plus, Minus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  isPromotion?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    description: "Analgésico e antitérmico para alívio da dor e febre",
    price: 8.90,
    category: "Analgésicos",
    inStock: true,
    rating: 4.8,
    reviews: 245
  },
  {
    id: 2,
    name: "Ibuprofeno 400mg",
    description: "Anti-inflamatório para dores e inflamações",
    price: 12.50,
    category: "Anti-inflamatórios",
    inStock: true,
    rating: 4.6,
    reviews: 189
  },
  {
    id: 3,
    name: "Vitamina D3 1000 UI",
    description: "Vitamina essencial para saúde óssea e imunidade",
    price: 15.99,
    originalPrice: 19.99,
    category: "Vitaminas",
    inStock: true,
    rating: 4.9,
    reviews: 312,
    isPromotion: true
  },
  {
    id: 4,
    name: "Ômega-3 1000mg",
    description: "Suplemento para saúde cardiovascular e cerebral",
    price: 24.99,
    category: "Suplementos",
    inStock: false,
    rating: 4.7,
    reviews: 156
  },
  {
    id: 5,
    name: "Xarope para Tosse",
    description: "Alívio para tosse seca e produtiva",
    price: 9.75,
    category: "Gripe e Resfriado",
    inStock: true,
    rating: 4.4,
    reviews: 98
  },
  {
    id: 6,
    name: "Complexo Multivitamínico",
    description: "Suplemento vitamínico completo para uso diário",
    price: 18.99,
    category: "Vitaminas",
    inStock: true,
    rating: 4.5,
    reviews: 203
  },
  {
    id: 7,
    name: "Antiácido Mastigável",
    description: "Alívio rápido para azia e má digestão",
    price: 6.50,
    originalPrice: 8.50,
    category: "Digestivos",
    inStock: true,
    rating: 4.3,
    reviews: 87,
    isPromotion: true
  },
  {
    id: 8,
    name: "Antialérgico 24h",
    description: "Antialérgico de longa duração sem sonolência",
    price: 14.25,
    category: "Antialérgicos",
    inStock: true,
    rating: 4.6,
    reviews: 134
  },
  {
    id: 9,
    name: "Probióticos",
    description: "Suporte para sistema digestivo e imunológico",
    price: 29.99,
    category: "Digestivos",
    inStock: false,
    rating: 4.8,
    reviews: 167
  },
  {
    id: 10,
    name: "Vitamina C 1000mg",
    description: "Vitamina C efervescente para imunidade",
    price: 13.90,
    category: "Vitaminas",
    inStock: true,
    rating: 4.7,
    reviews: 278
  },
  {
    id: 11,
    name: "Dipirona 500mg",
    description: "Analgésico e antitérmico de ação rápida",
    price: 6.75,
    category: "Analgésicos",
    inStock: true,
    rating: 4.5,
    reviews: 198
  },
  {
    id: 12,
    name: "Protetor Solar FPS 60",
    description: "Proteção solar avançada para pele sensível",
    price: 32.90,
    originalPrice: 39.90,
    category: "Dermatológicos",
    inStock: true,
    rating: 4.9,
    reviews: 89,
    isPromotion: true
  }
];

const categories = ["Todos", "Analgésicos", "Anti-inflamatórios", "Vitaminas", "Suplementos", "Gripe e Resfriado", "Digestivos", "Antialérgicos", "Dermatológicos"];

type SortOption = "name" | "price-low" | "price-high" | "rating";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [cart, setCart] = useState<{[key: number]: number}>({});

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
      const matchesStock = !showOnlyInStock || product.inStock;
      
      return matchesSearch && matchesCategory && matchesStock;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, showOnlyInStock]);

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return sum + (product ? product.price * quantity : 0);
    }, 0);
  };

  const renderStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12">
      <BreadcrumbsContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-in">
        {/* Header */}
        <div className="text-center mb-12 slide-up">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Nossos Produtos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Produtos de qualidade para sua saúde e bem-estar
          </p>
        </div>

        {/* Cart Summary */}
        {getTotalItems() > 0 && (
          <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 transition-colors duration-300 scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-100 transition-colors duration-300">
                  {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
                </span>
              </div>
              <div className="text-green-800 dark:text-green-100 font-bold transition-colors duration-300">
                Total: R$ {getTotalPrice().toFixed(2)}
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

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => {
            const cartQuantity = cart[product.id] || 0;
            
            return (
              <Card key={product.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {product.category}
                      </Badge>
                    </div>
                    {product.isPromotion && (
                      <Badge variant="destructive" className="text-xs">
                        Promoção
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">{renderStars(product.rating)}</span>
                    <span className="text-gray-500">({product.reviews})</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <CardDescription className="mb-4 flex-1 text-sm">
                    {product.description}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          R$ {product.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-green-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        product.inStock ? "text-green-600" : "text-red-600"
                      }`}>
                        {product.inStock ? "Em estoque" : "Fora de estoque"}
                      </span>
                    </div>
                    
                    {product.inStock ? (
                      cartQuantity > 0 ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(product.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium">{cartQuantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(product.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className="text-sm text-gray-600">
                            R$ {(product.price * cartQuantity).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToCart(product.id)}
                          className="w-full"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      )
                    ) : (
                      <Button size="sm" disabled className="w-full">
                        Indisponível
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
    </div>
  );
}