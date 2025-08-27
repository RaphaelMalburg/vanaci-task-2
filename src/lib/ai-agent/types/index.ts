// Tipos para as tools do agente AI

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartData {
  items: CartItem[];
  total: number;
  itemCount: number;
}

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
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface DiscountCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

export interface ShippingInfo {
  zipCode: string;
  cost: number;
  estimatedDays: number;
}

export interface PaymentMethod {
  type: 'credit' | 'debit' | 'pix' | 'boleto';
  details?: any;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingCost: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  orders?: Order[];
}

export interface StoreInfo {
  hours: string;
  phone: string;
  address: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: Date;
}

// Tipos para as tools
export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
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

// LLMConfig movido para config/index.ts para evitar conflitos

// Tipos para o agente
export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: any[];
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