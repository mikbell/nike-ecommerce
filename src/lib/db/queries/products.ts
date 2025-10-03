import { db } from "@/lib/db";

export async function getAllProducts() {
	try {
		const products = await db.query.products.findMany({
			with: {
				category: true,
				gender: true,
				brand: true,
			},
		});
		
		if (products.length === 0) {
			return [];
		}

		const productsWithDetails = await Promise.all(
			products.map(async (product) => {
			const variants = await db.query.productVariants.findMany({
				where: (productVariants, { eq }) => eq(productVariants.productId, product.id),
				with: {
					color: true,
					size: true,
				},
			});

			const images = await db.query.productImages.findMany({
				where: (productImages, { eq }) => eq(productImages.productId, product.id),
				orderBy: (productImages, { asc }) => [asc(productImages.sortOrder)],
			});

		const uniqueColors = Array.from(new Set(variants.map((v) => v.color.name)));
		const uniqueSizes = Array.from(new Set(variants.map((v) => v.size.name)));
		
		const hasSale = variants.some((v) => v.salePrice !== null);
			const basePrice = variants.length > 0 ? parseFloat(variants[0].price) : 0;
			const salePrice = hasSale && variants[0].salePrice ? parseFloat(variants[0].salePrice) : null;

			const primaryImage = images.find((img) => img.isPrimary) || images[0];

			return {
				id: product.id,
				slug: product.slug,
				title: product.name,
				description: product.description || "",
				price: salePrice || basePrice,
				originalPrice: hasSale && salePrice ? basePrice : undefined,
				imageUrl: primaryImage?.url || "/shoes/shoe-1.jpg",
				category: product.category.name,
				gender: product.gender.label,
				colors: uniqueColors,
				sizes: uniqueSizes,
				isNew: isNewProduct(product.createdAt),
				isSale: hasSale,
				href: `/products/${product.slug}`,
			};
		})
	);

		return productsWithDetails;
	} catch (error) {
		console.error('💥 Error in getAllProducts:', error);
		// Return empty array instead of throwing to prevent page crash
		return [];
	}
}

export async function getProductBySlug(slug: string) {
	const product = await db.query.products.findFirst({
		where: (products, { eq }) => eq(products.slug, slug),
		with: {
			category: true,
			gender: true,
			brand: true,
		},
	});

	if (!product) {
		return null;
	}

	const variants = await db.query.productVariants.findMany({
		where: (productVariants, { eq }) => eq(productVariants.productId, product.id),
		with: {
			color: true,
			size: true,
		},
	});

	const images = await db.query.productImages.findMany({
		where: (productImages, { eq }) => eq(productImages.productId, product.id),
		orderBy: (productImages, { asc }) => [asc(productImages.sortOrder)],
	});

	const variantsByColor = variants.reduce((acc, variant) => {
		const colorName = variant.color.name;
		if (!acc[colorName]) {
			acc[colorName] = {
				color: colorName,
				colorSlug: variant.color.slug,
				hexCode: variant.color.hexCode,
				images: [],
				sizes: [],
			};
		}

		const variantImages = images.filter((img) => img.variantId === variant.id);
		if (variantImages.length > 0) {
			acc[colorName].images.push(...variantImages.map((img) => img.url));
		}

		if (!acc[colorName].sizes.find((s) => s.size === variant.size.name)) {
			acc[colorName].sizes.push({
				size: variant.size.name,
				inStock: variant.inStock > 0,
			});
		}

		return acc;
	}, {} as Record<string, { color: string; colorSlug: string; hexCode: string; images: string[]; sizes: Array<{ size: string; inStock: boolean }> }>);

	type VariantData = {
		color: string;
		colorSlug: string;
		hexCode: string;
		images: string[];
		sizes: Array<{ size: string; inStock: boolean }>;
	};

	const productVariants = Object.values(variantsByColor).map((variant: VariantData) => ({
		...variant,
		images: variant.images.length > 0 ? variant.images : [images[0]?.url || "/shoes/shoe-1.jpg"],
	}));

	const basePrice = variants.length > 0 ? parseFloat(variants[0].price) : 0;
	const hasSale = variants.some((v) => v.salePrice !== null);
	const salePrice = hasSale && variants[0].salePrice ? parseFloat(variants[0].salePrice) : null;

	return {
		id: product.id,
		slug: product.slug,
		title: product.name,
		description: product.description || "",
		price: salePrice || basePrice,
		originalPrice: hasSale && salePrice ? basePrice : undefined,
		category: product.category.name,
		gender: product.gender.label,
		brand: product.brand.name,
		isNew: isNewProduct(product.createdAt),
		isSale: hasSale,
		variants: productVariants,
		reviews: {
			averageRating: 4.5,
			totalReviews: Math.floor(Math.random() * 100) + 10,
		},
		details: {
			materials: ["Premium leather upper", "Rubber outsole", "Foam midsole"],
			features: ["Nike Air cushioning", "Durable traction pattern", "Padded collar"],
			styleCode: `${product.brand.slug.toUpperCase()}-${product.id.slice(0, 8)}`,
			colorway: productVariants[0]?.color || "Multi",
		},
	};
}

export async function getProductById(productId: string) {
	const product = await db.query.products.findFirst({
		where: (products, { eq }) => eq(products.id, productId),
		with: {
			category: true,
			gender: true,
			brand: true,
		},
	});

	if (!product) {
		return null;
	}

	const variants = await db.query.productVariants.findMany({
		where: (productVariants, { eq }) => eq(productVariants.productId, product.id),
		with: {
			color: true,
			size: true,
		},
	});

	const images = await db.query.productImages.findMany({
		where: (productImages, { eq }) => eq(productImages.productId, product.id),
		orderBy: (productImages, { asc }) => [asc(productImages.sortOrder)],
	});

	const variantsByColor = variants.reduce((acc, variant) => {
		const colorName = variant.color.name;
		if (!acc[colorName]) {
			acc[colorName] = {
				color: colorName,
				colorSlug: variant.color.slug,
				hexCode: variant.color.hexCode,
				images: [],
				sizes: [],
			};
		}

		const variantImages = images.filter((img) => img.variantId === variant.id);
		if (variantImages.length > 0) {
			acc[colorName].images.push(...variantImages.map((img) => img.url));
		}

		if (!acc[colorName].sizes.find((s) => s.size === variant.size.name)) {
			acc[colorName].sizes.push({
				size: variant.size.name,
				inStock: variant.inStock > 0,
			});
		}

		return acc;
	}, {} as Record<string, { color: string; colorSlug: string; hexCode: string; images: string[]; sizes: Array<{ size: string; inStock: boolean }> }>);

	type VariantData = {
		color: string;
		colorSlug: string;
		hexCode: string;
		images: string[];
		sizes: Array<{ size: string; inStock: boolean }>;
	};

	const productVariants = Object.values(variantsByColor).map((variant: VariantData) => ({
		...variant,
		images: variant.images.length > 0 ? variant.images : [images[0]?.url || "/shoes/shoe-1.jpg"],
	}));

	const basePrice = variants.length > 0 ? parseFloat(variants[0].price) : 0;
	const hasSale = variants.some((v) => v.salePrice !== null);
	const salePrice = hasSale && variants[0].salePrice ? parseFloat(variants[0].salePrice) : null;

		return {
			id: product.id,
			slug: product.slug,
			title: product.name,
			description: product.description || "",
			price: salePrice || basePrice,
			originalPrice: hasSale && salePrice ? basePrice : undefined,
			category: product.category.name,
			gender: product.gender.label,
			brand: product.brand.name,
			isNew: isNewProduct(product.createdAt),
			isSale: hasSale,
			variants: productVariants,
			reviews: {
				averageRating: 4.5,
				totalReviews: Math.floor(Math.random() * 100) + 10,
			},
			details: {
				materials: ["Premium leather upper", "Rubber outsole", "Foam midsole"],
				features: ["Nike Air cushioning", "Durable traction pattern", "Padded collar"],
				styleCode: `${product.brand.slug.toUpperCase()}-${product.id.slice(0, 8)}`,
				colorway: productVariants[0]?.color || "Multi",
			},
		};
}

export async function getRelatedProducts(currentProductId: string, limit: number = 4) {
	const currentProduct = await db.query.products.findFirst({
		where: (products, { eq }) => eq(products.id, currentProductId),
	});

	if (!currentProduct) {
		return [];
	}

	const relatedProducts = await db.query.products.findMany({
		where: (products, { and, eq, ne }) =>
			and(
				eq(products.categoryId, currentProduct.categoryId),
				ne(products.id, currentProductId)
			),
		limit: limit,
		with: {
			category: true,
			gender: true,
			brand: true,
		},
	});

	const relatedWithDetails = await Promise.all(
		relatedProducts.map(async (product) => {
			const variants = await db.query.productVariants.findMany({
				where: (productVariants, { eq }) => eq(productVariants.productId, product.id),
				with: {
					color: true,
					size: true,
				},
			});

			const images = await db.query.productImages.findMany({
				where: (productImages, { eq }) => eq(productImages.productId, product.id),
				orderBy: (productImages, { asc }) => [asc(productImages.sortOrder)],
			});

			const variantsByColor = variants.reduce((acc, variant) => {
				const colorName = variant.color.name;
				if (!acc[colorName]) {
					acc[colorName] = {
						color: colorName,
						colorSlug: variant.color.slug,
						hexCode: variant.color.hexCode,
						images: [],
						sizes: [],
					};
				}

				const variantImages = images.filter((img) => img.variantId === variant.id);
				if (variantImages.length > 0) {
					acc[colorName].images.push(...variantImages.map((img) => img.url));
				}

				if (!acc[colorName].sizes.find((s) => s.size === variant.size.name)) {
					acc[colorName].sizes.push({
						size: variant.size.name,
						inStock: variant.inStock > 0,
					});
				}

				return acc;
			}, {} as Record<string, { color: string; colorSlug: string; hexCode: string; images: string[]; sizes: Array<{ size: string; inStock: boolean }> }>);

			type VariantData = {
				color: string;
				colorSlug: string;
				hexCode: string;
				images: string[];
				sizes: Array<{ size: string; inStock: boolean }>;
			};

			const productVariants = Object.values(variantsByColor).map((variant: VariantData) => ({
				...variant,
				images: variant.images.length > 0 ? variant.images : [images[0]?.url || "/shoes/shoe-1.jpg"],
			}));

			const basePrice = variants.length > 0 ? parseFloat(variants[0].price) : 0;
			const hasSale = variants.some((v) => v.salePrice !== null);
			const salePrice = hasSale && variants[0].salePrice ? parseFloat(variants[0].salePrice) : null;

			// Get primary image for imageUrl
			const primaryImage = images.find((img) => img.isPrimary) || images[0];
			const imageUrl = primaryImage?.url || "/shoes/shoe-1.jpg";

			// Get first available size and color for the Product type
			const firstVariant = variants[0];
			const size = firstVariant?.size.name || null;
			const color = firstVariant?.color.name || null;
			const stock = variants.reduce((total, variant) => total + variant.inStock, 0);

			return {
				id: parseInt(product.id), // Convert string to number for Product type
				slug: product.slug,
				name: product.name, // Use 'name' instead of 'title' to match Product type
				description: product.description || "",
				price: salePrice || basePrice,
				imageUrl: imageUrl, // Add imageUrl property
				category: product.category.name,
				brand: product.brand.name, // Add brand property
				size: size, // Add size property
				color: color, // Add color property
				gender: product.gender.label,
				stock: stock, // Add stock property
				isNew: isNewProduct(product.createdAt),
				isSale: hasSale,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt,
				variants: productVariants, // Keep variants for ProductWithVariants type
			};
		})
	);

	return relatedWithDetails;
}

function isNewProduct(createdAt: Date): boolean {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	return createdAt > thirtyDaysAgo;
}
