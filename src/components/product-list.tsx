"use client";
import React from "react";
import Card from "./card";
import { Product } from "@/lib/store/products";

const ProductList = ({ products }: { products: Product[] }) => {
	return (
		<div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{products.map((product, index) => (
				<Card
					key={index}
					{...product}
					title={product.name}
					description={product.description || ""}
					price={Number(product.price)}
					imageUrl={product.imageUrl || ""}
					category={product.category || ""}
					isNew={product.isNew}
					isSale={product.isSale}
					onAddToCart={() => console.log(`Added ${product.name} to cart`)}
					onToggleFavorite={() =>
						console.log(`Toggled favorite for ${product.name}`)
					}
				/>
			))}
		</div>
	);
};

export default ProductList;
