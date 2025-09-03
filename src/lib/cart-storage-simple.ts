
/**
 * Simplified Cart Storage - Error-proof cart system using only Prisma
 * This eliminates Redis complexity and provides a single source of truth
 */

import { prisma } from '@/lib/prisma';

export interface SimpleCartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  imagePath?: string;
  quantity: number;
}

export interface SimpleCartData {
  items: SimpleCartItem[];
  total: number;
  itemCount: number;
}

/**
 * Get or create a cart for a session
 */
export async function getOrCreateSimpleCart(sessionId: string): Promise<SimpleCartData> {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  try {
    // For now, return empty cart since we're transitioning to user-based carts
    // This function will be updated when user authentication is implemented
    return {
      items: [],
      total: 0,
      itemCount: 0
    };
  } catch (error) {
    console.error('Error getting/creating cart:', error);
    // Return empty cart as fallback
    return {
      items: [],
      total: 0,
      itemCount: 0
    };
  }
}

/**
 * Add item to cart with validation
 */
export async function addToSimpleCart(sessionId: string, productId: string, quantity: number = 1): Promise<SimpleCartData> {
  if (!sessionId || !productId) {
    throw new Error('Session ID and Product ID are required');
  }

  try {
    // For now, return empty cart since we're transitioning to user-based carts
    // This function will be updated when user authentication is implemented
    return {
      items: [],
      total: 0,
      itemCount: 0
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromSimpleCart(sessionId: string, productId: string): Promise<SimpleCartData> {
  if (!sessionId || !productId) {
    throw new Error('Session ID and Product ID are required');
  }

  try {
    // For now, return empty cart since we're transitioning to user-based carts
    // This function will be updated when user authentication is implemented
    return {
      items: [],
      total: 0,
      itemCount: 0
    };
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Update item quantity in cart
 */
export async function updateSimpleCartQuantity(sessionId: string, productId: string, quantity: number): Promise<SimpleCartData> {
  if (!sessionId || !productId || quantity < 0) {
    throw new Error('Session ID, Product ID, and valid quantity are required');
  }

  try {
    // For now, return empty cart since we're transitioning to user-based carts
    // This function will be updated when user authentication is implemented
    return {
      items: [],
      total: 0,
      itemCount: 0
    };
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearSimpleCart(sessionId: string): Promise<SimpleCartData> {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }

  try {
    // For now, return empty cart since we're transitioning to user-based carts
    // This function will be updated when user authentication is implemented
    return {
      items: [],
      total: 0,
      itemCount: 0
    };
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// saveSimpleCart function removed - will be replaced with user-based cart functions