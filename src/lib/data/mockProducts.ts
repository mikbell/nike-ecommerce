export type MockProduct = {
	id: string;
	title: string;
	description: string;
	price: number;
	originalPrice?: number;
	imageUrl: string;
	category: string;
	gender: string;
	colors: string[];
	sizes: string[];
	isNew?: boolean;
	isSale?: boolean;
	href: string;
	createdAt: Date;
};

export const MOCK_PRODUCTS: MockProduct[] = [
	{
		id: "1",
		title: "Air Jordan 1 Retro High OG",
		description:
			"The Air Jordan 1 Retro High OG remains true to its roots while laying the foundation for the future of the Jordan Brand. This classic silhouette features premium leather and iconic details.",
		price: 170,
		imageUrl: "/shoes/shoe-1.jpg",
		category: "Basketball",
		gender: "Unisex",
		colors: ["Black", "White", "Red"],
		sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
		isNew: true,
		href: "/products/air-jordan-1",
		createdAt: new Date("2025-01-15"),
	},
	{
		id: "2",
		title: "Nike Air Max 90",
		description:
			"Nothing as fly, nothing as comfortable. The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU accents.",
		price: 130,
		imageUrl: "/shoes/shoe-2.webp",
		category: "Lifestyle",
		gender: "Men",
		colors: ["White", "Grey", "Black"],
		sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
		href: "/products/air-max-90",
		createdAt: new Date("2025-01-10"),
	},
	{
		id: "3",
		title: "Nike Dunk Low",
		description:
			"Created for the hardwood but taken to the streets, the '80s b-ball icon returns with classic details and throwback hoops flair.",
		price: 110,
		imageUrl: "/shoes/shoe-3.webp",
		category: "Lifestyle",
		gender: "Unisex",
		colors: ["White", "Red", "Blue"],
		sizes: ["6", "7", "8", "9", "10", "11", "12"],
		href: "/products/dunk-low",
		createdAt: new Date("2025-01-12"),
	},
	{
		id: "4",
		title: "Nike Blazer Mid '77",
		description:
			"Styled for the '70s. Loved in the '80s. Classic in the '90s. Ready for the future. The Nike Blazer Mid '77 delivers a timeless design that's easy to wear.",
		price: 100,
		imageUrl: "/shoes/shoe-4.webp",
		category: "Lifestyle",
		gender: "Women",
		colors: ["White", "Black", "Green"],
		sizes: ["6", "7", "8", "9", "10", "11", "12"],
		href: "/products/blazer-mid-77",
		createdAt: new Date("2025-01-08"),
	},
	{
		id: "5",
		title: "Nike Air Force 1 '07",
		description:
			"The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash.",
		price: 110,
		originalPrice: 130,
		imageUrl: "/shoes/shoe-5.avif",
		category: "Lifestyle",
		gender: "Unisex",
		colors: ["White", "Black", "Grey"],
		sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
		isSale: true,
		href: "/products/air-force-1",
		createdAt: new Date("2025-01-05"),
	},
	{
		id: "6",
		title: "Nike React Infinity Run Flyknit 3",
		description:
			"Keep running. The Nike React Infinity Run 3 keeps your feet secure and cushioned. We added more foam and improved the upper to give you a stable, smooth ride.",
		price: 160,
		imageUrl: "/shoes/shoe-6.avif",
		category: "Running",
		gender: "Men",
		colors: ["Black", "White", "Blue"],
		sizes: ["7", "8", "9", "10", "11", "12"],
		isNew: true,
		href: "/products/react-infinity-run",
		createdAt: new Date("2025-01-18"),
	},
	{
		id: "7",
		title: "Nike Pegasus 40",
		description:
			"Run your best in the Nike Pegasus 40. A springy sensation powered by a waffle outsole and Nike React foam to help you feel supported, energized and ready to keep going.",
		price: 140,
		imageUrl: "/shoes/shoe-7.avif",
		category: "Running",
		gender: "Women",
		colors: ["Grey", "Green", "Orange"],
		sizes: ["7", "8", "9", "10", "11", "12"],
		href: "/products/pegasus-40",
		createdAt: new Date("2025-01-14"),
	},
	{
		id: "8",
		title: "Nike Metcon 8",
		description:
			"From high-intensity lifts to cardio, the Nike Metcon 8 helps you power through. Hyperlift heel wedges provide stability while you lift, and grippy rubber wraps around the sides.",
		price: 150,
		imageUrl: "/shoes/shoe-8.avif",
		category: "Training",
		gender: "Men",
		colors: ["Black", "Orange", "White"],
		sizes: ["7", "8", "9", "10", "11", "12"],
		href: "/products/metcon-8",
		createdAt: new Date("2025-01-11"),
	},
	{
		id: "9",
		title: "Nike SB Dunk Low Pro",
		description:
			"The Nike SB Dunk Low Pro is ready for the skate park with durable materials, classic colorways, and a low-profile design for excellent board feel.",
		price: 115,
		originalPrice: 135,
		imageUrl: "/shoes/shoe-9.avif",
		category: "Skateboarding",
		gender: "Unisex",
		colors: ["Black", "White", "Red"],
		sizes: ["7", "8", "9", "10", "11", "12"],
		isSale: true,
		href: "/products/sb-dunk-low",
		createdAt: new Date("2025-01-09"),
	},
	{
		id: "10",
		title: "Nike Wildhorse 7",
		description:
			"Take on rocky trails with the Nike Wildhorse 7. Rugged traction, reinforced heel, and responsive cushioning help you conquer uneven terrain with confidence.",
		price: 140,
		imageUrl: "/shoes/shoe-10.avif",
		category: "Trail Running",
		gender: "Women",
		colors: ["Grey", "Orange", "Black"],
		sizes: ["6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
		href: "/products/wildhorse-7",
		createdAt: new Date("2025-01-13"),
	},
	{
		id: "11",
		title: "Nike Air Zoom Pegasus 39",
		description:
			"The Nike Air Zoom Pegasus 39 provides the speed and support you need for your everyday runs with responsive cushioning and a comfortable fit.",
		price: 130,
		imageUrl: "/shoes/shoe-11.avif",
		category: "Running",
		gender: "Men",
		colors: ["Blue", "White", "Black"],
		sizes: ["7", "8", "9", "10", "11", "12", "13"],
		href: "/products/pegasus-39",
		createdAt: new Date("2025-01-07"),
	},
	{
		id: "12",
		title: "Nike Air Max Plus",
		description:
			"Let your attitude shine in the Nike Air Max Plus. Featuring the original Tuned Air technology for exceptional stability and cushioning with every step.",
		price: 165,
		imageUrl: "/shoes/shoe-12.avif",
		category: "Lifestyle",
		gender: "Men",
		colors: ["Black", "Blue", "Grey"],
		sizes: ["7", "8", "9", "10", "11", "12"],
		isNew: true,
		href: "/products/air-max-plus",
		createdAt: new Date("2025-01-20"),
	},
	{
		id: "13",
		title: "Nike Free Run 5.0",
		description:
			"Experience natural motion with the Nike Free Run 5.0. Flexible sole and lightweight design make it feel like you're running barefoot.",
		price: 120,
		originalPrice: 150,
		imageUrl: "/shoes/shoe-13.avif",
		category: "Running",
		gender: "Women",
		colors: ["White", "Grey", "Green"],
		sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
		isSale: true,
		href: "/products/free-run-5",
		createdAt: new Date("2025-01-06"),
	},
	{
		id: "14",
		title: "Nike Air Max 270",
		description:
			"The Nike Air Max 270 delivers visible cushioning under every step with the tallest Air unit yet. Inspired by the Air Max icons, designed for modern comfort.",
		price: 160,
		imageUrl: "/shoes/shoe-14.avif",
		category: "Lifestyle",
		gender: "Unisex",
		colors: ["White", "Black", "Red"],
		sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
		href: "/products/air-max-270",
		createdAt: new Date("2025-01-16"),
	},
	{
		id: "15",
		title: "Nike Kobe 6 Protro",
		description:
			"The Nike Kobe 6 Protro brings back the performance and style of a basketball legend. Low-cut design and responsive cushioning for quick cuts and explosive plays.",
		price: 180,
		imageUrl: "/shoes/shoe-15.avif",
		category: "Basketball",
		gender: "Men",
		colors: ["Black", "White", "Orange"],
		sizes: ["7", "8", "9", "10", "11", "12", "13"],
		isNew: true,
		href: "/products/kobe-6",
		createdAt: new Date("2025-01-22"),
	},
];
