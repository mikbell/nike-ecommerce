"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";
import { Truck, Shield, RotateCcw } from "lucide-react";

interface CartSummaryProps {
	showCheckoutButton?: boolean;
	onCheckout?: () => void;
	className?: string;
}

export default function CartSummary({ 
	showCheckoutButton = true, 
	onCheckout,
	className 
}: CartSummaryProps) {
	const { subtotal, tax, shipping, totalPrice, totalItems, isEmpty } = useCartStore();

	const freeShippingThreshold = 50;
	const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
	const hasEarnedFreeShipping = remainingForFreeShipping === 0;

	return (
		<div className={`bg-gray-50 p-6 rounded-lg space-y-4 ${className}`}>
			{/* Spedizione gratuita info */}
			{!hasEarnedFreeShipping && !isEmpty && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<Truck className="h-4 w-4 text-blue-600" />
						<span className="text-sm font-medium text-blue-900">
							Spedizione gratuita
						</span>
					</div>
					<p className="text-sm text-blue-700">
						Aggiungi ancora <span className="font-semibold">€{remainingForFreeShipping.toFixed(2)}</span> per ottenere la spedizione gratuita!
					</p>
					<div className="mt-2 w-full bg-blue-200 rounded-full h-2">
						<div 
							className="bg-blue-600 h-2 rounded-full transition-all duration-300"
							style={{ 
								width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` 
							}}
						/>
					</div>
				</div>
			)}

			{hasEarnedFreeShipping && !isEmpty && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<div className="flex items-center gap-2">
						<Truck className="h-4 w-4 text-green-600" />
						<span className="text-sm font-medium text-green-900">
							🎉 Hai ottenuto la spedizione gratuita!
						</span>
					</div>
				</div>
			)}

			{/* Riepilogo prezzi */}
			<div className="space-y-3">
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">
						Subtotale ({totalItems} {totalItems === 1 ? 'articolo' : 'articoli'})
					</span>
					<span className="font-medium">€{subtotal.toFixed(2)}</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Spedizione</span>
					<span className="font-medium">
						{shipping === 0 ? (
							<span className="text-green-600 font-semibold">Gratuita</span>
						) : (
							`€${shipping.toFixed(2)}`
						)}
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-gray-600">IVA (22%)</span>
					<span className="font-medium">€{tax.toFixed(2)}</span>
				</div>

				<Separator />

				<div className="flex justify-between text-lg font-semibold">
					<span>Totale</span>
					<span>€{totalPrice.toFixed(2)}</span>
				</div>
			</div>

			{/* Pulsante checkout */}
			{showCheckoutButton && (
				<Button 
					className="w-full" 
					size="lg"
					disabled={isEmpty}
					onClick={onCheckout}
				>
					{isEmpty ? 'Carrello vuoto' : 'Procedi al checkout'}
				</Button>
			)}

			{/* Informazioni aggiuntive */}
			<div className="space-y-2 text-xs text-gray-500">
				<div className="flex items-center gap-2">
					<Shield className="h-3 w-3" />
					<span>Pagamenti sicuri e protetti</span>
				</div>
				<div className="flex items-center gap-2">
					<RotateCcw className="h-3 w-3" />
					<span>Resi gratuiti entro 30 giorni</span>
				</div>
			</div>

			{/* Badge offerte */}
			{!isEmpty && (
				<div className="pt-4 border-t border-gray-200">
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary" className="text-xs">
							🚚 Spedizione veloce
						</Badge>
						<Badge variant="secondary" className="text-xs">
							💳 Pagamento sicuro
						</Badge>
					</div>
				</div>
			)}
		</div>
	);
}