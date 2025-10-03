import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartStore, CartItem } from '@/lib/types/cart';

const TAX_RATE = 0.22; // 22% IVA
const FREE_SHIPPING_THRESHOLD = 50; // Spedizione gratuita sopra €50
const SHIPPING_COST = 7.99;

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			// Initial state
			items: [],
			totalItems: 0,
			totalPrice: 0,
			subtotal: 0,
			tax: 0,
			shipping: 0,
			isEmpty: true,

			// Actions
			addItem: (itemData) => {
				const { quantity = 1, ...item } = itemData;
				
				set((state) => {
					// Controlla se l'item esiste già (stesso prodotto e variante)
					const existingItemIndex = state.items.findIndex(
						(cartItem) => 
							cartItem.productId === item.productId && 
							cartItem.variantId === item.variantId
					);

					let newItems: CartItem[];

					if (existingItemIndex >= 0) {
						// Item esiste, aggiorna la quantità
						newItems = state.items.map((cartItem, index) => {
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
						// Nuovo item, aggiungilo al carrello
						const newItem: CartItem = {
							...item,
							id: `${item.productId}-${item.variantId}-${Date.now()}`,
							quantity: Math.min(quantity, item.inStock)
						};
						newItems = [...state.items, newItem];
					}

					return {
						...state,
						items: newItems,
						...calculateTotals(newItems)
					};
				});
			},

			removeItem: (itemId) => {
				set((state) => {
					const newItems = state.items.filter(item => item.id !== itemId);
					return {
						...state,
						items: newItems,
						...calculateTotals(newItems)
					};
				});
			},

			updateQuantity: (itemId, quantity) => {
				if (quantity <= 0) {
					get().removeItem(itemId);
					return;
				}

				set((state) => {
					const newItems = state.items.map(item => {
						if (item.id === itemId) {
							return { 
								...item, 
								quantity: Math.min(quantity, item.inStock) 
							};
						}
						return item;
					});

					return {
						...state,
						items: newItems,
						...calculateTotals(newItems)
					};
				});
			},

			clearCart: () => {
				set({
					items: [],
					totalItems: 0,
					totalPrice: 0,
					subtotal: 0,
					tax: 0,
					shipping: 0,
					isEmpty: true
				});
			},

			getItemQuantity: (productId, variantId) => {
				const item = get().items.find(
					item => item.productId === productId && item.variantId === variantId
				);
				return item?.quantity || 0;
			},

			loadCart: () => {
				// Questa funzione viene chiamata automaticamente da persist
				// Possiamo aggiungere logica aggiuntiva se necessario
			},

			saveCart: () => {
				// Questa funzione viene chiamata automaticamente da persist
				// Possiamo aggiungere logica aggiuntiva se necessario
			}
		}),
		{
			name: 'nike-cart-storage',
			storage: createJSONStorage(() => localStorage),
			// Risincronizza i totali dopo il caricamento
			onRehydrateStorage: () => (state) => {
				if (state) {
					const newTotals = calculateTotals(state.items);
					state.totalItems = newTotals.totalItems;
					state.totalPrice = newTotals.totalPrice;
					state.subtotal = newTotals.subtotal;
					state.tax = newTotals.tax;
					state.shipping = newTotals.shipping;
					state.isEmpty = newTotals.isEmpty;
				}
			}
		}
	)
);

// Funzione helper per calcolare i totali
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