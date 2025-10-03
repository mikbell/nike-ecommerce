"use client";
import React from "react";
import Card from "./card";
import { getAllProducts } from "@/lib/db/queries/products";

type ProductListItem = Awaited<ReturnType<typeof getAllProducts>>[0];

const ProductList = ({ products }: { products: ProductListItem[] }) => {
	return (
		<div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{products.map((product) => (
				<Card
					key={product.id}
					id={product.id}
					title={product.title}
					description={product.description}
					price={product.price}
					originalPrice={product.originalPrice}
					imageUrl={product.imageUrl}
					category={product.category}
					colors={product.colors}
					sizes={product.sizes}
					isNew={product.isNew}
					isSale={product.isSale}
					href={product.href}
					onAddToCart={() => console.log(`Added ${product.title} to cart`)}
					onToggleFavorite={() =>
						console.log(`Toggled favorite for ${product.title}`)
					}
				/>
			))}
		</div>
	);
};

export default ProductList;
