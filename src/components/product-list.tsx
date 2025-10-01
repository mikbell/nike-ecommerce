"use client"
import React from "react";
import Card from "./card";

const ProductList = () => {
	const sampleShoes = [
		{
			title: "Air Jordan 1 Retro High OG",
			description: "Classic basketball shoe with premium leather construction",
			price: 170,
			originalPrice: 200,
			imageUrl: "/shoes/shoe-1.jpg", // Using placeholder from public folder
			category: "Basketball",
			colors: ["Black", "White", "Red"],
			sizes: ["8", "9", "10", "11"],
			isNew: true,
			href: "/product/air-jordan-1",
		},
		{
			title: "Nike Air Max 90",
			description: "Iconic running shoe with visible Air cushioning",
			price: 120,
			imageUrl: "/shoes/shoe-2.webp", // Using placeholder from public folder
			category: "Running",
			colors: ["White", "Black", "Grey"],
			sizes: ["7", "8", "9", "10", "11", "12"],
			isSale: true,
			href: "/product/air-max-90",
		},
		{
			title: "Nike Dunk Low",
			description: "Versatile lifestyle shoe with classic basketball DNA",
			price: 100,
			imageUrl: "/shoes/shoe-3.webp", // Using placeholder from public folder
			category: "Lifestyle",
			colors: ["White", "Black"],
			sizes: ["8", "9", "10"],
			href: "/product/dunk-low",
		},
	];

	return (
		<div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{sampleShoes.map((shoe, index) => (
				<Card
					key={index}
					{...shoe}
					onAddToCart={() => console.log(`Added ${shoe.title} to cart`)}
					onToggleFavorite={() =>
						console.log(`Toggled favorite for ${shoe.title}`)
					}
				/>
			))}
		</div>
	);
};

export default ProductList;
