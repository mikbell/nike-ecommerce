"use server";

import { auth } from "./index";
import { db } from "../db";
import { guest } from "../db/schema/guest";
import { carts, cartItems } from "../db/schema";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Definizione degli Schemi Zod
const signUpSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

const signInSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

const GUEST_COOKIE_NAME = "guest_session";
const GUEST_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "strict" as const,
	maxAge: 60 * 60 * 24 * 7, // 7 giorni
};

/**
 * Funzione di registrazione utente.
 */
export async function signUp(formData: FormData) {
	try {
		const rawData = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};

		const validatedData = signUpSchema.parse(rawData);

		const guestSessionToken = await getGuestSession();

		const result = await auth.api.signUpEmail({
			body: {
				name: validatedData.name,
				email: validatedData.email,
				password: validatedData.password,
			},
		});

		// Se esisteva una sessione guest, la pulisce ora che l'utente è registrato
		if (guestSessionToken && result.user?.id) {
			await mergeGuestCartWithUserCart(result.user.id, guestSessionToken);
		}

		await clearGuestSession();

		return { success: true, user: result.user };
	} catch (error) {
		console.error("Sign up error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Sign up failed",
		};
	}
}

/**
 * Funzione di accesso utente.
 */
export async function signIn(formData: FormData) {
	try {
		const rawData = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};

		const validatedData = signInSchema.parse(rawData);

		const guestSessionToken = await getGuestSession();

		const result = await auth.api.signInEmail({
			body: {
				email: validatedData.email,
				password: validatedData.password,
			},
		});

		// Se esisteva una sessione guest, la pulisce ora che l'utente ha effettuato l'accesso
		if (guestSessionToken && result.user?.id) {
			await mergeGuestCartWithUserCart(result.user.id, guestSessionToken);
		}

		await clearGuestSession();

		return { success: true, user: result.user };
	} catch (error) {
		console.error("Sign in error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Sign in failed",
		};
	}
}

/**
 * Funzione di disconnessione utente.
 */
export async function signOut() {
	try {
		const cookiesStore = await cookies();
		const requestHeaders = new Headers();

		// 1. Raccogli e passa i cookie all'API per invalidare la sessione sul server (corretto)
		cookiesStore.getAll().forEach((cookie) => {
			requestHeaders.append("Cookie", `${cookie.name}=${cookie.value}`);
		});

		await auth.api.signOut({
			headers: requestHeaders,
		});

		// 2. PASSO FONDAMENTALE: Cancella manualmente il cookie di sessione utente dal browser.
		cookiesStore.delete("auth_session");

		// 3. Cancella il cookie guest per pulizia (già presente, ma bene ripeterlo)
		cookiesStore.delete(GUEST_COOKIE_NAME);

		// 4. Reindirizza l'utente dopo il logout
		redirect("/");

		// Non sarà mai raggiunto a causa del redirect, ma manteniamo la coerenza
		return { success: true };
	} catch (error) {
		console.error("Sign out error:", error);

		// Spesso, se il cookie è già sparito (es. sessione scaduta), l'API fallisce.
		// Se non riusciamo a fare il logout "pulito", reindirizziamo comunque
		// per un'esperienza utente coerente.
		redirect("/");

		// ... (return error originale, ma redirect è preferibile in questo contesto)
	}
}
/**
 * Crea una nuova sessione ospite (guest) e imposta il cookie.
 */
export async function createGuestSession() {
	try {
		const sessionToken = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 giorni
		const cookiesStore = await cookies();

		await db.insert(guest).values({
			// Usiamo crypto.randomUUID() per l'ID del database
			id: crypto.randomUUID(),
			sessionToken,
			expiresAt,
		});

		cookiesStore.set(GUEST_COOKIE_NAME, sessionToken, GUEST_COOKIE_OPTIONS);

		return { success: true, sessionToken };
	} catch (error) {
		console.error("Create guest session error:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to create guest session",
		};
	}
}

/**
 * Recupera il token di sessione ospite se è valido.
 */
export async function getGuestSession() {
	try {
		const cookiesStore = await cookies();
		const sessionToken = cookiesStore.get(GUEST_COOKIE_NAME)?.value;

		if (!sessionToken) {
			return null;
		}

		const guestSession = await db
			.select()
			.from(guest)
			.where(eq(guest.sessionToken, sessionToken))
			.limit(1);

		// Sessione non trovata nel DB, elimino il cookie
		if (guestSession.length === 0) {
			cookiesStore.delete(GUEST_COOKIE_NAME);
			return null;
		}

		const session = guestSession[0];

		// Sessione scaduta, la elimino dal DB e dal cookie
		if (session.expiresAt < new Date()) {
			await db.delete(guest).where(eq(guest.sessionToken, sessionToken));
			cookiesStore.delete(GUEST_COOKIE_NAME);
			return null;
		}

		return sessionToken;
	} catch (error) {
		console.error("Get guest session error:", error);
		return null;
	}
}

/**
 * Unisce il carrello guest con il carrello utente dopo login/registrazione.
 */
export async function mergeGuestCartWithUserCart(
	userId: string,
	guestSessionToken: string
) {
	try {
		const [guestRecord] = await db
			.select()
			.from(guest)
			.where(eq(guest.sessionToken, guestSessionToken))
			.limit(1);

		if (!guestRecord) {
			return { success: true };
		}

		const guestCart = await db.query.carts.findFirst({
			where: eq(carts.guestId, guestRecord.id),
			with: {
				cartItems: true
			}
		});

		if (!guestCart || guestCart.cartItems.length === 0) {
			await db.delete(guest).where(eq(guest.id, guestRecord.id));
			return { success: true };
		}

		let userCart = await db.query.carts.findFirst({
			where: eq(carts.userId, userId),
			with: {
				cartItems: true
			}
		});

		if (!userCart) {
			[userCart] = await db.insert(carts).values({
				userId,
			}).returning();
		}

		for (const guestItem of guestCart.cartItems) {
			// Verifica se l'item esiste già nel carrello utente
			const existingItem = userCart.cartItems?.find(
				item => item.productVariantId === guestItem.productVariantId
			);

			if (existingItem) {
				const variant = await db.query.productVariants.findFirst({
					where: (variants, { eq }) => eq(variants.id, guestItem.productVariantId)
				});

				const newQuantity = Math.min(
					existingItem.quantity + guestItem.quantity,
					variant?.inStock || 999
				);

				await db
					.update(cartItems)
					.set({ 
						quantity: newQuantity,
						updatedAt: new Date()
					})
					.where(eq(cartItems.id, existingItem.id));
			} else {
				await db.insert(cartItems).values({
					cartId: userCart.id,
					productVariantId: guestItem.productVariantId,
					quantity: guestItem.quantity,
				});
			}
		}

		await db.delete(cartItems).where(eq(cartItems.cartId, guestCart.id));
		await db.delete(carts).where(eq(carts.id, guestCart.id));
		await db.delete(guest).where(eq(guest.id, guestRecord.id));

		console.log(`Guest cart merged for user ${userId}`);
		return { success: true };
	} catch (error) {
		console.error("Merge guest cart error:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to merge guest cart",
		};
	}
}

/**
 * Pulisce la sessione ospite dal DB e dal browser.
 */
async function clearGuestSession() {
	try {
		const cookiesStore = await cookies();
		const sessionToken = cookiesStore.get(GUEST_COOKIE_NAME)?.value;

		if (sessionToken) {
			await db.delete(guest).where(eq(guest.sessionToken, sessionToken));
			cookiesStore.delete(GUEST_COOKIE_NAME);
		}
	} catch (error) {
		console.error("Clear guest session error:", error);
	}
}

/**
 * Recupera l'utente attualmente autenticato.
 */
export async function getCurrentUser() {
	try {
		const cookieStore = await cookies();
		const requestHeaders = new Headers();
		cookieStore.getAll().forEach((cookie) => {
			requestHeaders.append("Cookie", `${cookie.name}=${cookie.value}`);
		});
		const session = await auth.api.getSession({
			headers: requestHeaders,
		});

		return session?.user || null;
	} catch (error) {
		console.error("Get current user error:", error);
		return null;
	}
}

/**
 * Reindirizza l'utente alla pagina di accesso se non autenticato.
 */
export async function requireAuth() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/sign-in");
	}

	return user;
}
