"use client";

import { createAuthClient } from "better-auth/client";
import { User } from "@/types";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	basePath: "/api/auth",
});

// Type-safe wrapper functions
export const authHelpers = {
	async getCurrentUser(): Promise<User | null> {
		try {
			const session = await authClient.getSession();
			return session.data?.user || null;
		} catch (error) {
			console.error("Failed to get current user:", error);
			return null;
		}
	},

	async signIn(
		email: string,
		password: string
	): Promise<{ success: boolean; user?: User; error?: string }> {
		try {
			const result = await authClient.signIn.email({
				email,
				password,
			});

			if (result.data) {
				return { success: true, user: result.data.user };
			} else {
				return {
					success: false,
					error: result.error?.message || "Errore durante l'accesso",
				};
			}
		} catch (error) {
			console.error("Sign in error:", error);
			return {
				success: false,
				error: "Errore durante l'accesso",
			};
		}
	},

	async signUp(
		email: string,
		password: string,
		name: string
	): Promise<{ success: boolean; user?: User; error?: string }> {
		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name,
			});

			if (result.data) {
				return { success: true, user: result.data.user };
			} else {
				return {
					success: false,
					error: result.error?.message || "Errore durante la registrazione",
				};
			}
		} catch (error) {
			console.error("Sign up error:", error);
			return {
				success: false,
				error: "Errore durante la registrazione",
			};
		}
	},

	async signOut(): Promise<void> {
		try {
			await authClient.signOut();
		} catch (error) {
			console.error("Sign out error:", error);
		}
	},
};
