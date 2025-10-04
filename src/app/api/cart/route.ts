import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { carts, cartItems } from '@/lib/db/schema';
import { getCurrentUser, getGuestSession, createGuestSession } from '@/lib/auth/actions';
import { eq, and } from 'drizzle-orm';
import { CartItem } from '@/lib/types/cart';
import { z } from 'zod';

const AddToCartSchema = z.object({
	variantId: z.string().uuid('ID variante non valido'),
	quantity: z.number().int().min(1, 'Quantità deve essere almeno 1').max(10, 'Quantità massima superata').default(1),
});

const UpdateCartItemSchema = z.object({
	itemId: z.string().uuid('ID articolo non valido'),
	quantity: z.number().int().min(0, 'Quantità non valida').max(10, 'Quantità massima superata'),
});

// GET - Recupera il carrello dell'utente o guest
export async function GET() {
	try {
		const user = await getCurrentUser();
		let guestSessionToken = null;
		
		if (!user) {
			guestSessionToken = await getGuestSession();
			
			if (!guestSessionToken) {
				const result = await createGuestSession();
				if (!result.success) {
					return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
				}
				guestSessionToken = result.sessionToken;
			}
		}

		// Trova il carrello dell'utente o guest con gli items
		const whereClause = user 
			? eq(carts.userId, user.id)
			: eq(carts.guestId, guestSessionToken!);

		const userCart = await db.query.carts.findFirst({
			where: whereClause,
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
			id: item.id,
			productId: item.productVariant.productId,
			variantId: item.productVariantId,
			name: item.productVariant.product.name,
			slug: item.productVariant.product.slug,
			price: parseFloat(item.productVariant.salePrice || item.productVariant.price),
			originalPrice: item.productVariant.salePrice ? parseFloat(item.productVariant.price) : undefined,
			quantity: item.quantity,
			size: item.productVariant.size.name,
			color: item.productVariant.color.name,
			colorHex: item.productVariant.color.hexCode,
			imageUrl: '/shoes/shoe-1.jpg',
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

// POST - Aggiungi item al carrello
export async function POST(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		let guestSessionToken = null;
		
		if (!user) {
			guestSessionToken = await getGuestSession();
			if (!guestSessionToken) {
				const result = await createGuestSession();
				if (!result.success) {
					return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
				}
				guestSessionToken = result.sessionToken;
			}
		}

		const body = await request.json();
		const { variantId, quantity } = AddToCartSchema.parse(body);

		const variant = await db.query.productVariants.findFirst({
			where: (productVariants, { eq }) => eq(productVariants.id, variantId),
		});

		if (!variant) {
			return NextResponse.json(
				{ error: 'Variante prodotto non trovata' },
				{ status: 404 }
			);
		}

		if (variant.inStock < quantity) {
			return NextResponse.json(
				{ error: 'Stock insufficiente' },
				{ status: 400 }
			);
		}

		// Trova o crea il carrello
		let userCart = await db.query.carts.findFirst({
			where: user 
				? (carts, { eq }) => eq(carts.userId, user.id)
				: (carts, { eq }) => eq(carts.guestId, guestSessionToken!)
		});

		if (!userCart) {
			const [newCart] = await db.insert(carts).values({
				userId: user?.id,
				guestId: guestSessionToken || undefined
			}).returning();
			userCart = newCart;
		}

		// Verifica se l'item esiste già nel carrello
		const existingItem = await db.query.cartItems.findFirst({
			where: (cartItems, { eq, and }) => and(
				eq(cartItems.cartId, userCart!.id),
				eq(cartItems.productVariantId, variantId)
			)
		});

		if (existingItem) {
			// Aggiorna la quantità
			const newQuantity = Math.min(existingItem.quantity + quantity, variant.inStock);
			
			await db
				.update(cartItems)
				.set({ 
					quantity: newQuantity,
					updatedAt: new Date(),
				})
				.where(eq(cartItems.id, existingItem.id));
		} else {
			// Aggiungi nuovo item
			await db.insert(cartItems).values({
				cartId: userCart.id,
				productVariantId: variantId,
				quantity: Math.min(quantity, variant.inStock),
			});
		}

		// Aggiorna timestamp carrello
		await db.update(carts)
			.set({ updatedAt: new Date() })
			.where(eq(carts.id, userCart.id));

		return NextResponse.json({ 
			success: true,
			message: 'Articolo aggiunto al carrello'
		});

	} catch (error) {
		console.error('Errore aggiunta al carrello:', error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Dati non validi', details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ error: 'Errore interno del server' },
			{ status: 500 }
		);
	}
}

// PATCH - Aggiorna quantità item nel carrello
export async function PATCH(request: NextRequest) {
	try {
		const user = await getCurrentUser();
		let guestSessionToken = null;
		
		if (!user) {
			guestSessionToken = await getGuestSession();
			if (!guestSessionToken) {
				return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
			}
		}

		const body = await request.json();
		const { itemId, quantity } = UpdateCartItemSchema.parse(body);

		// Trova il carrello
		const userCart = await db.query.carts.findFirst({
			where: user 
				? (carts, { eq }) => eq(carts.userId, user.id)
				: (carts, { eq }) => eq(carts.guestId, guestSessionToken!)
		});

		if (!userCart) {
			return NextResponse.json({ error: 'Carrello non trovato' }, { status: 404 });
		}

		const item = await db.query.cartItems.findFirst({
			where: (cartItems, { eq, and }) => and(
				eq(cartItems.id, itemId),
				eq(cartItems.cartId, userCart.id)
			),
			with: {
				productVariant: true
			}
		});

		if (!item) {
			return NextResponse.json(
				{ error: 'Articolo non trovato nel carrello' },
				{ status: 404 }
			);
		}

		if (quantity === 0) {
			await db.delete(cartItems).where(eq(cartItems.id, itemId));
		} else {
			if (item.productVariant.inStock < quantity) {
				return NextResponse.json(
					{ error: 'Stock insufficiente' },
					{ status: 400 }
				);
			}

			// Aggiorna quantità
			await db
				.update(cartItems)
				.set({ 
					quantity,
					updatedAt: new Date(),
				})
				.where(eq(cartItems.id, itemId));
		}

		// Aggiorna timestamp carrello
		await db.update(carts)
			.set({ updatedAt: new Date() })
			.where(eq(carts.id, userCart.id));

		return NextResponse.json({ 
			success: true,
			message: quantity === 0 ? 'Articolo rimosso dal carrello' : 'Carrello aggiornato'
		});

	} catch (error) {
		console.error('Errore aggiornamento carrello:', error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Dati non validi', details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ error: 'Errore interno del server' },
			{ status: 500 }
		);
	}
}

// DELETE - Svuota il carrello
export async function DELETE() {
	try {
		const user = await getCurrentUser();
		let guestSessionToken = null;
		
		if (!user) {
			guestSessionToken = await getGuestSession();
			if (!guestSessionToken) {
				return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
			}
		}

		// Trova il carrello
		const userCart = await db.query.carts.findFirst({
			where: user 
				? (carts, { eq }) => eq(carts.userId, user.id)
				: (carts, { eq }) => eq(carts.guestId, guestSessionToken!)
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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
