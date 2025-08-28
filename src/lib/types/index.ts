// Tipos centralizados para toda a aplicação

// Tipos base do banco de dados (Prisma)
export interface DatabaseProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  prescription: boolean;
  manufacturer: string | null;
  imagePath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para o AI Agent e frontend
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  symptoms?: string[];
  needs?: string[];
  prescription?: boolean;
  manufacturer?: string;
}

// Tipos do carrinho
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  imagePath?: string | null;
  category: string;
}

export interface CartData {
  sessionId?: string;
  items: CartItem[];
  total: number;
  itemCount?: number;
}

// Tipos para categorias
export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Tipos para desconto e promoções
export interface DiscountCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: Date;
}

// Tipos para envio
export interface ShippingInfo {
  zipCode: string;
  cost: number;
  estimatedDays: number;
}

// Tipos para pagamento
export interface PaymentMethod {
  type: 'credit' | 'debit' | 'pix' | 'boleto';
  details?: Record<string, unknown>;
}

// Tipos para pedidos
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingCost: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: Date;
}

// Tipos para usuário
export interface User {
  id: string;
  username: string;
  email: string;
  orders?: Order[];
}

// Tipos para informações da loja
export interface StoreInfo {
  hours: string;
  phone: string;
  address: string;
}

// Tipos para resultados de ferramentas
export interface ToolResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface NavigationResult extends ToolResult {
  redirectUrl?: string;
}

export interface SearchResult {
  products: Product[];
  total: number;
  query: string;
}

export interface BudgetOptimization {
  originalTotal: number;
  optimizedTotal: number;
  removedItems: CartItem[];
  suggestions: Product[];
}

// Tipos para mensagens do agente
export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: unknown[];
}

export interface AgentSession {
  id: string;
  messages: AgentMessage[];
  context: {
    cartId?: string;
    userId?: string;
    currentPage?: string;
  };
}

// Tipos para API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Utilitários de tipo
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Função utilitária para converter DatabaseProduct para Product
export function databaseProductToProduct(dbProduct: DatabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    category: dbProduct.category,
    stock: dbProduct.stock,
    image: dbProduct.imagePath || undefined,
    prescription: dbProduct.prescription,
    manufacturer: dbProduct.manufacturer || undefined,
  };
}

// Função utilitária para converter Product para CartItem
export function productToCartItem(product: Product, quantity: number = 1): CartItem {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity,
    image: product.image,
    imagePath: product.image,
    category: product.category,
  };
}