export type ProductVariant = {
	id: string;
	color: string;
	colorHex: string;
	images: string[];
	sizes: {
		size: string;
		inStock: boolean;
	}[];
};

export type ProductDetail = {
	id: string;
	title: string;
	description: string;
	price: number;
	originalPrice?: number;
	category: string;
	gender: string;
	isNew?: boolean;
	isSale?: boolean;
	variants: ProductVariant[];
	details: {
		materials: string[];
		features: string[];
		styleCode: string;
		colorway: string;
	};
	reviews: {
		averageRating: number;
		totalReviews: number;
	};
};

export const MOCK_PRODUCT_DETAILS: Record<string, ProductDetail> = {
	"1": {
		id: "1",
		title: "Air Jordan 1 Retro High OG",
		description: "The Air Jordan 1 Retro High OG remains true to its roots while laying the foundation for the future of the Jordan Brand. This classic silhouette features premium leather and iconic details.",
		price: 170,
		category: "Basketball",
		gender: "Unisex",
		isNew: true,
		variants: [
			{
				id: "1-black",
				color: "Black/White/Red",
				colorHex: "#000000",
				images: ["/shoes/shoe-1.jpg", "/shoes/shoe-1.jpg", "/shoes/shoe-1.jpg"],
				sizes: [
					{ size: "7", inStock: true },
					{ size: "7.5", inStock: true },
					{ size: "8", inStock: true },
					{ size: "8.5", inStock: false },
					{ size: "9", inStock: true },
					{ size: "9.5", inStock: true },
					{ size: "10", inStock: true },
					{ size: "10.5", inStock: true },
					{ size: "11", inStock: true },
					{ size: "11.5", inStock: false },
					{ size: "12", inStock: true },
				],
			},
		],
		details: {
			materials: ["Premium Leather", "Rubber Sole", "Textile Lining"],
			features: ["Nike Air Cushioning", "Padded Collar", "Perforated Toe Box", "Wings Logo"],
			styleCode: "555088-063",
			colorway: "Black/White-Gym Red",
		},
		reviews: {
			averageRating: 4.8,
			totalReviews: 1247,
		},
	},
	"2": {
		id: "2",
		title: "Nike Air Max 90",
		description: "Nothing as fly, nothing as comfortable. The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU accents.",
		price: 130,
		category: "Lifestyle",
		gender: "Men",
		variants: [
			{
				id: "2-white",
				color: "White/Grey/Black",
				colorHex: "#FFFFFF",
				images: ["/shoes/shoe-2.webp", "/shoes/shoe-2.webp", "/shoes/shoe-2.webp"],
				sizes: [
					{ size: "6", inStock: true },
					{ size: "7", inStock: true },
					{ size: "8", inStock: true },
					{ size: "9", inStock: true },
					{ size: "10", inStock: true },
					{ size: "11", inStock: false },
					{ size: "12", inStock: true },
					{ size: "13", inStock: true },
				],
			},
		],
		details: {
			materials: ["Leather and Textile Upper", "Rubber Waffle Outsole", "Foam Midsole"],
			features: ["Visible Air-Max Unit", "Waffle Traction Pattern", "Padded Ankle Collar"],
			styleCode: "CN8490-100",
			colorway: "White/Particle Grey-Black",
		},
		reviews: {
			averageRating: 4.6,
			totalReviews: 892,
		},
	},
	"3": {
		id: "3",
		title: "Nike Dunk Low",
		description: "Created for the hardwood but taken to the streets, the '80s b-ball icon returns with classic details and throwback hoops flair.",
		price: 110,
		category: "Lifestyle",
		gender: "Unisex",
		variants: [
			{
				id: "3-white-red",
				color: "White/Red/Blue",
				colorHex: "#FFFFFF",
				images: ["/shoes/shoe-3.webp", "/shoes/shoe-3.webp", "/shoes/shoe-3.webp"],
				sizes: [
					{ size: "6", inStock: true },
					{ size: "7", inStock: true },
					{ size: "8", inStock: true },
					{ size: "9", inStock: true },
					{ size: "10", inStock: false },
					{ size: "11", inStock: true },
					{ size: "12", inStock: true },
				],
			},
		],
		details: {
			materials: ["Leather Upper", "Rubber Cupsole", "Foam Sockliner"],
			features: ["Low-Top Silhouette", "Retro Basketball Design", "Padded Low-Cut Collar"],
			styleCode: "DD1391-104",
			colorway: "White/University Red-Deep Royal Blue",
		},
		reviews: {
			averageRating: 4.7,
			totalReviews: 2134,
		},
	},
};

export function getProductDetail(id: string): ProductDetail | null {
	return MOCK_PRODUCT_DETAILS[id] || null;
}

export function getRelatedProducts(currentProductId: string, limit: number = 4) {
	const allIds = Object.keys(MOCK_PRODUCT_DETAILS);
	return allIds
		.filter(id => id !== currentProductId)
		.slice(0, limit)
		.map(id => MOCK_PRODUCT_DETAILS[id]);
}
