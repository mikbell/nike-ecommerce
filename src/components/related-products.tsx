"use client";

import React from "react";
import Card from "./card";
import { Product } from "@/lib/store/products";

type ProductWithVariants = Product & {
	variants?: Array<{
		color: string;
		colorSlug?: string;
		hexCode?: string;
		images: string[];
		sizes: Array<{ size: string; inStock: boolean }>;
	}>;
	originalPrice?: number;
	colors?: string[];
	sizes?: string[];
	href?: string;
};

const RelatedProducts = ({
	relatedProducts,
}: {
	relatedProducts: ProductWithVariants[];
}) => {
	return (
		<div className="border-t border-light-400 pt-12">
			<h2 className="text-heading-2 font-jost text-dark-900 mb-8">
				You Might Also Like
			</h2>
			<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
				{relatedProducts.map((relatedProduct) => (
					<Card
						key={relatedProduct.id}
						id={relatedProduct.id}
						title={relatedProduct.name}
						description={relatedProduct.description || ""}
						price={relatedProduct.price || 0}
						originalPrice={relatedProduct.originalPrice || 0}
						imageUrl={
							relatedProduct.variants?.[0]?.images[0] || "/shoes/shoe-1.jpg"
						}
						category={relatedProduct.category || ""}
						colors={relatedProduct.variants?.map((v) => v.color) || []}
						sizes={relatedProduct.variants?.[0]?.sizes.map((s) => s.size) || []}
						isNew={relatedProduct.isNew || false}
						isSale={relatedProduct.isSale || false}
						href={`/products/${relatedProduct.slug}`}
						onAddToCart={() =>
							console.log(`Added ${relatedProduct.name} to cart`)
						}
						onToggleFavorite={() =>
							console.log(`Toggled favorite for ${relatedProduct.name}`)
						}
					/>
				))}
			</div>
		</div>
	);
};

export default RelatedProducts;
