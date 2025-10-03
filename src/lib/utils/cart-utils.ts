import { CartItem } from "@/lib/types/cart";

// Tipo per i dati del prodotto come vengono ricevuti dalla funzione getAllProducts
export type ProductForCart = {
	id: string;
	title: string;
	slug: string;
	price: number;
	originalPrice?: number;
	imageUrl: string;
	category: string;
	brand?: string;
	colors: string[];
	sizes: string[];
};

// Funzione per convertire un prodotto in CartItem
// Nota: questa funzione usa valori di default per i campi mancanti
// In una implementazione reale, dovresti avere la selezione di colore/taglia dal prodotto
export function convertProductToCartItem(
	product: ProductForCart,
	options?: {
		variantId?: string;
		size?: string;
		color?: string;
		colorHex?: string;
		quantity?: number;
		inStock?: number;
	}
): Omit<CartItem, 'id' | 'quantity'> & { quantity?: number } {
	
	// Usa valori di default o dall'opzioni
	const selectedSize = options?.size || product.sizes[0] || 'M';
	const selectedColor = options?.color || product.colors[0] || 'Default';
	const variantId = options?.variantId || `${product.id}-${selectedSize}-${selectedColor}`;
	const quantity = options?.quantity || 1;
	const inStock = options?.inStock || 10; // Default stock
	
	return {
		productId: product.id,
		variantId: variantId,
		name: product.title,
		slug: product.slug,
		price: product.price,
		originalPrice: product.originalPrice,
		quantity: quantity,
		size: selectedSize,
		color: selectedColor,
		colorHex: options?.colorHex,
		imageUrl: product.imageUrl,
		inStock: inStock,
		category: product.category,
		brand: product.brand || 'Nike'
	};
}

// Funzione helper per ottenere un messaggio di successo personalizzato
export function getAddToCartSuccessMessage(productName: string, quantity: number = 1): string {
	return `${productName} ${quantity > 1 ? `(${quantity})` : ''} aggiunto al carrello!`;
}

// Funzione helper per validare se un prodotto può essere aggiunto al carrello
export function canAddToCart(
	product: ProductForCart,
	requestedQuantity: number = 1
): { canAdd: boolean; reason?: string } {
	
	if (!product.id) {
		return { canAdd: false, reason: "ID prodotto mancante" };
	}
	
	if (!product.title) {
		return { canAdd: false, reason: "Nome prodotto mancante" };
	}
	
	if (product.price <= 0) {
		return { canAdd: false, reason: "Prezzo non valido" };
	}
	
	if (requestedQuantity <= 0) {
		return { canAdd: false, reason: "Quantità deve essere maggiore di 0" };
	}
	
	if (product.sizes.length === 0) {
		return { canAdd: false, reason: "Nessuna taglia disponibile" };
	}
	
	return { canAdd: true };
}