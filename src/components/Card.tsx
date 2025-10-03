import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { HeartIcon } from "lucide-react";
import { Badge } from "./ui/badge";

interface CardProps {
	id?: string | number;
	title: string;
	description?: string;
	price: number;
	originalPrice?: number;
	imageUrl: string;
	imageAlt?: string;
	category?: string;
	colors?: string[];
	sizes?: string[];
	isNew?: boolean;
	isSale?: boolean;
	href?: string;
	className?: string;
	onAddToCart?: () => void;
	onToggleFavorite?: () => void;
	isFavorite?: boolean;
}

const Card = ({
	title,
	description,
	price,
	originalPrice,
	imageUrl,
	imageAlt,
	category,
	colors = [],
	sizes = [],
	isNew = false,
	isSale = false,
	href,
	className,
	onAddToCart,
	onToggleFavorite,
	isFavorite = false,
}: CardProps) => {
	const cardContent = (
		<div
			className={cn(
				"group bg-light-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:shadow-black/5 transition-all duration-300 ring-1 ring-border/50",
				className
			)}>
			{/* Image Container */}
			<div className="relative aspect-square overflow-hidden bg-light-200">
				<Image
					src={imageUrl}
					alt={imageAlt || title}
					fill
					className="object-cover group-hover:scale-105 transition-transform duration-300"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>

				{/* Badges */}
				<div className="absolute top-3 left-3 flex flex-col gap-2">
					{isNew && (
						<Badge>New</Badge>
					)}
					{isSale && (
						<Badge variant="destructive">Sale</Badge>
					)}
				</div>

				{/* Favorite Button */}
				{onToggleFavorite && (
					<Button
						variant="outline"
						size="icon"
						className={cn(
							"absolute top-3 right-3",
							isFavorite ? "text-red" : "text-dark-700"
						)}
						aria-label={
							isFavorite ? "Remove from favorites" : "Add to favorites"
						}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onToggleFavorite();
						}}>
						<HeartIcon
							className={cn(
								"w-5 h-5",
								isFavorite ? "text-red fill-red" : "text-dark-700"
							)}
						/>
					</Button>
				)}

				{/* Quick Add to Cart - appears on hover */}
				{onAddToCart && (
					<div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<Button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onAddToCart();
							}}
							className="w-full">
							Add to Cart
						</Button>
					</div>
				)}
			</div>

			{/* Content */}
			<div className="p-4">
				{/* Category */}
				{category && (
					<p className="text-dark-700 text-caption font-medium mb-1 uppercase tracking-wide">
						{category}
					</p>
				)}

				{/* Title */}
				<h3 className="text-dark-900 text-body-medium font-medium mb-2 line-clamp-2">
					{title}
				</h3>

				{/* Description */}
				{description && (
					<p className="text-dark-700 text-body mb-3 line-clamp-2">
						{description}
					</p>
				)}

				{/* Colors */}
				{colors.length > 0 && (
					<div className="flex items-center gap-2 mb-3">
						<span className="text-dark-700 text-caption">Colors:</span>
						<div className="flex gap-1">
							{colors.slice(0, 4).map((color, index) => (
								<div
									key={index}
									className="w-4 h-4 rounded-full border border-light-400"
									style={{ backgroundColor: color.toLowerCase() }}
									title={color}
								/>
							))}
							{colors.length > 4 && (
								<span className="text-dark-700 text-caption ml-1">
									+{colors.length - 4}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Sizes */}
				{sizes.length > 0 && (
					<div className="flex items-center gap-2 mb-3">
						<span className="text-dark-700 text-caption">Sizes:</span>
						<div className="flex gap-1 flex-wrap">
							{sizes.slice(0, 3).map((size, index) => (
								<span
									key={index}
									className="text-dark-700 text-caption bg-light-200 px-2 py-1 rounded">
									{size}
								</span>
							))}
							{sizes.length > 3 && (
								<span className="text-dark-700 text-caption">
									+{sizes.length - 3} more
								</span>
							)}
						</div>
					</div>
				)}

				{/* Price */}
				<div className="flex items-center gap-2">
					<span className="text-dark-900 text-body-medium font-medium">
						€{price.toFixed(2)}
					</span>
					{originalPrice && originalPrice > price && (
						<>
							<span className="text-dark-500 text-body line-through">
								€{originalPrice.toFixed(2)}
							</span>
							<span className="text-red text-caption font-medium">
								{Math.round(((originalPrice - price) / originalPrice) * 100)}%
								off
							</span>
						</>
					)}
				</div>
			</div>
		</div>
	);

	// If href is provided, wrap in Link
	if (href) {
		return (
			<Link href={href} className="block">
				{cardContent}
			</Link>
		);
	}

	return cardContent;
};

export default Card;
