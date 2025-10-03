"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem as CartItemType } from "@/lib/types/cart";
import { useCartStore } from "@/lib/stores/cart-store";
import { Badge } from "@/components/ui/badge";

interface CartItemProps {
	item: CartItemType;
	showImage?: boolean;
	compact?: boolean;
}

export default function CartItem({ item, showImage = true, compact = false }: CartItemProps) {
	const { updateQuantity, removeItem } = useCartStore();
	const [isUpdating, setIsUpdating] = useState(false);

	const handleQuantityChange = async (newQuantity: number) => {
		if (newQuantity < 0 || newQuantity > item.inStock) return;
		
		setIsUpdating(true);
		updateQuantity(item.id, newQuantity);
		
		// Simula un delay per l'animazione
		setTimeout(() => setIsUpdating(false), 300);
	};

	const handleRemove = () => {
		removeItem(item.id);
	};

	const totalPrice = item.price * item.quantity;
	const hasDiscount = item.originalPrice && item.originalPrice > item.price;

	return (
		<div className={`flex gap-4 py-4 ${!compact && 'border-b border-gray-200'}`}>
			{showImage && (
				<div className="flex-shrink-0">
					<Link href={`/products/${item.slug}`}>
						<Image
							src={item.imageUrl}
							alt={item.name}
							width={compact ? 60 : 80}
							height={compact ? 60 : 80}
							className="rounded-md object-cover hover:opacity-90 transition-opacity"
						/>
					</Link>
				</div>
			)}

			<div className="flex-1 space-y-2">
				{/* Nome prodotto e link */}
				<div>
					<Link 
						href={`/products/${item.slug}`}
						className="font-medium text-gray-900 hover:text-gray-700 line-clamp-2"
					>
						{item.name}
					</Link>
					<div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
						<span>{item.brand}</span>
						<span>•</span>
						<span>{item.category}</span>
					</div>
				</div>

				{/* Varianti (colore e taglia) */}
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1">
						<span className="text-xs text-gray-500">Colore:</span>
						<div className="flex items-center gap-1">
							{item.colorHex && (
								<div 
									className="w-3 h-3 rounded-full border border-gray-300"
									style={{ backgroundColor: item.colorHex }}
								/>
							)}
							<span className="text-sm text-gray-700">{item.color}</span>
						</div>
					</div>
					<div className="flex items-center gap-1">
						<span className="text-xs text-gray-500">Taglia:</span>
						<Badge variant="outline" className="text-xs">
							{item.size}
						</Badge>
					</div>
				</div>

				{/* Prezzo e quantità */}
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-gray-900">
								€{totalPrice.toFixed(2)}
							</span>
							{hasDiscount && (
								<span className="text-sm text-gray-500 line-through">
									€{(item.originalPrice! * item.quantity).toFixed(2)}
								</span>
							)}
						</div>
						<div className="text-sm text-gray-500">
							€{item.price.toFixed(2)} cad.
							{hasDiscount && (
								<span className="text-red-600 ml-1">
									(-{Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)}%)
								</span>
							)}
						</div>
					</div>

					{/* Controlli quantità */}
					<div className="flex items-center gap-2">
						{!compact && (
							<div className="flex items-center border rounded-md">
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => handleQuantityChange(item.quantity - 1)}
									disabled={isUpdating || item.quantity <= 1}
								>
									<Minus className="h-3 w-3" />
								</Button>
								<Input
									type="number"
									min={1}
									max={item.inStock}
									value={item.quantity}
									onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
									className="h-8 w-12 text-center border-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
									disabled={isUpdating}
								/>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => handleQuantityChange(item.quantity + 1)}
									disabled={isUpdating || item.quantity >= item.inStock}
								>
									<Plus className="h-3 w-3" />
								</Button>
							</div>
						)}
						
						{compact && (
							<span className="text-sm text-gray-600 px-2">Qty: {item.quantity}</span>
						)}

						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
							onClick={handleRemove}
							aria-label="Rimuovi dal carrello"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Avviso stock */}
				{item.quantity >= item.inStock && (
					<div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
						Solo {item.inStock} disponibili
					</div>
				)}
			</div>
		</div>
	);
}