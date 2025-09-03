// Re-exportar tipos centralizados
export type {
  CartItem,
  CartData,
  Product,
  Category,
  DiscountCode,
  ShippingInfo,
  PaymentMethod,
  Order,
  User,
  StoreInfo,
  Promotion,
  ToolResult,
  NavigationResult,
  SearchResult,
  BudgetOptimization,
  AgentMessage,
  AgentSession,
  ApiResponse,
  DatabaseProduct,
  Nullable,
  Optional,
} from '@/lib/types';

export {
  databaseProductToProduct,
  productToCartItem,
} from '@/lib/types';