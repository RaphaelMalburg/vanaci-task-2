import { tool } from "ai";
import { z } from "zod";
import { getGlobalContext } from "../context";
import type { ToolResult } from "../types";
import { logger } from "@/lib/logger";
import { getUserFromLocalStorage, getTokenFromLocalStorage, generateJWTToken } from "@/lib/auth-utils";

// Helper function to get user from context or localStorage
function getUser(): { id: string; username: string } | null {
  const contextUser = getGlobalContext("user");
  if (contextUser) {
    return contextUser;
  }

  // Fallback to localStorage if not in context
  const fallbackUser = getUserFromLocalStorage();
  if (fallbackUser) {
    return fallbackUser;
  }

  return null;
}

// Helper function for API calls with authentication
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_APP_URL || "https://farmacia-vanaci.vercel.app" : "http://localhost:3007";

  // Get user token for authentication
  const user = getUser();
  if (!user) {
    throw new Error("User must be logged in to use cart");
  }

  // Try to get JWT token from localStorage first
  let token = getTokenFromLocalStorage();

  // If no token in localStorage, generate a new JWT
  if (!token) {
    console.log("🔑 [Cart Tool Simple] Generating new JWT token for user:", user.username);
    token = generateJWTToken(user);
  }

  const response = await fetch(`${baseUrl}/api${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ [Cart Tool Simple] API Error:", response.status, errorText);
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: response.statusText };
    }
    throw new Error(error.error || response.statusText);
  }

  return response.json();
}

// Helper function to find product by name or ID (same as in cart.ts)
async function findProductByNameOrId(productIdentifier: string): Promise<{ id: string; name: string } | null> {
  try {
    // First try to find by exact ID
    const productByIdResult = await apiCall(`/products?q=${encodeURIComponent(productIdentifier)}`, {
      method: "GET",
    });
    
    if (productByIdResult && Array.isArray(productByIdResult)) {
      // Check if any product has the exact ID
      const exactIdMatch = productByIdResult.find((p: any) => p.id === productIdentifier);
      if (exactIdMatch) {
        return { id: exactIdMatch.id, name: exactIdMatch.name };
      }
      
      // If no exact ID match, search by name (case insensitive)
      const nameMatch = productByIdResult.find((p: any) => 
        p.name.toLowerCase().includes(productIdentifier.toLowerCase()) ||
        productIdentifier.toLowerCase().includes(p.name.toLowerCase())
      );
      
      if (nameMatch) {
        return { id: nameMatch.id, name: nameMatch.name };
      }
    }
    
    return null;
  } catch (error) {
    logger.error("Error finding product", { error, productIdentifier });
    return null;
  }
}

// Tool: Add product to cart (simplified)
export const addToCartSimpleTool = tool({
  description: "Adds a product to the shopping cart with validation. Can use product ID or product name.",
  inputSchema: z.object({
    productId: z.string().describe("ID or name of the product to add (e.g., 'cmfb675a10002vb7gsu4jeaf8' or 'Aspirina Express')"),
    quantity: z.number().min(1).default(1).describe("Quantity to add"),
  }),
  execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
    try {
      const user = getUser();
      if (!user) {
        return {
          success: false,
          message: "You must be logged in to add products to cart.",
          data: null,
        } as ToolResult;
      }

      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        return {
          success: false,
          message: `Product not found: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;

      logger.info("Adding product to cart via simple API", { productId: actualProductId, quantity, userId: user.id });

      const result = await apiCall("/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: actualProductId,
          quantity,
        }),
      });

      return {
        success: true,
        message: `Successfully added ${quantity} of ${productName} to cart`,
        data: result.cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Error adding to cart", { error, productId, quantity });
      return {
        success: false,
        message: `Failed to add product to cart: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Remove product from cart (simplified)
export const removeFromCartSimpleTool = tool({
  description: "Removes a product from the shopping cart. Can use product ID or product name.",
  inputSchema: z.object({
    productId: z.string().describe("ID or name of the product to remove (e.g., 'cmfb675a10002vb7gsu4jeaf8' or 'Aspirina Express')"),
  }),
  execute: async ({ productId }: { productId: string }) => {
    try {
      const user = getUser();
      if (!user) {
        return {
          success: false,
          message: "You must be logged in to remove products from cart.",
          data: null,
        } as ToolResult;
      }

      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        return {
          success: false,
          message: `Product not found: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;

      logger.info("Removing product from cart via simple API", { productId: actualProductId, userId: user.id });

      const result = await apiCall("/cart", {
        method: "DELETE",
        body: JSON.stringify({
          productId: actualProductId,
        }),
      });

      return {
        success: true,
        message: `Successfully removed ${productName} from cart`,
        data: result.cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Error removing from cart", { error, productId });
      return {
        success: false,
        message: `Failed to remove product from cart: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Update product quantity in cart (simplified)
export const updateCartQuantitySimpleTool = tool({
  description: "Updates the quantity of a product in the shopping cart. Can use product ID or product name.",
  inputSchema: z.object({
    productId: z.string().describe("ID or name of the product to update (e.g., 'cmfb675a10002vb7gsu4jeaf8' or 'Aspirina Express')"),
    quantity: z.number().min(0).describe("New quantity (0 to remove)"),
  }),
  execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
    try {
      const user = getUser();
      if (!user) {
        return {
          success: false,
          message: "You must be logged in to update cart.",
          data: null,
        } as ToolResult;
      }

      // Find the actual product ID if a name was provided
      const product = await findProductByNameOrId(productId);
      if (!product) {
        return {
          success: false,
          message: `Product not found: ${productId}`,
          data: null,
        } as ToolResult;
      }

      const actualProductId = product.id;
      const productName = product.name;

      logger.info("Updating cart quantity via simple API", { productId: actualProductId, quantity, userId: user.id });

      const result = await apiCall("/cart", {
        method: "PUT",
        body: JSON.stringify({
          productId: actualProductId,
          quantity,
        }),
      });

      const message = quantity === 0 ? `Successfully removed ${productName} from cart` : `Successfully updated quantity to ${quantity} for ${productName}`;

      return {
        success: true,
        message,
        data: result.cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Error updating cart quantity", { error, productId, quantity });
      return {
        success: false,
        message: `Failed to update quantity: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: View cart contents (simplified)
export const viewCartSimpleTool = tool({
  description: "Views the current contents of the shopping cart",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const user = getUser();
      if (!user) {
        return {
          success: false,
          message: "You must be logged in to view cart.",
          data: null,
        } as ToolResult;
      }

      logger.info("Viewing cart via simple API", { userId: user.id });

      const result = await apiCall("/cart", {
        method: "GET",
      });

      const cart = result.cart || result;
      const itemCount = cart.items?.length || 0;
      const total = cart.total || 0;

      let message = "Cart is empty.";
      if (itemCount > 0) {
        const itemsText = cart.items.map((item: any) => `${item.name} (${item.quantity}x - €${(item.price * item.quantity).toFixed(2)})`).join(", ");
        message = `Cart contains: ${itemsText}. Total: €${total.toFixed(2)}`;
      }

      return {
        success: true,
        message,
        data: cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Error viewing cart", { error });
      return {
        success: false,
        message: `Failed to view cart: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      } as ToolResult;
    }
  },
});

// Tool: Clear entire cart (simplified)
export const clearCartSimpleTool = tool({
  description: "Removes all products from the shopping cart",
  inputSchema: z.object({}),
  execute: async (): Promise<ToolResult> => {
    try {
      const user = getUser();
      if (!user) {
        return {
          success: false,
          message: "You must be logged in to clear cart.",
          data: null,
        } as ToolResult;
      }

      logger.info("Clearing cart via simple API", { userId: user.id });

      const result = await apiCall("/cart", {
        method: "DELETE",
        body: JSON.stringify({
          clearAll: true,
        }),
      });

      return {
        success: true,
        message: "Cart cleared successfully",
        data: result.cart,
      } as ToolResult;
    } catch (error) {
      logger.error("Error clearing cart", { error });
      return {
        success: false,
        message: `Failed to clear cart: ${error instanceof Error ? error.message : "Unknown error"}`,
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
