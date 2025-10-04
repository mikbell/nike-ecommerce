export interface CartItem {
	id: string;
	productId: string;
	variantId: string;
	name: string;
	slug: string;
	price: number;
	originalPrice?: number;
	quantity: number;
	size: string;
	color: string;
	colorHex?: string;
	imageUrl: string;
	inStock: number;
	category: string;
	brand: string;
}

export interface Cart {
	items: CartItem[];
	totalItems: number;
	totalPrice: number;
	subtotal: number;
	tax: number;
	shipping: number;
}

export interface CartStore extends Cart {
	// Actions
	addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => Promise<void>;
	removeItem: (itemId: string) => Promise<void>;
	updateQuantity: (itemId: string, quantity: number) => Promise<void>;
	clearCart: () => Promise<void>;
	getItemQuantity: (productId: string, variantId: string) => number;
	
	// Computed
	isEmpty: boolean;
	
	// Persistence
	loadCart: () => Promise<void>;
	saveCart: () => void;
}

export interface AddToCartData {
	productId: string;
	variantId: string;
	quantity?: number;
}

// Per la persistenza nel database
export interface DbCart {
	id: string;
	userId?: string;
	sessionId?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface DbCartItem {
	id: string;
	cartId: string;
	productId: string;
	variantId: string;
	quantity: number;
	createdAt: Date;
	updatedAt: Date;
}
