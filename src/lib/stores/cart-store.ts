import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
<<<<<<< HEAD
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { Cart, CartItem } from '@/types';
import { formatPrice } from '@/lib/utils/index';

// === Constants ===
const TAX_RATE = 0.22; // 22% VAT
=======
import { CartStore, CartItem } from '@/lib/types/cart';
import { toast } from 'sonner';

const TAX_RATE = 0.22;
>>>>>>> 98a4f0288f1b8457a4d2f35c0bbd0e29b5266d25
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
<<<<<<< HEAD
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
=======
	persist(
		(set, get) => ({
			items: [],
			totalItems: 0,
			totalPrice: 0,
			subtotal: 0,
			tax: 0,
			shipping: 0,
			isEmpty: true,

			addItem: async (itemData) => {
				const { quantity = 1, ...item } = itemData;
				
				try {
					const response = await fetch('/api/cart', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
						body: JSON.stringify({
							variantId: item.variantId,
							quantity,
						}),
					});

					if (!response.ok) {
						const error = await response.json();
						toast.error(error.error || 'Errore aggiunta al carrello');
						return;
					}

					const existingItemIndex = get().items.findIndex(
						(cartItem) => 
							cartItem.productId === item.productId && 
							cartItem.variantId === item.variantId
					);
>>>>>>> 98a4f0288f1b8457a4d2f35c0bbd0e29b5266d25

          if (!validateCartItem(item)) {
            console.error('Invalid cart item:', item);
            return;
          }

<<<<<<< HEAD
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
=======
					if (existingItemIndex >= 0) {
						newItems = get().items.map((cartItem, index) => {
							if (index === existingItemIndex) {
								const newQuantity = Math.min(
									cartItem.quantity + quantity,
									cartItem.inStock
								);
								return { ...cartItem, quantity: newQuantity };
							}
							return cartItem;
						});
					} else {
						const newItem: CartItem = {
							...item,
							id: item.variantId,
							quantity: Math.min(quantity, item.inStock)
						};
						newItems = [...get().items, newItem];
					}

					set({
						items: newItems,
						...calculateTotals(newItems)
					});

					toast.success('Articolo aggiunto al carrello');
				} catch (error) {
					console.error('Error adding to cart:', error);
					toast.error('Errore durante l\'aggiunta al carrello');
				}
			},

			removeItem: async (itemId) => {
				try {
					const response = await fetch('/api/cart', {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
						body: JSON.stringify({
							itemId,
							quantity: 0,
						}),
					});

					if (!response.ok) {
						toast.error('Errore rimozione articolo');
						return;
					}

					const newItems = get().items.filter(item => item.id !== itemId);
					set({
						items: newItems,
						...calculateTotals(newItems)
					});
				} catch (error) {
					console.error('Error removing from cart:', error);
					toast.error('Errore durante la rimozione');
				}
			},

			updateQuantity: async (itemId, quantity) => {
				if (quantity <= 0) {
					get().removeItem(itemId);
					return;
				}

				try {
					const response = await fetch('/api/cart', {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
						body: JSON.stringify({
							itemId,
							quantity,
						}),
					});

					if (!response.ok) {
						const error = await response.json();
						toast.error(error.error || 'Errore aggiornamento quantità');
						return;
					}

					const newItems = get().items.map(item => {
						if (item.id === itemId) {
							return { 
								...item, 
								quantity: Math.min(quantity, item.inStock) 
							};
						}
						return item;
					});

					set({
						items: newItems,
						...calculateTotals(newItems)
					});
				} catch (error) {
					console.error('Error updating quantity:', error);
					toast.error('Errore durante l\'aggiornamento');
				}
			},

			clearCart: async () => {
				try {
					const response = await fetch('/api/cart', {
						method: 'DELETE',
						credentials: 'include',
					});

					if (!response.ok) {
						toast.error('Errore svuotamento carrello');
						return;
					}

					set({
						items: [],
						totalItems: 0,
						totalPrice: 0,
						subtotal: 0,
						tax: 0,
						shipping: 0,
						isEmpty: true
					});
				} catch (error) {
					console.error('Error clearing cart:', error);
					toast.error('Errore durante lo svuotamento');
				}
			},
>>>>>>> 98a4f0288f1b8457a4d2f35c0bbd0e29b5266d25

        getItemQuantity: (productId, variantId) => {
          const item = get().items.find(
            item => item.productId === productId && item.variantId === variantId
          );
          return item?.quantity || 0;
        },

<<<<<<< HEAD
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
=======
			loadCart: async () => {
				try {
					const response = await fetch('/api/cart', {
						credentials: 'include',
					});

					if (response.ok) {
						const data = await response.json();
						if (data.items && Array.isArray(data.items)) {
							set({
								items: data.items,
								...calculateTotals(data.items)
							});
						}
					}
				} catch (error) {
					console.error('Error loading cart:', error);
				}
			},

			saveCart: () => {
			}
		}),
		{
			name: 'nike-cart-storage',
			storage: createJSONStorage(() => localStorage),
			onRehydrateStorage: () => (state) => {
				if (state) {
					const newTotals = calculateTotals(state.items);
					state.totalItems = newTotals.totalItems;
					state.totalPrice = newTotals.totalPrice;
					state.subtotal = newTotals.subtotal;
					state.tax = newTotals.tax;
					state.shipping = newTotals.shipping;
					state.isEmpty = newTotals.isEmpty;
					
					state.loadCart();
				}
			}
		}
	)
);

function calculateTotals(items: CartItem[]) {
	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
	const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	const tax = subtotal * TAX_RATE;
	const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
	const totalPrice = subtotal + tax + shipping;
	const isEmpty = items.length === 0;

	return {
		totalItems,
		subtotal: Math.round(subtotal * 100) / 100,
		tax: Math.round(tax * 100) / 100,
		shipping: Math.round(shipping * 100) / 100,
		totalPrice: Math.round(totalPrice * 100) / 100,
		isEmpty
	};
}
>>>>>>> 98a4f0288f1b8457a4d2f35c0bbd0e29b5266d25
