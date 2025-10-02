import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function middleware(request: NextRequest) {
	// Controlla se la richiesta è per le pagine di autenticazione
	const isAuthPage =
		request.nextUrl.pathname.startsWith("/sign-in") ||
		request.nextUrl.pathname.startsWith("/sign-up");

	if (isAuthPage) {
		try {
			// Verifica se l'utente è già autenticato
			const session = await auth.api.getSession({
				headers: request.headers,
			});

			// Se l'utente è autenticato, reindirizza alla home page
			if (session?.user) {
				return NextResponse.redirect(new URL("/", request.url));
			}
		} catch (error) {
			// Se c'è un errore, permetti l'accesso (l'utente probabilmente non è autenticato)
			console.error("Auth check error:", error);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
