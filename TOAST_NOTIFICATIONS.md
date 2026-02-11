# Toast Notification Architecture

## Overview
This document outlines the centralized toast notification system implemented across the application to provide consistent user feedback while avoiding duplicate notifications.

## Design Principle: Single Source of Truth

**Core Rule:** Toast notifications are handled **only at the context level**, not in individual components.

### Why This Approach?
- **Prevents Duplicates:** Multiple components can call the same context function without triggering multiple toasts
- **Consistency:** All notifications for a specific action look and behave the same
- **Maintainability:** Changes to notification messages only need to be made in one place
- **Separation of Concerns:** Business logic (contexts) handles notifications, UI components focus on presentation

## Toast Configuration

### Location
`src/components/ToastProvider.jsx`

### Settings
```javascript
- Position: top-right
- Duration: 3000ms (success), 4000ms (error)
- Success Style: Black background, white text
- Error Style: Red background (#ef4444), white text
- Border Radius: 12px
- Font: Bold, 14px
```

## Notification Sources

### 1. Authentication (AuthContext.jsx)
**Handles:**
- ✅ Login success
- ❌ Login error
- ✅ Registration success
- ❌ Registration error
- ✅ Logout success

**Components Using Auth:**
- `Login.jsx` - NO toasts (context handles it)
- `Register.jsx` - NO success toast (context handles it), only shows error toasts for validation
- `Header.jsx` - NO toasts (context handles logout)

### 2. Cart Operations (CartContext.jsx)
**Handles:**
- ✅ Item added to cart
- ✅ Item quantity updated
- ✅ Item removed from cart
- ✅ Cart cleared

**Components Using Cart:**
- `ProductCard.jsx` - NO toasts (context handles it)
- `ProductDetail.jsx` - NO toasts (context handles it)
- `Cart.jsx` - NO toasts for cart operations (context handles it)

### 3. Wishlist Operations (WishlistContext.jsx)
**Handles:**
- ✅ Item added to wishlist
- ✅ Item removed from wishlist

**Components Using Wishlist:**
- `ProductCard.jsx` - NO toasts (context handles it) ⚠️ FIXED
- `ProductDetail.jsx` - NO toasts (context handles it) ⚠️ FIXED
- `Wishlist.jsx` - NO toasts (context handles it)

### 4. Page-Level Operations
**These show toasts directly (not context-managed):**
- `Checkout.jsx` - Order placement, validation errors
- `ProductDetail.jsx` - Review submission
- `Profile.jsx` - Profile updates
- `Cart.jsx` - Coupon application
- `ProductCard.jsx` - Link copied to clipboard

## Implementation Example

### ❌ WRONG - Duplicate Toasts
```javascript
// Component
const handleAddToWishlist = async () => {
  await addToWishlist(product);
  toast.success("Added to wishlist"); // ❌ DON'T DO THIS
};

// Context
const addToWishlist = async (product) => {
  await setDoc(/* ... */);
  toast.success("Added to wishlist"); // This creates duplicate!
};
```

### ✅ CORRECT - Single Toast
```javascript
// Component
const handleAddToWishlist = async () => {
  await addToWishlist(product); // ✅ Just call the function
};

// Context
const addToWishlist = async (product) => {
  await setDoc(/* ... */);
  toast.success(`${product.name} added to wishlist`); // ✅ Only here
};
```

## Error Handling Pattern

```javascript
// Component
try {
  await contextFunction(data);
  // NO success toast here - context handles it
} catch (err) {
  toast.error(err.message || "Something went wrong"); // ✅ OK to show errors
}
```

## Complete Toast Notification List

### User Actions
| Action | Toast Message | Source |
|--------|--------------|--------|
| Login | "Logged in successfully!" | AuthContext |
| Logout | "Logged out successfully!" | AuthContext |
| Register | "Account created successfully!" | AuthContext |
| Add to Cart | "{product.name} added to cart" | CartContext |
| Update Cart Qty | "Updated {product.name} quantity" | CartContext |
| Remove from Cart | "Item removed from cart" | CartContext |
| Clear Cart | "Cart cleared" | CartContext |
| Add to Wishlist | "{product.name} added to wishlist" | WishlistContext |
| Remove from Wishlist | "Item removed from wishlist" | WishlistContext |
| Place Order | "Order Placed Successfully!" | Checkout.jsx |
| Submit Review | "Review Submitted!" | ProductDetail.jsx |
| Update Profile | "Profile updated successfully!" | Profile.jsx |
| Apply Coupon | "Coupon Applied Successfully!" | Cart.jsx |
| Copy Link | "Link copied to clipboard!" | ProductCard.jsx |

### Error Messages
| Error Type | Toast Message | Source |
|-----------|--------------|--------|
| Invalid Login | "Invalid email or password" | AuthContext |
| Registration Error | Firebase error message | AuthContext |
| Cart Error | "Failed to add to cart" | Component |
| Wishlist Error | "Wishlist update failed" | Component |
| Order Error | Error message or "Failed to place order" | Checkout.jsx |
| Missing Fields | "Please fill in all shipping details" | Checkout.jsx |

## Testing Checklist

- [ ] Login shows 1 toast (not 2 or 3)
- [ ] Logout shows 1 toast
- [ ] Registration shows 1 toast
- [ ] Add to cart shows 1 toast
- [ ] Remove from cart shows 1 toast
- [ ] Add to wishlist shows 1 toast (not 3) ✅ FIXED
- [ ] Remove from wishlist shows 1 toast (not 3) ✅ FIXED
- [ ] Order placement shows 1 toast
- [ ] All toasts appear in top-right corner
- [ ] Success toasts are black with white text
- [ ] Error toasts are red with white text

## Maintenance Guidelines

1. **Adding New Features:**
   - If creating a new context, add toasts in the context functions
   - If adding UI-only features, toasts can be in components

2. **Debugging Duplicate Toasts:**
   - Search for `toast.success` or `toast.error` in the codebase
   - Check if both component AND context show the same message
   - Remove the component-level toast

3. **Changing Toast Messages:**
   - For context-managed actions: Edit the context file
   - For page-specific actions: Edit the page component

4. **Adding New Toast Types:**
   - Use `toast.success()` for successful operations
   - Use `toast.error()` for errors
   - Use `toast.loading()` for long-running operations (if needed)
   - Use `toast.custom()` for special cases

## Files Modified to Fix Duplicates

1. ✅ `src/components/ProductCard.jsx` - Removed wishlist toasts (lines 45, 48)
2. ✅ `src/pages/ProductDetail.jsx` - Removed wishlist toasts (lines 121, 129)
3. ✅ `src/pages/Register.jsx` - Removed duplicate registration success toast (line 28)
4. ✅ `src/context/WishlistContext.jsx` - Added toasts (single source)
5. ✅ `src/pages/Wishlist.jsx` - Removed alert(), let context handle notifications (line 19)
6. ✅ `src/pages/admin/OrderManager.jsx` - Replaced alert() with toast notifications (line 40)

## Additional Improvements

### Alerts Replaced with Toasts
- ✅ `Wishlist.jsx` - Replaced `alert("Moved to Cart!")` with context-managed toasts
- ✅ `OrderManager.jsx` - Replaced `alert("Failed to update status")` with `toast.error()`
- ✅ `OrderManager.jsx` - Added success toast for order status updates

## Integration

The `ToastProvider` is integrated in `App.jsx`:

```javascript
<Router>
  <ToastProvider /> {/* Global toast container */}
  <Layout>
    <Routes>...</Routes>
  </Layout>
</Router>
```

This ensures toasts are visible across all routes and pages.
