import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/index";
import * as schema from "@/lib/db/schema/index";
import { v4 as uuidv4 } from "uuid";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			requireEmailVerification: false,
		},
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 7, // 7 days
		},
	},
	cookies: {
		sessionToken: {
			name: "auth_session",
			options: {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			},
		},
	},
	socialProviders: {},
	advanced: {
		database: {
			generateId: () => uuidv4(),
		},
	},
	plugins: [nextCookies()],
});

// Funzione helper per le API routes
export async function getUser() {
	const { headers } = await import('next/headers');
	const headersList = headers();
	
	try {
		const session = await auth.api.getSession({
			headers: headersList,
		});
		return session?.user || null;
	} catch (error) {
		console.error('Get user error:', error);
		return null;
	}
}
