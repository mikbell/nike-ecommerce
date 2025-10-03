import { CartItem } from '@/lib/types/cart';

export class CartApiError extends Error {
	constructor(message: string, public status?: number) {
		super(message);
		this.name = 'CartApiError';
	}
}

// Carica il carrello dal database per utenti autenticati
export async function loadCartFromDatabase(): Promise<CartItem[]> {
	try {
		const response = await fetch('/api/cart', {
			method: 'GET',
			credentials: 'include',
		});

		if (!response.ok) {
			if (response.status === 401) {
				// Utente non autenticato, ritorna array vuoto
				return [];
			}
			throw new CartApiError(`Errore caricamento carrello: ${response.statusText}`, response.status);
		}

		const data = await response.json();
		return data.items || [];
	} catch (error) {
		if (error instanceof CartApiError) {
			throw error;
		}
		console.error('Errore caricamento carrello:', error);
		throw new CartApiError('Errore di rete durante il caricamento del carrello');
	}
}

// Salva il carrello nel database per utenti autenticati
export async function saveCartToDatabase(items: CartItem[]): Promise<void> {
	try {
		const response = await fetch('/api/cart', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ items }),
		});

		if (!response.ok) {
			if (response.status === 401) {
				// Utente non autenticato, non fare nulla
				return;
			}
			throw new CartApiError(`Errore salvataggio carrello: ${response.statusText}`, response.status);
		}
	} catch (error) {
		if (error instanceof CartApiError) {
			throw error;
		}
		console.error('Errore salvataggio carrello:', error);
		throw new CartApiError('Errore di rete durante il salvataggio del carrello');
	}
}

// Svuota il carrello nel database per utenti autenticati
export async function clearCartInDatabase(): Promise<void> {
	try {
		const response = await fetch('/api/cart', {
			method: 'DELETE',
			credentials: 'include',
		});

		if (!response.ok) {
			if (response.status === 401) {
				// Utente non autenticato, non fare nulla
				return;
			}
			throw new CartApiError(`Errore svuotamento carrello: ${response.statusText}`, response.status);
		}
	} catch (error) {
		if (error instanceof CartApiError) {
			throw error;
		}
		console.error('Errore svuotamento carrello:', error);
		throw new CartApiError('Errore di rete durante lo svuotamento del carrello');
	}
}

// Sincronizza il carrello localStorage con il database (utile dopo login)
export async function syncCartWithDatabase(localItems: CartItem[]): Promise<CartItem[]> {
	try {
		// Prima carica il carrello dal database
		const dbItems = await loadCartFromDatabase();
		
		// Se ci sono items locali e nel database, li uniamo
		if (localItems.length > 0 && dbItems.length > 0) {
			// Logica di merge: items locali hanno precedenza
			const mergedItems = [...localItems];
			
			// Aggiungi items dal database che non sono già presenti localmente
			dbItems.forEach(dbItem => {
				const existsLocally = localItems.some(
					localItem => localItem.productId === dbItem.productId && localItem.variantId === dbItem.variantId
				);
				
				if (!existsLocally) {
					mergedItems.push(dbItem);
				}
			});
			
			// Salva il carrello unito
			await saveCartToDatabase(mergedItems);
			return mergedItems;
		}
		
		// Se ci sono solo items locali, salvali nel database
		if (localItems.length > 0 && dbItems.length === 0) {
			await saveCartToDatabase(localItems);
			return localItems;
		}
		
		// Se ci sono solo items nel database, ritornali
		if (localItems.length === 0 && dbItems.length > 0) {
			return dbItems;
		}
		
		// Nessun item in entrambi
		return [];
		
	} catch (error) {
		console.error('Errore sincronizzazione carrello:', error);
		// In caso di errore, ritorna gli items locali
		return localItems;
	}
}