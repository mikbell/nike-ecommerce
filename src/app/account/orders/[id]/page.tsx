"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	ArrowLeft,
	Package,
	Calendar,
	CreditCard,
	MapPin,
	Mail,
	Phone,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useAuth } from '@/lib/hooks/useAuth';
import { SelectAddress } from "@/lib/db/schema/addresses";

interface OrderDetails {
	id: string;
	orderNumber: string;
	status: string;
	totalAmount: string;
	subtotal: string;
	tax: string;
	shipping: string;
	currency: string;
	customerEmail: string;
	customerPhone: string;
	shippingAddress: SelectAddress | null;
	billingAddress: SelectAddress | null;
	createdAt: string;
	items: Array<{
		id: string;
		productName: string;
		variantName: string;
		variantSku: string | null;
		quantity: number;
		priceAtPurchase: string;
	}>;
}

export default function OrderDetailsPage() {
	const [order, setOrder] = useState<OrderDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { user, isLoading: isAuthLoading } = useAuth();
	const router = useRouter();
	const params = useParams();
	const orderId = params.id;

	useEffect(() => {
		const fetchOrderDetails = async () => {
			try {
				const response = await fetch(`/api/orders/${orderId}`);
				if (response.ok) {
					const data = await response.json();
					setOrder(data);
				} else {
					router.push("/account/orders");
				}
			} catch (error) {
				console.error("Errore recupero ordine:", error);
				router.push("/account/orders");
			} finally {
				setIsLoading(false);
			}
		};
		if (!isAuthLoading && !user) {
			router.push("/sign-in");
			return;
		}

		if (user && orderId) {
			fetchOrderDetails();
		}
	}, [user, isAuthLoading, orderId, router]);

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			pending: { label: "In attesa", variant: "secondary" as const },
			paid: { label: "Pagato", variant: "default" as const },
			processing: { label: "In elaborazione", variant: "default" as const },
			shipped: { label: "Spedito", variant: "default" as const },
			delivered: { label: "Consegnato", variant: "default" as const },
			cancelled: { label: "Annullato", variant: "destructive" as const },
			refunded: { label: "Rimborsato", variant: "secondary" as const },
		};

		const config = statusConfig[status as keyof typeof statusConfig] || {
			label: status,
			variant: "secondary" as const,
		};

		return <Badge variant={config.variant}>{config.label}</Badge>;
	};

	const formatAddress = (address: SelectAddress | null) => {
		if (!address) return "Indirizzo non disponibile";

		const parts = [
			address.line1,
			address.line2,
			`${address.postalCode} ${address.city}`,
			address.state,
			address.country,
		].filter(Boolean);

		return parts.join(", ");
	};

	if (isAuthLoading || isLoading) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p>Caricamento ordine...</p>
				</div>
			</div>
		);
	}

	if (!user || !order) {
		return null;
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			{/* Header */}
			<div className="mb-6">
				<Button variant="ghost" asChild className="mb-4">
					<Link href="/account/orders" className="flex items-center gap-2">
						<ArrowLeft className="w-4 h-4" />
						Torna agli ordini
					</Link>
				</Button>

				<div className="flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold mb-2">
							Ordine #{order.orderNumber}
						</h1>
						<p className="text-gray-600 flex items-center gap-2">
							<Calendar className="w-4 h-4" />
							{new Date(order.createdAt).toLocaleDateString("it-IT", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
					{getStatusBadge(order.status)}
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Prodotti ordinati */}
				<div className="md:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Package className="w-5 h-5" />
								Prodotti ordinati
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{order.items.map((item) => (
								<div
									key={item.id}
									className="flex justify-between items-center p-4 border rounded-lg">
									<div className="flex-1">
										<h4 className="font-medium">{item.productName}</h4>
										<p className="text-sm text-gray-600">{item.variantName}</p>
										{item.variantSku && (
											<p className="text-xs text-gray-500">
												SKU: {item.variantSku}
											</p>
										)}
										<p className="text-sm text-gray-600">
											Quantità: {item.quantity}
										</p>
									</div>
									<div className="text-right">
										<p className="font-medium">€{item.priceAtPurchase}</p>
										<p className="text-sm text-gray-600">
											€
											{(
												parseFloat(item.priceAtPurchase) * item.quantity
											).toFixed(2)}{" "}
											tot.
										</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Indirizzi */}
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<MapPin className="w-5 h-5" />
									Indirizzo di spedizione
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm">
									{formatAddress(order.shippingAddress)}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<CreditCard className="w-5 h-5" />
									Indirizzo di fatturazione
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm">{formatAddress(order.billingAddress)}</p>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Sidebar riepilogo */}
				<div className="space-y-6">
					{/* Riepilogo ordine */}
					<Card>
						<CardHeader>
							<CardTitle>Riepilogo ordine</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between">
								<span>Subtotale:</span>
								<span>€{order.subtotal}</span>
							</div>
							<div className="flex justify-between">
								<span>Spedizione:</span>
								<span>€{order.shipping}</span>
							</div>
							<div className="flex justify-between">
								<span>Tasse (IVA):</span>
								<span>€{order.tax}</span>
							</div>
							<Separator />
							<div className="flex justify-between font-bold text-lg">
								<span>Totale:</span>
								<span>€{order.totalAmount}</span>
							</div>
						</CardContent>
					</Card>

					{/* Informazioni contatto */}
					<Card>
						<CardHeader>
							<CardTitle>Informazioni di contatto</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-3">
								<Mail className="w-4 h-4 text-gray-600" />
								<span className="text-sm">{order.customerEmail}</span>
							</div>
							{order.customerPhone && (
								<div className="flex items-center gap-3">
									<Phone className="w-4 h-4 text-gray-600" />
									<span className="text-sm">{order.customerPhone}</span>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
