import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartStore, CartItem } from '@/lib/types/cart';
import { toast } from 'sonner';

const TAX_RATE = 0.22;
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 7.99;

export const useCartStore = create<CartStore>()(
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

					let newItems: CartItem[];

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

			getItemQuantity: (productId, variantId) => {
				const item = get().items.find(
					item => item.productId === productId && item.variantId === variantId
				);
				return item?.quantity || 0;
			},

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
