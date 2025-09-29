"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
// Importa le tue Server Actions
import {
	signUp as signUpAction,
	signIn as signInAction,
} from "@/lib/auth/actions";

// --- Schemi Zod (Restano uguali) ---
const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = z.object({
	// Nota: Ho aggiunto la tipizzazione string per essere coerente con FormData
	name: z.string().min(2, "Full name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

interface AuthFormProps {
	mode: "signin" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
	const [showPassword, setShowPassword] = useState(false);
	const isSignUp = mode === "signup";

	const schema = isSignUp ? signUpSchema : signInSchema;
	type FormData = z.infer<typeof schema>;

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: isSignUp
			? ({ name: "", email: "", password: "" } as FormData)
			: ({ email: "", password: "" } as FormData),
	});

	// Stato di invio separato per chiarezza (anche se form.formState.isSubmitting funziona)
	const [isPending, startTransition] = React.useTransition();
	const isSubmitting = form.formState.isSubmitting || isPending;

	// Rimuoviamo il codice di fetch e localStorage
	const onSubmit = (data: FormData) => {
		// La funzione useForm.handleSubmit gestisce già i dati (oggetto)
		// Ma le Server Actions con react-hook-form/Next.js preferiscono FormData.

		// Creiamo FormData dall'oggetto validato
		const formData = new window.FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, value);
		});

		startTransition(async () => {
			const action = isSignUp ? signUpAction : signInAction;

			const result = await action(formData);

			if (!result.success) {
				// Imposta un errore generale sul form (usa 'root' per visualizzarlo sopra i campi)
				form.setError("root", {
					type: "manual",
					message: result.error || "An unknown error occurred.",
				});
			} else {
				// Successo: la navigazione viene gestita all'interno delle Server Actions
				// tramite `redirect('/path')` per mantenere la sessione lato server.

				// In caso di Sign Up, reindirizziamo al login
				if (isSignUp) {
					window.location.href = "/sign-in";
				} else {
					// In caso di Sign In, reindirizziamo alla dashboard
					window.location.href = "/";
				}
			}
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Visualizzazione dell'errore generale (se presente, impostato come 'root') */}
				{form.formState.errors.root && (
					<p className="text-sm font-medium text-red-500 text-center">
						{form.formState.errors.root.message}
					</p>
				)}

				{isSignUp && (
					<FormField
						control={form.control}
						name={"name" as keyof FormData}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm font-medium text-foreground">
									Full Name
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter your full name"
										className="h-12"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium text-foreground">
								Email
							</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="johndoe@gmail.com"
									className="h-12"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm font-medium text-foreground">
								Password
							</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										placeholder="minimum 8 characters"
										className="h-12 pr-12"
										{...field}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
										{showPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full h-12 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
				</Button>

				{!isSignUp && (
					<div className="text-center">
						<Link
							href="/forgot-password"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors">
							Forgot password?
						</Link>
					</div>
				)}

				{isSignUp && (
					<p className="text-xs text-muted-foreground text-center">
						By signing up, you agree to our{" "}
						<Link href="/terms" className="underline hover:no-underline">
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link href="/privacy" className="underline hover:no-underline">
							Privacy Policy
						</Link>
					</p>
				)}
			</form>
		</Form>
	);
}
