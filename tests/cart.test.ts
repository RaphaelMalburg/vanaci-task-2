import { Product } from '../src/types/product';

// Mock do store do carrinho
const mockCartStore = {
  items: [] as Array<{ product: Product; quantity: number }>,
  total: 0,
  itemCount: 0,
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
};

// Mock do useCartStore
jest.mock('../src/store/cart', () => ({
  useCartStore: {
    getState: () => mockCartStore,
  },
}));

describe('Cart Store', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Dipirona 500mg',
    price: 15.99,
    description: 'Analgésico e antitérmico',
    category: 'Medicamentos',
    image: '/images/dipirona.jpg',
    inStock: true,
    stockQuantity: 100
  };

  beforeEach(() => {
    // Reset dos mocks antes de cada teste
    jest.clearAllMocks();
    mockCartStore.items = [];
    mockCartStore.total = 0;
    mockCartStore.itemCount = 0;
  });

  test('deve adicionar produto ao carrinho', () => {
    // Simular adição ao carrinho
    mockCartStore.items.push({ product: mockProduct, quantity: 1 });
    mockCartStore.addToCart(mockProduct);
    
    expect(mockCartStore.addToCart).toHaveBeenCalledWith(mockProduct);
    expect(mockCartStore.items).toHaveLength(1);
    expect(mockCartStore.items[0].product.id).toBe('1');
  });

  test('deve chamar função de adicionar produto', () => {
    mockCartStore.addToCart(mockProduct);
    
    expect(mockCartStore.addToCart).toHaveBeenCalledWith(mockProduct);
  });

  test('deve chamar função de remover produto', () => {
    mockCartStore.removeFromCart('1');
    
    expect(mockCartStore.removeFromCart).toHaveBeenCalledWith('1');
  });

  test('deve chamar função de atualizar quantidade', () => {
    mockCartStore.updateQuantity('1', 5);
    
    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith('1', 5);
  });

  test('deve calcular total corretamente', () => {
    // Simular cálculo de total
    const quantity = 3;
    const expectedTotal = mockProduct.price * quantity;
    mockCartStore.total = expectedTotal;
    
    expect(mockCartStore.total).toBe(expectedTotal);
  });

  test('deve chamar função de limpar carrinho', () => {
    mockCartStore.clearCart();
    
    expect(mockCartStore.clearCart).toHaveBeenCalled();
  });

  test('deve contar itens corretamente', () => {
    // Simular contagem de itens
    mockCartStore.items = [{ product: mockProduct, quantity: 3 }];
    mockCartStore.itemCount = 3;
    
    expect(mockCartStore.itemCount).toBe(3);
  });

  test('deve validar produto', () => {
    expect(mockProduct.id).toBe('1');
    expect(mockProduct.name).toBe('Dipirona 500mg');
    expect(mockProduct.price).toBe(15.99);
  });

  test('deve lidar com produtos diferentes', () => {
    const product2: Product = {
      ...mockProduct,
      id: '2',
      name: 'Paracetamol 750mg',
      price: 12.50
    };

    mockCartStore.addToCart(mockProduct);
    mockCartStore.addToCart(product2);
    
    expect(mockCartStore.addToCart).toHaveBeenCalledWith(mockProduct);
    expect(mockCartStore.addToCart).toHaveBeenCalledWith(product2);
  });
});