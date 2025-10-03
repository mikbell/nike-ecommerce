"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductBySlug } from "@/lib/db/queries/products";

type DatabaseVariant = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>['variants'][0];

interface ProductGalleryProps {
	variants: DatabaseVariant[];
	productTitle: string;
}

export default function ProductGallery({ variants, productTitle }: ProductGalleryProps) {
	const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [imageError, setImageError] = useState(false);

	const currentVariant = variants[selectedVariantIndex];
	const validImages = currentVariant?.images.filter(Boolean) || [];
	const currentImage = validImages[selectedImageIndex];

	const handleThumbnailClick = (index: number) => {
		setSelectedImageIndex(index);
		setImageError(false);
	};

	const handleVariantChange = (index: number) => {
		setSelectedVariantIndex(index);
		setSelectedImageIndex(0);
		setImageError(false);
	};

	const handlePrevImage = () => {
		setSelectedImageIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
		setImageError(false);
	};

	const handleNextImage = () => {
		setSelectedImageIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
		setImageError(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			handlePrevImage();
		} else if (e.key === "ArrowRight") {
			handleNextImage();
		}
	};

	if (validImages.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-96 bg-light-200 rounded-lg">
				<ImageOff className="w-16 h-16 text-dark-500 mb-4" />
				<p className="text-body text-dark-700">No images available</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="relative aspect-square bg-light-200 rounded-lg overflow-hidden group" onKeyDown={handleKeyDown} tabIndex={0}>
				{!imageError && currentImage ? (
					<>
						<Image
							src={currentImage}
							alt={`${productTitle} - ${currentVariant.color}`}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 100vw, 50vw"
							priority
							onError={() => setImageError(true)}
						/>
						
						{validImages.length > 1 && (
							<>
								<button
									onClick={handlePrevImage}
									className="absolute left-4 top-1/2 -translate-y-1/2 bg-light-100/90 hover:bg-light-100 text-dark-900 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100"
									aria-label="Previous image">
									<ChevronLeft className="w-6 h-6" />
								</button>
								<button
									onClick={handleNextImage}
									className="absolute right-4 top-1/2 -translate-y-1/2 bg-light-100/90 hover:bg-light-100 text-dark-900 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100"
									aria-label="Next image">
									<ChevronRight className="w-6 h-6" />
								</button>
							</>
						)}
					</>
				) : (
					<div className="flex flex-col items-center justify-center h-full">
						<ImageOff className="w-16 h-16 text-dark-500 mb-4" />
						<p className="text-body text-dark-700">Failed to load image</p>
					</div>
				)}
			</div>

			{validImages.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
					{validImages.map((image, index) => (
						<button
							key={index}
							onClick={() => handleThumbnailClick(index)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									handleThumbnailClick(index);
								}
							}}
							className={cn(
								"relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200",
								selectedImageIndex === index
									? "border-dark-900 ring-2 ring-dark-900 ring-offset-2"
									: "border-light-400 hover:border-dark-500"
							)}
							aria-label={`View image ${index + 1}`}>
							<Image
								src={image}
								alt={`${productTitle} thumbnail ${index + 1}`}
								fill
								className="object-cover"
								sizes="80px"
							/>
						</button>
					))}
				</div>
			)}

			{variants.length > 1 && (
				<div className="flex flex-col gap-2">
					<p className="text-body-medium font-medium text-dark-900">Color: {currentVariant.color}</p>
					<div className="flex gap-2 flex-wrap">
						{variants.map((variant, index) => (
						<button
							key={variant.colorSlug}
							onClick={() => handleVariantChange(index)}
								className={cn(
									"w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
									selectedVariantIndex === index
										? "border-dark-900 ring-2 ring-dark-900 ring-offset-2"
										: "border-light-400 hover:border-dark-500"
								)}
							style={{ backgroundColor: variant.hexCode }}
							aria-label={`Select ${variant.color} color`}>
								{selectedVariantIndex === index && (
									<span className="text-light-100 text-xs">✓</span>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
