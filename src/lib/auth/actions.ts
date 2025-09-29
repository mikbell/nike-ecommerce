"use server";

import { auth } from "./index";
import { db } from "../db";
import { guest } from "../db/schema/guest";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

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
	maxAge: 60 * 60 * 24 * 7, // 7 days
};

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

export async function signOut() {
	try {
		await auth.api.signOut({
			headers: new Headers(),
		});
		return { success: true };
	} catch (error) {
		console.error("Sign out error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Sign out failed",
		};
	}
}

export async function createGuestSession() {
	try {
		const sessionToken = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

		await db.insert(guest).values({
			id: uuidv4(),
			sessionToken,
			expiresAt,
		});

		(await cookies()).set(
			GUEST_COOKIE_NAME,
			sessionToken,
			GUEST_COOKIE_OPTIONS
		);

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

export async function getGuestSession() {
	try {
		const sessionToken = (await cookies()).get(GUEST_COOKIE_NAME)?.value;

		if (!sessionToken) {
			return null;
		}

		const guestSession = await db
			.select()
			.from(guest)
			.where(eq(guest.sessionToken, sessionToken))
			.limit(1);

		if (guestSession.length === 0) {
			(await cookies()).delete(GUEST_COOKIE_NAME);
			return null;
		}

		const session = guestSession[0];

		if (session.expiresAt < new Date()) {
			await db.delete(guest).where(eq(guest.sessionToken, sessionToken));
			(await cookies()).delete(GUEST_COOKIE_NAME);
			return null;
		}

		return sessionToken;
	} catch (error) {
		console.error("Get guest session error:", error);
		return null;
	}
}

export async function mergeGuestCartWithUserCart(
	userId: string,
	guestSessionToken: string
) {
	try {
		await db.delete(guest).where(eq(guest.sessionToken, guestSessionToken));

		console.log(`Guest cart migration for user ${userId} completed`);
		return { success: true };
	} catch (error) {
		console.error("Merge guest cart error:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to merge guest cart",
		};
	}
}

async function clearGuestSession() {
	try {
		const sessionToken = (await cookies()).get(GUEST_COOKIE_NAME)?.value;

		if (sessionToken) {
			await db.delete(guest).where(eq(guest.sessionToken, sessionToken));

			(await cookies()).delete(GUEST_COOKIE_NAME);
		}
	} catch (error) {
		console.error("Clear guest session error:", error);
	}
}

export async function getCurrentUser() {
	try {
		const session = await auth.api.getSession({
			headers: new Headers(),
		});
		return session?.user || null;
	} catch (error) {
		console.error("Get current user error:", error);
		return null;
	}
}

export async function requireAuth() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/sign-in");
	}

	return user;
}
