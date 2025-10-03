"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/stores/cart-store";

interface CartIconProps {
	onCartClick: () => void;
	className?: string;
}

export default function CartIcon({ onCartClick, className }: CartIconProps) {
	const { totalItems } = useCartStore();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={onCartClick}
			className={`relative ${className}`}
			aria-label={`Carrello con ${totalItems} articoli`}
		>
			<ShoppingBag className="h-5 w-5" />
			{totalItems > 0 && (
				<Badge
					variant="destructive"
					className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs font-bold flex items-center justify-center rounded-full"
				>
					{totalItems > 99 ? '99+' : totalItems}
				</Badge>
			)}
		</Button>
	);
}