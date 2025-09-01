
import { tool } from 'ai';
import { z } from 'zod';
import { getGlobalContext } from '../context';
import type { ToolResult } from '../types';
import { logger } from '@/lib/logger';

// Helper function to get session ID from context
function getSessionId(): string {
  const contextSessionId = getGlobalContext('sessionId');
  if (contextSessionId) {
    return contextSessionId;
  }
  
  // Fallback to a default session ID if not in context
  return 'default-session';
}

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_APP_URL || 'https://farmacia-vanaci.vercel.app'
    : 'http://localhost:3007';
  
  const response = await fetch(`${baseUrl}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || response.statusText);
  }
  
  return response.json();
}

// Tool: Add product to cart (simplified)
export const addToCartSimpleTool = tool({
  description: 'Adds a product to the shopping cart with validation',
  inputSchema: z.object({
    productId: z.string().describe('ID of the product to add'),
    quantity: z.number().min(1).default(1).describe('Quantity to add'),
  }),
  execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
    try {
      const sessionId = getSessionId();
      logger.info('Adding product to cart via simple API', { productId, quantity, sessionId });
      
      const result = await apiCall('/cart-simple', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          productId,
          quantity
        })
      });
      
      return {
        success: true,
        message: `Successfully added ${quantity} of product ${productId} to cart`,
        data: result.cart,
      } as ToolResult;
    } catch (error) {
      logger.error('Error adding to cart', { error, productId, quantity });
      return {
        success: false,
        message: `Failed to add product to cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Remove product from cart (simplified)
export const removeFromCartSimpleTool = tool({
  description: 'Removes a product from the shopping cart',
  inputSchema: z.object({
    productId: z.string().describe('ID of the product to remove'),
  }),
  execute: async ({ productId }: { productId: string }) => {
    try {
      const sessionId = getSessionId();
      logger.info('Removing product from cart via simple API', { productId, sessionId });
      
      const result = await apiCall('/cart-simple', {
        method: 'DELETE',
        body: JSON.stringify({
          sessionId,
          productId
        })
      });
      
      return {
        success: true,
        message: `Successfully removed product ${productId} from cart`,
        data: result.cart,
      } as ToolResult;
    } catch (error) {
      logger.error('Error removing from cart', { error, productId });
      return {
        success: false,
        message: `Failed to remove product from cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Update product quantity in cart (simplified)
export const updateCartQuantitySimpleTool = tool({
  description: 'Updates the quantity of a product in the shopping cart',
  inputSchema: z.object({
    productId: z.string().describe('ID of the product to update'),
    quantity: z.number().min(0).describe('New quantity (0 to remove)'),
  }),
  execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
    try {
      const sessionId = getSessionId();
      logger.info('Updating cart quantity via simple API', { productId, quantity, sessionId });
      
      const result = await apiCall('/cart-simple', {
        method: 'PUT',
        body: JSON.stringify({
          sessionId,
          productId,
          quantity
        })
      });
      
      const message = quantity === 0
        ? `Successfully removed product ${productId} from cart`
        : `Successfully updated quantity to ${quantity} for product ${productId}`;
      
      return {
        success: true,
        message,
        data: result.cart,
      } as ToolResult;
    } catch (error) {
      logger.error('Error updating cart quantity', { error, productId, quantity });
      return {
        success: false,
        message: `Failed to update quantity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: View cart contents (simplified)
export const viewCartSimpleTool = tool({
  description: 'Views the current contents of the shopping cart',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const sessionId = getSessionId();
      logger.info('Viewing cart via simple API', { sessionId });
      
      const cart = await apiCall(`/cart-simple?sessionId=${sessionId}`, {
        method: 'GET'
      });
      
      const itemCount = cart.items?.length || 0;
      const total = cart.total || 0;
      
      let message = 'Cart is empty.';
      if (itemCount > 0) {
        const itemsText = cart.items.map((item: any) =>
          `${item.name} (${item.quantity}x - €${(item.price * item.quantity).toFixed(2)})`
        ).join(', ');
        message = `Cart contains: ${itemsText}. Total: €${total.toFixed(2)}`;
      }
      
      return {
        success: true,
        message,
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error('Error viewing cart', { error });
      return {
        success: false,
        message: `Failed to view cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Clear entire cart (simplified)
export const clearCartSimpleTool = tool({
  description: 'Removes all products from the shopping cart',
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const sessionId = getSessionId();
      logger.info('Clearing cart via simple API', { sessionId });
      
      const result = await apiCall('/cart-simple', {
        method: 'DELETE',
        body: JSON.stringify({
          sessionId,
          clearAll: true
        })
      });
      
      return {
        success: true,
        message: 'Cart cleared successfully',
        data: result.cart,
      } as ToolResult;
    } catch (error) {
      logger.error('Error clearing cart', { error });
      return {
        success: false,
        message: `Failed to clear cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Export all simple cart tools
export const cartSimpleTools = {
  add_to_cart_simple: addToCartSimpleTool,
  remove_from_cart_simple: removeFromCartSimpleTool,
  update_cart_quantity_simple: updateCartQuantitySimpleTool,
  view_cart_simple: viewCartSimpleTool,
  clear_cart_simple: clearCartSimpleTool,
};