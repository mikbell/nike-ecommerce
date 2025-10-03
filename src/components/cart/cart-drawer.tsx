"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/stores/cart-store";
import CartIcon from "./cart-icon";
import CartItem from "./cart-item";
import CartSummary from "./cart-summary";
import { Trash2, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
	className?: string;
}

export default function CartDrawer({ className }: CartDrawerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { items, isEmpty, clearCart, totalItems } = useCartStore();
	const router = useRouter();

	const handleCheckout = () => {
		setIsOpen(false);
		router.push('/checkout');
	};

	const handleClearCart = () => {
		if (confirm('Sei sicuro di voler svuotare il carrello?')) {
			clearCart();
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<div>
					<CartIcon 
						onCartClick={() => setIsOpen(true)} 
						className={className}
					/>
				</div>
			</SheetTrigger>
			
			<SheetContent className="flex flex-col w-full sm:max-w-lg">
				<SheetHeader className="space-y-2.5 pr-6">
					<SheetTitle className="text-left flex items-center gap-2">
						<ShoppingBag className="h-5 w-5" />
						Carrello
						{!isEmpty && (
							<span className="text-sm font-normal text-gray-500">
								({totalItems} {totalItems === 1 ? 'articolo' : 'articoli'})
							</span>
						)}
					</SheetTitle>
					<SheetDescription className="text-left">
						{isEmpty 
							? "Il tuo carrello è vuoto. Aggiungi alcuni prodotti per iniziare!"
							: "Rivedi i tuoi articoli prima di procedere al checkout."
						}
					</SheetDescription>
				</SheetHeader>

				{isEmpty ? (
					// Stato carrello vuoto
					<div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4">
						<div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
							<ShoppingBag className="h-10 w-10 text-gray-400" />
						</div>
						<div className="space-y-2">
							<h3 className="font-medium text-gray-900">Il tuo carrello è vuoto</h3>
							<p className="text-sm text-gray-500 max-w-sm">
								Scopri la nostra collezione di scarpe Nike e aggiungi i tuoi prodotti preferiti.
							</p>
						</div>
						<SheetClose asChild>
							<Button onClick={() => router.push('/products')}>
								Continua a comprare
							</Button>
						</SheetClose>
					</div>
				) : (
					// Contenuto carrello con articoli
					<>
						{/* Header con pulsante svuota carrello */}
						<div className="flex items-center justify-between py-2">
							<p className="text-sm text-gray-600">
								{totalItems} {totalItems === 1 ? 'articolo' : 'articoli'} nel carrello
							</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearCart}
								className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
							>
								<Trash2 className="h-3 w-3 mr-1" />
								Svuota
							</Button>
						</div>

						<Separator />

						{/* Lista articoli */}
						<ScrollArea className="flex-1 -mx-6 px-6">
							<div className="space-y-0">
								{items.map((item) => (
									<CartItem 
										key={item.id} 
										item={item}
										showImage={true}
										compact={false}
									/>
								))}
							</div>
						</ScrollArea>

						<Separator />

						{/* Riepilogo e checkout */}
						<div className="space-y-4 pt-4">
							<CartSummary 
								showCheckoutButton={true}
								onCheckout={handleCheckout}
							/>

							{/* Pulsante continua acquisti */}
							<SheetClose asChild>
								<Button 
									variant="outline" 
									className="w-full"
									onClick={() => router.push('/products')}
								>
									Continua a comprare
								</Button>
							</SheetClose>
						</div>
					</>
				)}

				{/* Footer informazioni */}
				<div className="pt-4 mt-4 border-t border-gray-200">
					<div className="flex items-center justify-center text-xs text-gray-500 space-x-4">
						<span>🚚 Spedizione veloce</span>
						<span>•</span>
						<span>🔒 Pagamenti sicuri</span>
						<span>•</span>
						<span>↩️ Resi facili</span>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}