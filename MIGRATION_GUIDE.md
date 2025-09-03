# Migration Guide: Simplified Cart System

## Overview
This guide helps you migrate from the complex cart system to the new simplified, error-proof system that uses only Prisma for persistence.

## Key Changes

### 1. Storage System
- **Old**: Redis + Prisma + In-memory storage
- **New**: Only Prisma (single source of truth)

### 2. API Endpoints
- **Old**: `/api/cart` (complex with sync issues)
- **New**: `/api/cart-simple` (straightforward, reliable)

### 3. Agent Tools
- **Old**: Complex tools with optimistic updates and rollbacks
- **New**: Simple tools with direct database operations

## Migration Steps

### Step 1: Update Agent Configuration
Replace the old cart tools with the new simple ones in your agent configuration:

```typescript
// In your agent setup, replace:
import { cartTools } from '@/lib/ai-agent/actions/cart';

// With:
import { cartSimpleTools } from '@/lib/ai-agent/actions/cart-simple';
```

### Step 2: Update Frontend Components
Replace the old cart hooks with the new simple ones:

```typescript
// Replace:
import { useCartService } from '@/lib/services/cart.service';

// With:
import { useSimpleCart } from '@/hooks/useSimpleCart';
```

### Step 3: Update API Calls
Update any direct API calls to use the new endpoints:

```typescript
// Replace:
fetch('/api/cart', { method: 'POST', ... })

// With:
fetch('/api/cart-simple', { method: 'POST', ... })
```

## Testing the New System

### Quick Test
```bash
# Start the development server
npm run dev

# In another terminal, run the test script
node test-simple-cart.js
```

### Manual Testing
1. Open the application in your browser
2. Try adding products to cart
3. Verify quantities update correctly
4. Test removing items
5. Test clearing the cart

## Rollback Plan
If you need to revert to the old system:

1. Keep the old files (they're not deleted)
2. Update agent configuration to use old tools
3. Update frontend components to use old hooks
4. The old system remains functional

## Benefits of the New System

### ✅ Error-Proof
- No race conditions
- No sync issues
- Single source of truth
- Clear error messages

### ✅ Simplified
- No Redis dependency
- No complex optimistic updates
- No rollback mechanisms
- Straightforward code flow

### ✅ Reliable
- Database transactions
- Stock validation
- Consistent state
- Better error handling

## Troubleshooting

### Common Issues

1. **"Session ID is required" error**
   - Ensure sessionId is always provided
   - Check sessionManager configuration

2. **"Product not found" error**
   - Verify product exists in database
   - Check product ID format

3. **"Insufficient stock" error**
   - Check product stock levels
   - Verify quantity requested

### Debug Mode
Enable debug logging by setting:
```javascript
// In your browser console
localStorage.setItem('debug-cart', 'true');
```

## Files Created

### New Files
- `src/lib/cart-storage-simple.ts` - Core cart logic
- `src/app/api/cart-simple/route.ts` - API endpoints
- `src/lib/ai-agent/actions/cart-simple.ts` - Agent tools
- `src/hooks/useSimpleCart.ts` - Frontend hook
- `test-simple-cart.js` - Test script

### Modified Files
- None (old files remain for rollback capability)

## Next Steps
1. Test the new system thoroughly
2. Update documentation
3. Consider removing old files after successful migration
4. Monitor for any edge cases