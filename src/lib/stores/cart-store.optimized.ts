import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { Cart, CartItem } from '@/types';
import { formatPrice } from '@/lib/utils';

// === Constants ===
const TAX_RATE = 0.22; // 22% VAT
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 7.99;
const STORAGE_KEY = 'nike-cart-storage';

// === Store Types ===
interface CartActions {
  // Item management
  addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Utilities
  getItemQuantity: (productId: string, variantId: string) => number;
  getCartSummary: () => CartSummary;
  hasItem: (productId: string, variantId?: string) => boolean;
  
  // Persistence
  loadCart: () => void;
  saveCart: () => void;
}

interface CartSummary {
  itemCount: number;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  hasItems: boolean;
  qualifiesForFreeShipping: boolean;
  amountToFreeShipping: number;
}

type CartStore = Cart & CartActions;

// === Helper Functions ===
function calculateTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + tax + shipping;

  return {
    totalItems,
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
    discount: 0, // TODO: Implement discount logic
  };
}

function generateCartItemId(productId: string, variantId: string): string {
  return `${productId}-${variantId}-${Date.now()}`;
}

function validateCartItem(item: Omit<CartItem, 'id' | 'quantity'>): boolean {
  return Boolean(
    item.productId &&
    item.variantId &&
    item.name &&
    item.price > 0 &&
    item.maxQuantity > 0
  );
}

// === Store Implementation ===
export const useCartStore = create<CartStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // === Initial State ===
        items: [],
        totalItems: 0,
        subtotal: 0,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 0,

        // === Actions ===
        addItem: (itemData) => {
          const { quantity = 1, ...item } = itemData;

          if (!validateCartItem(item)) {
            console.error('Invalid cart item:', item);
            return;
          }

          set((state) => {
            // Check if item already exists
            const existingItemIndex = state.items.findIndex(
              (cartItem) => 
                cartItem.productId === item.productId && 
                cartItem.variantId === item.variantId
            );

            if (existingItemIndex >= 0) {
              // Update existing item quantity
              const existingItem = state.items[existingItemIndex];
              const newQuantity = Math.min(
                existingItem.quantity + quantity,
                existingItem.maxQuantity
              );
              state.items[existingItemIndex].quantity = newQuantity;
            } else {
              // Add new item
              const newItem: CartItem = {
                ...item,
                id: generateCartItemId(item.productId, item.variantId),
                quantity: Math.min(quantity, item.maxQuantity),
              };
              state.items.push(newItem);
            }

            // Recalculate totals
            const totals = calculateTotals(state.items);
            state.totalItems = totals.totalItems;
            state.subtotal = totals.subtotal;
            state.tax = totals.tax;
            state.shipping = totals.shipping;
            state.total = totals.total;
            state.discount = totals.discount;
          });
        },

        removeItem: (itemId) => {
          set((state) => {
            state.items = state.items.filter(item => item.id !== itemId);
            
            // Recalculate totals
            const totals = calculateTotals(state.items);
            state.totalItems = totals.totalItems;
            state.subtotal = totals.subtotal;
            state.tax = totals.tax;
            state.shipping = totals.shipping;
            state.total = totals.total;
            state.discount = totals.discount;
          });
        },

        updateQuantity: (itemId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(itemId);
            return;
          }

          set((state) => {
            const item = state.items.find(item => item.id === itemId);
            if (item) {
              item.quantity = Math.min(quantity, item.maxQuantity);
              
              // Recalculate totals
              const totals = calculateTotals(state.items);
              state.totalItems = totals.totalItems;
              state.subtotal = totals.subtotal;
              state.tax = totals.tax;
              state.shipping = totals.shipping;
              state.total = totals.total;
              state.discount = totals.discount;
            }
          });
        },

        clearCart: () => {
          set((state) => {
            state.items = [];
            state.totalItems = 0;
            state.subtotal = 0;
            state.tax = 0;
            state.shipping = 0;
            state.total = 0;
            state.discount = 0;
          });
        },

        getItemQuantity: (productId, variantId) => {
          const item = get().items.find(
            item => item.productId === productId && item.variantId === variantId
          );
          return item?.quantity || 0;
        },

        hasItem: (productId, variantId) => {
          if (variantId) {
            return get().items.some(
              item => item.productId === productId && item.variantId === variantId
            );
          }
          return get().items.some(item => item.productId === productId);
        },

        getCartSummary: (): CartSummary => {
          const state = get();
          const hasItems = state.items.length > 0;
          const qualifiesForFreeShipping = state.subtotal >= FREE_SHIPPING_THRESHOLD;
          const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - state.subtotal);

          return {
            itemCount: state.totalItems,
            subtotal: formatPrice(state.subtotal),
            tax: formatPrice(state.tax),
            shipping: formatPrice(state.shipping),
            total: formatPrice(state.total),
            hasItems,
            qualifiesForFreeShipping,
            amountToFreeShipping,
          };
        },

        loadCart: () => {
          // Called automatically by persist middleware
        },

        saveCart: () => {
          // Called automatically by persist middleware
        },
      })),
      {
        name: STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          items: state.items,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Recalculate totals after rehydration
            const totals = calculateTotals(state.items);
            state.totalItems = totals.totalItems;
            state.subtotal = totals.subtotal;
            state.tax = totals.tax;
            state.shipping = totals.shipping;
            state.total = totals.total;
            state.discount = totals.discount;
          }
        },
      }
    )
  )
);

// === Selectors (for performance optimization) ===
export const useCartItems = () => useCartStore(state => state.items);
export const useCartTotal = () => useCartStore(state => state.total);
export const useCartSummary = () => useCartStore(state => state.getCartSummary());
export const useCartItemCount = () => useCartStore(state => state.totalItems);
export const useIsCartEmpty = () => useCartStore(state => state.items.length === 0);

// === Custom Hooks ===
export const useAddToCart = () => {
  const addItem = useCartStore(state => state.addItem);
  
  return (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    try {
      addItem(item);
      return { success: true };
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      return { success: false, error: 'Failed to add item to cart' };
    }
  };
};

export const useRemoveFromCart = () => {
  const removeItem = useCartStore(state => state.removeItem);
  
  return (itemId: string) => {
    try {
      removeItem(itemId);
      return { success: true };
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      return { success: false, error: 'Failed to remove item from cart' };
    }
  };
};

// === Development Tools ===
if (process.env.NODE_ENV === 'development') {
  // Subscribe to cart changes for debugging
  useCartStore.subscribe((state) => {
    console.log('Cart updated:', {
      itemCount: state.totalItems,
      total: formatPrice(state.total),
    });
  });
}