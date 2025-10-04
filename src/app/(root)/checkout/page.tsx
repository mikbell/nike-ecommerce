"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cart-store";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CartItem from "@/components/cart/cart-item";
import CartSummary from "@/components/cart/cart-summary";
import { ArrowLeft, CreditCard, Truck, Shield } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CheckoutPage() {
	const router = useRouter();
	const { items, isEmpty, totalPrice, clearCart, subtotal, tax, shipping } = useCartStore();
	const { user, isLoading: isAuthLoading } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	
	// Form state
	const [formData, setFormData] = useState({
		// Informazioni di spedizione
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		postalCode: "",
		country: "Italia",
		// Note aggiuntive
		notes: "",
		// Metodo di pagamento
		paymentMethod: "card",
	});

	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push("/sign-in");
			toast.error("Devi effettuare l'accesso per completare l'ordine");
			return;
		}
		
		if (isEmpty) {
			router.push("/");
			toast.error("Il carrello è vuoto");
		}
	}, [isEmpty, isAuthLoading, user, router]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Validazione form
		const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'postalCode'];
		const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
		
		if (missingFields.length > 0) {
			toast.error("Per favore compila tutti i campi obbligatori");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					shippingInfo: formData,
					items: items.map(item => ({
						variantId: item.variantId,
						quantity: item.quantity,
						price: item.price,
					})),
					subtotal,
					tax,
					shipping,
					totalAmount: totalPrice,
				}),
			});

			if (!response.ok) {
				throw new Error('Errore durante la creazione dell\'ordine');
			}

			const result = await response.json();

			clearCart();
			toast.success("Ordine completato con successo!");
			router.push(`/order-confirmation?orderNumber=${result.order.orderNumber}`);

		} catch (error) {
			console.error("Errore durante il checkout:", error);
			toast.error("Errore durante il checkout. Riprova.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isEmpty || isAuthLoading) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<Link 
						href="/" 
						className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
					>
						<ArrowLeft className="h-4 w-4 mr-1" />
						Torna allo shopping
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
					<p className="text-gray-600">Completa il tuo ordine in modo sicuro</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Form di checkout */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Truck className="h-5 w-5" />
									Informazioni di spedizione
								</CardTitle>
								<CardDescription>
									Inserisci le informazioni per la consegna
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="firstName">Nome *</Label>
										<Input
											id="firstName"
											name="firstName"
											value={formData.firstName}
											onChange={handleInputChange}
											required
										/>
									</div>
									<div>
										<Label htmlFor="lastName">Cognome *</Label>
										<Input
											id="lastName"
											name="lastName"
											value={formData.lastName}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>
								
								<div>
									<Label htmlFor="email">Email *</Label>
									<Input
										id="email"
										name="email"
										type="email"
										value={formData.email}
										onChange={handleInputChange}
										required
									/>
								</div>
								
								<div>
									<Label htmlFor="phone">Telefono</Label>
									<Input
										id="phone"
										name="phone"
										type="tel"
										value={formData.phone}
										onChange={handleInputChange}
									/>
								</div>
								
								<div>
									<Label htmlFor="address">Indirizzo *</Label>
									<Input
										id="address"
										name="address"
										value={formData.address}
										onChange={handleInputChange}
										required
									/>
								</div>
								
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="city">Città *</Label>
										<Input
											id="city"
											name="city"
											value={formData.city}
											onChange={handleInputChange}
											required
										/>
									</div>
									<div>
										<Label htmlFor="postalCode">CAP *</Label>
										<Input
											id="postalCode"
											name="postalCode"
											value={formData.postalCode}
											onChange={handleInputChange}
											required
										/>
									</div>
								</div>
								
								<div>
									<Label htmlFor="notes">Note aggiuntive</Label>
									<Textarea
										id="notes"
										name="notes"
										value={formData.notes}
										onChange={handleInputChange}
										placeholder="Istruzioni per la consegna, note speciali..."
										rows={3}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Metodo di pagamento */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="h-5 w-5" />
									Metodo di pagamento
								</CardTitle>
								<CardDescription>
									Seleziona come vuoi pagare il tuo ordine
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
										<div className="flex items-center gap-3">
											<CreditCard className="h-5 w-5 text-blue-600" />
											<div>
												<p className="font-medium">Carta di credito/debito</p>
												<p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
											</div>
										</div>
										<Badge variant="secondary">Sicuro</Badge>
									</div>
									
									<div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
										<div className="flex items-center gap-2 mb-2">
											<Shield className="h-4 w-4" />
											<span className="font-medium">Pagamento sicuro</span>
										</div>
										<p>Il pagamento verrà processato in modo sicuro. I tuoi dati della carta non vengono salvati sui nostri server.</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Riepilogo ordine */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Riepilogo ordine</CardTitle>
								<CardDescription>
									Controlla i tuoi articoli prima di completare l&apos;ordine
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{items.map((item) => (
										<CartItem 
											key={item.id} 
											item={item}
											showImage={true}
											compact={true}
										/>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Totali e pulsante ordine */}
						<div className="space-y-4">
							<CartSummary 
								showCheckoutButton={false}
								className="sticky top-4"
							/>
							
							<Button 
								onClick={handleSubmit} 
								disabled={isLoading}
								className="w-full"
								size="lg"
							>
								{isLoading ? "Processando..." : `Completa ordine - €${totalPrice.toFixed(2)}`}
							</Button>
							
							<div className="text-center text-sm text-gray-500">
								<p>Cliccando &quot;Completa ordine&quot; accetti i nostri</p>
								<div className="flex items-center justify-center gap-1 mt-1">
									<Link href="/terms" className="text-blue-600 hover:underline">
										Termini di servizio
									</Link>
									<span>e</span>
									<Link href="/privacy" className="text-blue-600 hover:underline">
										Privacy Policy
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
