import { db } from "../src/lib/db/index";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

const NIKE_PRODUCTS = [
	{
		name: "Air Jordan 1 Retro High OG",
		description: "The Air Jordan 1 Retro High OG remains true to its roots while laying the foundation for the future of the Jordan Brand. This classic silhouette features premium leather and iconic details.",
		category: "Basketball",
		colors: [
			{ name: "Black/White", hex: "#000000", images: 3 },
			{ name: "University Blue", hex: "#56A0D3", images: 2 },
			{ name: "Bred", hex: "#DC143C", images: 3 },
		],
		basePrice: 170.0,
		sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
	},
	{
		name: "Nike Air Max 90",
		description: "Nothing as fly, nothing as comfortable. The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU accents.",
		category: "Lifestyle",
		colors: [
			{ name: "White/Grey", hex: "#F5F5F5", images: 2 },
			{ name: "Triple Black", hex: "#000000", images: 2 },
			{ name: "Infrared", hex: "#FF6347", images: 3 },
		],
		basePrice: 130.0,
		sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
	},
	{
		name: "Nike Dunk Low",
		description: "Created for the hardwood but taken to the streets, the '80s b-ball icon returns with classic details and throwback hoops flair.",
		category: "Lifestyle",
		colors: [
			{ name: "Panda", hex: "#FFFFFF", images: 3 },
			{ name: "University Red", hex: "#DC143C", images: 2 },
			{ name: "Coast", hex: "#87CEEB", images: 2 },
		],
		basePrice: 110.0,
		sizes: ["6", "7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike Blazer Mid '77",
		description: "Styled for the '70s. Loved in the '80s. Classic in the '90s. Ready for the future. The Nike Blazer Mid '77 delivers a timeless design that's easy to wear.",
		category: "Lifestyle",
		colors: [
			{ name: "White/Black", hex: "#FFFFFF", images: 2 },
			{ name: "Vintage Green", hex: "#228B22", images: 2 },
		],
		basePrice: 100.0,
		sizes: ["6", "7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike Air Force 1 '07",
		description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash.",
		category: "Lifestyle",
		colors: [
			{ name: "Triple White", hex: "#FFFFFF", images: 3 },
			{ name: "Triple Black", hex: "#000000", images: 2 },
			{ name: "Shadow", hex: "#808080", images: 2 },
		],
		basePrice: 110.0,
		sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
	},
	{
		name: "Nike React Infinity Run Flyknit 3",
		description: "Keep running. The Nike React Infinity Run 3 keeps your feet secure and cushioned. We added more foam and improved the upper to give you a stable, smooth ride.",
		category: "Running",
		colors: [
			{ name: "Black/White", hex: "#000000", images: 2 },
			{ name: "Blue Void", hex: "#4169E1", images: 2 },
		],
		basePrice: 160.0,
		sizes: ["7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike Pegasus 40",
		description: "Run your best in the Nike Pegasus 40. A springy sensation powered by a waffle outsole and Nike React foam to help you feel supported, energized and ready to keep going.",
		category: "Running",
		colors: [
			{ name: "Wolf Grey", hex: "#808080", images: 2 },
			{ name: "Volt", hex: "#CDDC39", images: 2 },
		],
		basePrice: 140.0,
		sizes: ["7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike Metcon 8",
		description: "From high-intensity lifts to cardio, the Nike Metcon 8 helps you power through. Hyperlift heel wedges provide stability while you lift, and grippy rubber wraps around the sides.",
		category: "Training",
		colors: [
			{ name: "Black/Orange", hex: "#000000", images: 2 },
			{ name: "White/Blue", hex: "#FFFFFF", images: 2 },
		],
		basePrice: 150.0,
		sizes: ["7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike SB Dunk Low Pro",
		description: "Skate in the Nike SB Dunk Low Pro. Padded collar gives you extra comfort while a Zoom Air insole provides responsive cushioning for all-day skating.",
		category: "Skateboarding",
		colors: [
			{ name: "Black/Gum", hex: "#000000", images: 2 },
			{ name: "Navy/White", hex: "#000080", images: 2 },
		],
		basePrice: 100.0,
		sizes: ["7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike Court Vision Low",
		description: "The Nike Court Vision Low takes inspiration from the '80s basketball icon. Crisp leather upper with vintage look and feel. Comfortable foam cushioning under your foot.",
		category: "Lifestyle",
		colors: [
			{ name: "White/Black", hex: "#FFFFFF", images: 2 },
			{ name: "Triple White", hex: "#FFFFFF", images: 2 },
		],
		basePrice: 75.0,
		sizes: ["6", "7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike ZoomX Vaporfly Next% 2",
		description: "The Nike ZoomX Vaporfly Next% 2 helps you run faster and longer. With more foam underfoot, a wider forefoot and increased stack heights, the Next% 2 was made for race day.",
		category: "Running",
		colors: [
			{ name: "Pink Blast", hex: "#FF69B4", images: 2 },
			{ name: "Volt", hex: "#CDDC39", images: 2 },
		],
		basePrice: 250.0,
		sizes: ["7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike Ja 1",
		description: "Ja Morant's first signature shoe. Crafted to help you unlock your on-court abilities with a uniquely sculpted midsole and traction that helps you stop and start on a dime.",
		category: "Basketball",
		colors: [
			{ name: "Day One", hex: "#000000", images: 2 },
			{ name: "Fuel", hex: "#FF4500", images: 2 },
		],
		basePrice: 110.0,
		sizes: ["7", "8", "9", "10", "11", "12", "13"],
	},
	{
		name: "Nike Wildhorse 7",
		description: "Take your runs off the beaten path with the Nike Wildhorse 7. Tackle rocky terrain with rugged traction and cushioned stability to help you feel secure on uneven trails.",
		category: "Trail Running",
		colors: [
			{ name: "Olive Green", hex: "#808000", images: 2 },
			{ name: "Desert Ochre", hex: "#CC7722", images: 2 },
		],
		basePrice: 130.0,
		sizes: ["7", "8", "9", "10", "11", "12"],
	},
	{
		name: "Nike Air Zoom SuperRep 3",
		description: "The Nike Air Zoom SuperRep 3 combines durability and cushioning to power you through circuit training, HIIT, live training classes and more.",
		category: "Training",
		colors: [
			{ name: "White/Black", hex: "#FFFFFF", images: 2 },
			{ name: "Pink/Black", hex: "#FF69B4", images: 2 },
		],
		basePrice: 120.0,
		sizes: ["6", "7", "8", "9", "10", "11"],
	},
	{
		name: "Nike Cortez",
		description: "First released in 1972, the Nike Cortez is a classic icon featuring a simple design with a leather upper. Comfortable foam midsole for all-day comfort.",
		category: "Lifestyle",
		colors: [
			{ name: "White/Red/Blue", hex: "#FFFFFF", images: 2 },
			{ name: "Black/White", hex: "#000000", images: 2 },
		],
		basePrice: 80.0,
		sizes: ["6", "7", "8", "9", "10", "11", "12"],
	},
];

async function seed() {
	console.log("🌱 Starting database seed...");

	try {
		console.log("📦 Seeding genders...");
		const [, , unisexGender] = await db
			.insert(schema.genders)
			.values([
				{ label: "Men", slug: "men" },
				{ label: "Women", slug: "women" },
				{ label: "Unisex", slug: "unisex" },
			])
			.returning();
		console.log("✅ Genders seeded");

		console.log("📦 Seeding brand...");
		const [nikeBrand] = await db
			.insert(schema.brands)
			.values([
				{
					name: "Nike",
					slug: "nike",
					logoUrl: "/logos/nike-logo.svg",
				},
			])
			.returning();
		console.log("✅ Brand seeded");

		console.log("📦 Seeding categories...");
		const categories = await db
			.insert(schema.categories)
			.values([
				{ name: "Basketball", slug: "basketball" },
				{ name: "Running", slug: "running" },
				{ name: "Training", slug: "training" },
				{ name: "Lifestyle", slug: "lifestyle" },
				{ name: "Skateboarding", slug: "skateboarding" },
				{ name: "Trail Running", slug: "trail-running" },
			])
			.returning();
		console.log("✅ Categories seeded");

		const categoryMap = categories.reduce(
			(acc, cat) => {
				acc[cat.name] = cat;
				return acc;
			},
			{} as Record<string, (typeof categories)[0]>
		);

		console.log("📦 Seeding collections...");
		const [summerCollection, newArrivalsCollection] = await db
			.insert(schema.collections)
			.values([
				{ name: "Summer 2025", slug: "summer-2025" },
				{ name: "New Arrivals", slug: "new-arrivals" },
			])
			.returning();
		console.log("✅ Collections seeded");

		console.log("📦 Seeding colors...");
		const colorSet = new Set<string>();
		NIKE_PRODUCTS.forEach((product) => {
			product.colors.forEach((color) => {
				colorSet.add(JSON.stringify({ name: color.name, hex: color.hex }));
			});
		});

		const uniqueColors = Array.from(colorSet).map((colorStr) =>
			JSON.parse(colorStr)
		);
		const colorValues = uniqueColors.map((color) => ({
			name: color.name,
			slug: color.name.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-"),
			hexCode: color.hex,
		}));

		const colors = await db.insert(schema.colors).values(colorValues).returning();
		console.log("✅ Colors seeded");

		const colorMap = colors.reduce(
			(acc, color) => {
				acc[color.name] = color;
				return acc;
			},
			{} as Record<string, (typeof colors)[0]>
		);

		console.log("📦 Seeding sizes...");
		const sizeSet = new Set<string>();
		NIKE_PRODUCTS.forEach((product) => {
			product.sizes.forEach((size) => sizeSet.add(size));
		});

		const uniqueSizes = Array.from(sizeSet).sort((a, b) => {
			const numA = parseFloat(a);
			const numB = parseFloat(b);
			return numA - numB;
		});

		const sizeValues = uniqueSizes.map((size, index) => ({
			name: size,
			slug: size.replace(".", "-"),
			sortOrder: index,
		}));

		const sizes = await db.insert(schema.sizes).values(sizeValues).returning();
		console.log("✅ Sizes seeded");

		const sizeMap = sizes.reduce(
			(acc, size) => {
				acc[size.name] = size;
				return acc;
			},
			{} as Record<string, (typeof sizes)[0]>
		);

		console.log("📦 Copying images to static uploads folder...");
		const publicShoesDir = path.join(process.cwd(), "public", "shoes");
		const staticUploadsDir = path.join(
			process.cwd(),
			"public",
			"static",
			"uploads"
		);

		if (!fs.existsSync(staticUploadsDir)) {
			fs.mkdirSync(staticUploadsDir, { recursive: true });
		}

		const shoeFiles = fs.readdirSync(publicShoesDir);
		console.log(`Found ${shoeFiles.length} shoe images`);

		shoeFiles.forEach((file) => {
			const sourcePath = path.join(publicShoesDir, file);
			const destPath = path.join(staticUploadsDir, file);
			fs.copyFileSync(sourcePath, destPath);
		});
		console.log("✅ Images copied to static uploads");

		console.log("📦 Seeding products with variants...");
		let imageIndex = 0;
		let productCount = 0;

		for (const productData of NIKE_PRODUCTS) {
			const category = categoryMap[productData.category];
			if (!category) {
				console.error(`Category not found: ${productData.category}`);
				continue;
			}

			const product = await db
				.insert(schema.products)
				.values({
					name: productData.name,
					description: productData.description,
					categoryId: category.id,
					genderId: unisexGender.id,
					brandId: nikeBrand.id,
					isPublished: true,
				})
				.returning();

			const productId = product[0].id;
			productCount++;

			const variants = [];
			const productImages = [];

			for (const colorData of productData.colors) {
				const color = colorMap[colorData.name];
				if (!color) {
					console.error(`Color not found: ${colorData.name}`);
					continue;
				}

				for (const sizeStr of productData.sizes) {
					const size = sizeMap[sizeStr];
					if (!size) {
						console.error(`Size not found: ${sizeStr}`);
						continue;
					}

					const hasSale = Math.random() > 0.7;
					const salePrice = hasSale
						? (productData.basePrice * 0.85).toFixed(2)
						: null;

					const variant = await db
						.insert(schema.productVariants)
						.values({
							productId,
							sku: `NIKE-${productCount}-${color.slug}-${size.slug}`.toUpperCase(),
							price: productData.basePrice.toFixed(2),
							salePrice,
							colorId: color.id,
							sizeId: size.id,
							inStock: Math.floor(Math.random() * 50) + 10,
							weight: (Math.random() * 0.5 + 0.3).toFixed(2),
							dimensions: {
								length: 30 + Math.random() * 5,
								width: 12 + Math.random() * 3,
								height: 10 + Math.random() * 3,
							},
						})
						.returning();

					variants.push(variant[0]);
				}

				for (let i = 0; i < colorData.images; i++) {
					if (imageIndex < shoeFiles.length) {
						const imageFile = shoeFiles[imageIndex];
						const imageUrl = `/static/uploads/${imageFile}`;

						productImages.push({
							productId,
							variantId: variants[variants.length - 1]?.id,
							url: imageUrl,
							sortOrder: i,
							isPrimary: i === 0,
						});

						imageIndex++;
					}
				}
			}

			if (productImages.length > 0) {
				await db.insert(schema.productImages).values(productImages);
			}

			if (variants.length > 0 && variants[0]) {
				await db
					.update(schema.products)
					.set({ defaultVariantId: variants[0].id })
					.where(eq(schema.products.id, productId));
			}

			await db.insert(schema.productCollections).values({
				productId,
				collectionId:
					Math.random() > 0.5
						? summerCollection.id
						: newArrivalsCollection.id,
			});

			console.log(
				`✅ Product seeded: ${productData.name} (${variants.length} variants, ${productImages.length} images)`
			);
		}

		console.log("\n🎉 Database seeding completed successfully!");
		console.log(`   - ${productCount} products`);
		console.log(`   - ${colors.length} colors`);
		console.log(`   - ${sizes.length} sizes`);
		console.log(`   - ${categories.length} categories`);
		console.log(`   - 3 genders`);
		console.log(`   - 1 brand (Nike)`);
		console.log(`   - 2 collections`);
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		throw error;
	}
}

seed()
	.then(() => {
		console.log("✨ Seed process finished");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Seed process failed:", error);
		process.exit(1);
	});
