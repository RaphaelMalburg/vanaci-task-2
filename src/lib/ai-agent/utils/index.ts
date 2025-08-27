import type { CartItem, Product, ToolResult } from '../types';

// Utilitários para formatação de preços
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

// Utilitários para formatação de datas
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Utilitários para validação de CEP
export const validateZipCode = (zipCode: string): boolean => {
  const cleanZip = zipCode.replace(/\D/g, '');
  return cleanZip.length === 8;
};

// Utilitários para formatação de CEP
export const formatZipCode = (zipCode: string): string => {
  const cleanZip = zipCode.replace(/\D/g, '');
  if (cleanZip.length === 8) {
    return `${cleanZip.slice(0, 5)}-${cleanZip.slice(5)}`;
  }
  return zipCode;
};

// Utilitários para validação de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Utilitários para validação de telefone
export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

// Utilitários para formatação de telefone
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  } else if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }
  return phone;
};

// Utilitários para cálculo de totais do carrinho
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Utilitários para cálculo de desconto
export const calculateDiscount = (total: number, discountPercent: number): number => {
  return total * (discountPercent / 100);
};

// Utilitários para cálculo de frete (simulado)
export const calculateShipping = (zipCode: string, total: number): number => {
  if (!validateZipCode(zipCode)) {
    throw new Error('CEP inválido');
  }

  // Frete grátis para compras acima de R$ 100
  if (total >= 100) {
    return 0;
  }

  // Simulação de cálculo de frete baseado no CEP
  const cleanZip = zipCode.replace(/\D/g, '');
  const firstDigit = parseInt(cleanZip[0]);
  
  // Regiões com fretes diferentes
  const shippingRates = {
    0: 15.90, // SP
    1: 18.90, // SP interior
    2: 22.90, // RJ/ES
    3: 25.90, // MG
    4: 28.90, // BA/SE/AL
    5: 32.90, // PR/SC
    6: 35.90, // PE/PB/RN/CE
    7: 38.90, // DF/GO/TO/MT/MS
    8: 42.90, // AC/RO/AM/RR/AP
    9: 45.90, // MA/PI/PA
  };

  return shippingRates[firstDigit as keyof typeof shippingRates] || 25.90;
};

// Utilitários para geração de IDs únicos
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Utilitários para geração de session IDs
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${generateId()}`;
};

// Utilitários para sanitização de strings
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>"'&]/g, '');
};

// Utilitários para formatação de mensagens de erro
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ocorreu um erro inesperado';
};

// Utilitários para criação de respostas padronizadas
export const createSuccessResponse = (message: string, data?: any): ToolResult => {
  return {
    success: true,
    message,
    data,
  };
};

export const createErrorResponse = (message: string, error?: any): ToolResult => {
  return {
    success: false,
    message: error ? `${message}: ${formatErrorMessage(error)}` : message,
  };
};

// Utilitários para busca e filtragem de produtos
export const searchProducts = (products: Product[], query: string): Product[] => {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return products;
  }

  return products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm);
    const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
    const categoryMatch = product.category?.toLowerCase().includes(searchTerm);
    
    return nameMatch || descriptionMatch || categoryMatch;
  });
};

// Utilitários para recomendação de produtos baseada em sintomas
export const getProductRecommendations = (products: Product[], symptom: string): Product[] => {
  const symptomLower = symptom.toLowerCase().trim();
  
  // Mapeamento de sintomas para categorias/palavras-chave
  const symptomMapping: Record<string, string[]> = {
    'dor de cabeça': ['analgésico', 'dipirona', 'paracetamol', 'ibuprofeno'],
    'febre': ['antitérmico', 'paracetamol', 'dipirona', 'ibuprofeno'],
    'gripe': ['antigripal', 'descongestionante', 'vitamina c'],
    'resfriado': ['descongestionante', 'expectorante', 'vitamina c'],
    'tosse': ['xarope', 'expectorante', 'antitussígeno'],
    'dor muscular': ['anti-inflamatório', 'relaxante muscular', 'ibuprofeno'],
    'alergia': ['antialérgico', 'anti-histamínico', 'loratadina'],
    'azia': ['antiácido', 'omeprazol', 'ranitidina'],
    'diarreia': ['antidiarreico', 'probiótico', 'soro'],
    'constipação': ['laxante', 'fibra', 'lactulose'],
    'insônia': ['melatonina', 'relaxante', 'valeriana'],
    'ansiedade': ['ansiolítico', 'valeriana', 'passiflora'],
    'diabetes': ['glicosímetro', 'lanceta', 'insulina'],
    'hipertensão': ['monitor pressão', 'captopril', 'losartana'],
    'colesterol': ['sinvastatina', 'atorvastatina', 'omega 3'],
  };

  // Buscar palavras-chave relacionadas ao sintoma
  const keywords = symptomMapping[symptomLower] || [symptomLower];
  
  return products.filter(product => {
    return keywords.some(keyword => {
      const nameMatch = product.name.toLowerCase().includes(keyword);
      const descriptionMatch = product.description?.toLowerCase().includes(keyword);
      const categoryMatch = product.category?.toLowerCase().includes(keyword);
      
      return nameMatch || descriptionMatch || categoryMatch;
    });
  }).slice(0, 10); // Limitar a 10 recomendações
};

// Utilitários para otimização de orçamento
export const optimizeCartForBudget = (items: CartItem[], budget: number): CartItem[] => {
  // Ordenar itens por prioridade (preço unitário menor primeiro)
  const sortedItems = [...items].sort((a, b) => a.price - b.price);
  
  const optimizedItems: CartItem[] = [];
  let currentTotal = 0;
  
  for (const item of sortedItems) {
    const itemTotal = item.price * item.quantity;
    
    if (currentTotal + itemTotal <= budget) {
      // Item cabe no orçamento
      optimizedItems.push(item);
      currentTotal += itemTotal;
    } else {
      // Tentar adicionar quantidade reduzida
      const maxQuantity = Math.floor((budget - currentTotal) / item.price);
      if (maxQuantity > 0) {
        optimizedItems.push({
          ...item,
          quantity: maxQuantity,
        });
        currentTotal += item.price * maxQuantity;
      }
      break;
    }
  }
  
  return optimizedItems;
};

// Utilitários para validação de dados de pagamento
export const validateCreditCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  return cleanNumber.length >= 13 && cleanNumber.length <= 19;
};

export const validateCVV = (cvv: string): boolean => {
  const cleanCVV = cvv.replace(/\D/g, '');
  return cleanCVV.length >= 3 && cleanCVV.length <= 4;
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!regex.test(expiryDate)) {
    return false;
  }
  
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear) {
    return false;
  }
  
  if (expYear === currentYear && expMonth < currentMonth) {
    return false;
  }
  
  return true;
};

// Utilitários para logging e debug
export const logToolCall = (toolName: string, params: any, result: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AI Agent] Tool: ${toolName}`);
    console.log(`[AI Agent] Params:`, params);
    console.log(`[AI Agent] Result:`, result);
  }
};

// Utilitários para retry de operações
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};