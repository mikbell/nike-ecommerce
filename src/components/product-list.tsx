"use client";
import React from "react";
import Card from "./card";
import { getAllProducts } from "@/lib/db/queries/products";
import { useCartStore } from "@/lib/stores/cart-store";
import { convertProductToCartItem, canAddToCart } from "@/lib/utils/cart-utils";
import { toast } from "sonner";

type ProductListItem = Awaited<ReturnType<typeof getAllProducts>>[0];

const ProductList = ({ products }: { products: ProductListItem[] }) => {
	const { addItem } = useCartStore();

	const handleAddToCart = async (product: ProductListItem) => {
		const validation = canAddToCart({
			id: product.id,
			title: product.title,
			slug: product.slug,
			price: product.price,
			originalPrice: product.originalPrice,
			imageUrl: product.imageUrl,
			category: product.category,
			colors: product.colors,
			sizes: product.sizes,
		});

		if (!validation.canAdd) {
			toast.error(validation.reason || "Impossibile aggiungere al carrello");
			return;
		}

		const cartItem = convertProductToCartItem({
			id: product.id,
			title: product.title,
			slug: product.slug,
			price: product.price,
			originalPrice: product.originalPrice,
			imageUrl: product.imageUrl,
			category: product.category,
			colors: product.colors,
			sizes: product.sizes,
		});

		await addItem(cartItem);
	};

	const handleToggleFavorite = (product: ProductListItem) => {
		// TODO: Implementare funzionalità wishlist
		console.log(`Toggled favorite for ${product.title}`);
		toast.info("Funzionalità wishlist in arrivo!");
	};

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
					onAddToCart={() => handleAddToCart(product)}
					onToggleFavorite={() => handleToggleFavorite(product)}
				/>
			))}
		</div>
	);
};

export default ProductList;
