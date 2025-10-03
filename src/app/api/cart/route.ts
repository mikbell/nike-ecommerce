import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { carts, cartItems } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/actions';
import { eq } from 'drizzle-orm';
import { CartItem } from '@/lib/types/cart';

// GET - Recupera il carrello dell'utente
export async function GET() {
	try {
		const user = await getCurrentUser();
		
		if (!user) {
			return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
		}

		// Trova il carrello dell'utente con gli items
		const userCart = await db.query.carts.findFirst({
			where: eq(carts.userId, user.id),
			with: {
				cartItems: {
					with: {
						productVariant: {
							with: {
								color: true,
								size: true,
								product: {
									with: {
										category: true,
										brand: true,
									}
								}
							}
						}
					}
				}
			}
		});

		if (!userCart) {
			return NextResponse.json({ items: [] });
		}

		// Trasforma i dati in formato compatibile con il frontend
		const items = userCart.cartItems.map(item => ({
			id: `${item.productVariant.productId}-${item.productVariantId}`,
			productId: item.productVariant.productId,
			variantId: item.productVariantId,
			name: item.productVariant.product.name,
			slug: item.productVariant.product.slug,
			price: parseFloat(item.productVariant.price),
			originalPrice: item.productVariant.salePrice ? parseFloat(item.productVariant.price) : undefined,
			quantity: item.quantity,
			size: item.productVariant.size.name,
			color: item.productVariant.color.name,
			colorHex: item.productVariant.color.hexCode,
			imageUrl: '/shoes/shoe-1.jpg', // TODO: recuperare immagine reale
			inStock: item.productVariant.inStock,
			category: item.productVariant.product.category.name,
			brand: item.productVariant.product.brand?.name || 'Nike'
		}));

		return NextResponse.json({ items });

	} catch (error) {
		console.error('Errore recupero carrello:', error);
		return NextResponse.json(
			{ error: 'Errore interno del server' },
			{ status: 500 }
		);
	}
}

// POST - Salva/aggiorna il carrello dell'utente
export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		
		if (!user) {
			return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
		}

		const { items } = await request.json();

		if (!Array.isArray(items)) {
			return NextResponse.json({ error: 'Formato dati non valido' }, { status: 400 });
		}

		// Trova o crea il carrello dell'utente
		let userCart = await db.query.carts.findFirst({
			where: eq(carts.userId, user.id)
		});

		if (!userCart) {
			const [newCart] = await db.insert(carts).values({
				userId: user.id
			}).returning();
			userCart = newCart;
		}

		// Rimuovi tutti gli items esistenti dal carrello
		await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));

		// Aggiungi i nuovi items
		if (items.length > 0) {
			const cartItemsData = items.map((item: CartItem) => ({
				cartId: userCart!.id,
				productVariantId: item.variantId,
				quantity: item.quantity
			}));

			await db.insert(cartItems).values(cartItemsData);
		}

		// Aggiorna timestamp carrello
		await db.update(carts)
			.set({ updatedAt: new Date() })
			.where(eq(carts.id, userCart.id));

		return NextResponse.json({ success: true });

	} catch (error) {
		console.error('Errore salvataggio carrello:', error);
		return NextResponse.json(
			{ error: 'Errore interno del server' },
			{ status: 500 }
		);
	}
}

// DELETE - Svuota il carrello dell'utente
export async function DELETE() {
	try {
		const user = await getCurrentUser();
		
		if (!user) {
			return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
		}

		// Trova il carrello dell'utente
		const userCart = await db.query.carts.findFirst({
			where: eq(carts.userId, user.id)
		});

		if (userCart) {
			// Rimuovi tutti gli items dal carrello
			await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
		}

		return NextResponse.json({ success: true });

	} catch (error) {
		console.error('Errore svuotamento carrello:', error);
		return NextResponse.json(
			{ error: 'Errore interno del server' },
			{ status: 500 }
		);
	}
}