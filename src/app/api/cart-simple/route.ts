import { NextRequest, NextResponse } from 'next/server';
import { 
  getOrCreateSimpleCart, 
  addToSimpleCart, 
  removeFromSimpleCart, 
  updateSimpleCartQuantity, 
  clearSimpleCart 
} from '@/lib/cart-storage-simple';

// GET - Get cart for session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const cart = await getOrCreateSimpleCart(sessionId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error getting cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, productId, quantity = 1 } = body;

    if (!sessionId || !productId) {
      return NextResponse.json(
        { error: 'Session ID and Product ID are required' },
        { status: 400 }
      );
    }

    const cart = await addToSimpleCart(sessionId, productId, quantity);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, productId, quantity } = body;

    if (!sessionId || !productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Session ID, Product ID, and quantity are required' },
        { status: 400 }
      );
    }

    const cart = await updateSimpleCartQuantity(sessionId, productId, quantity);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, productId, clearAll } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (clearAll) {
      const cart = await clearSimpleCart(sessionId);
      return NextResponse.json({ success: true, cart });
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const cart = await removeFromSimpleCart(sessionId, productId);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}