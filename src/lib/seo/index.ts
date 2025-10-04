import { Metadata } from "next";
import { ProductListItem, Category, Product } from "@/types";
import { formatPrice } from "@/lib/utils/index";

// === Base Configuration ===
const SITE_CONFIG = {
	name: "Nike Store",
	description:
		"Discover the latest Nike shoes, clothing and accessories. Shop the official Nike store for premium athletic wear and gear.",
	url: process.env.NEXT_PUBLIC_SITE_URL || "https://nike-store.example.com",
	logo: "/images/nike-logo.png",
	twitterHandle: "@nikestore",
	defaultLocale: "en",
} as const;

// --- MIGLIORAMENTO ---
// Mappa per convertire i codici di lingua semplici in formati completi per Open Graph.
const localeMap: { [key: string]: string } = {
	en: "en_US",
	it: "it_IT",
	fr: "fr_FR",
	de: "de_DE",
};

// === Base Metadata ===
export const baseMetadata: Metadata = {
	metadataBase: new URL(SITE_CONFIG.url),
	title: {
		template: `%s | ${SITE_CONFIG.name}`,
		default: SITE_CONFIG.name,
	},
	description: SITE_CONFIG.description,
	applicationName: SITE_CONFIG.name,
	authors: [{ name: "Nike Store Team" }],
	generator: "Next.js",
	keywords: [
		"Nike",
		"shoes",
		"sneakers",
		"athletic wear",
		"sportswear",
		"running shoes",
		"basketball shoes",
		"clothing",
		"accessories",
	],
	referrer: "origin-when-cross-origin",
	creator: "Nike Store",
	publisher: "Nike Store",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	category: "E-commerce",
	classification: "Business",
	alternates: {
		canonical: SITE_CONFIG.url,
		languages: {
			en: "/en",
			it: "/it",
			fr: "/fr",
			de: "/de",
		},
	},
	openGraph: {
		type: "website",
		siteName: SITE_CONFIG.name,
		title: SITE_CONFIG.name,
		description: SITE_CONFIG.description,
		url: SITE_CONFIG.url,
		images: [
			{
				url: "/images/og-image.jpg",
				width: 1200,
				height: 630,
				alt: `${SITE_CONFIG.name} - Official Store`,
			},
		],
		// --- MIGLIORAMENTO ---
		// Impostato il locale di default, ma idealmente dovrebbe essere aggiornato dinamicamente per pagina.
		locale: localeMap[SITE_CONFIG.defaultLocale],
		alternateLocale: ["it_IT", "fr_FR", "de_DE"],
	},
	twitter: {
		card: "summary_large_image",
		site: SITE_CONFIG.twitterHandle,
		creator: SITE_CONFIG.twitterHandle,
		title: SITE_CONFIG.name,
		description: SITE_CONFIG.description,
		images: ["/images/twitter-image.jpg"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/manifest.json",
	verification: {
		google: process.env.GOOGLE_SITE_VERIFICATION,
		yandex: process.env.YANDEX_VERIFICATION,
		yahoo: process.env.YAHOO_SITE_VERIFICATION,
	},
	other: {
		"msapplication-TileColor": "#000000",
		"theme-color": "#ffffff",
	},
};

// === Product Page Metadata ===
// --- MIGLIORAMENTO --- Aggiunto il parametro `locale` per gestire l'internazionalizzazione
export function generateProductMetadata(
	product: Product,
	locale: string = SITE_CONFIG.defaultLocale
): Metadata {
	const title = `${product.name} - ${product.brand.name}`;
	const description =
		product.description ||
		`Shop ${product.name} by ${
			product.brand.name
		}. Premium quality ${product.category.name.toLowerCase()} for ${product.gender.label.toLowerCase()}.`;
	const url = `${SITE_CONFIG.url}/products/${product.slug}`;
	const image = product.images[0]?.url || "/images/placeholder-product.jpg";

	// --- CORREZIONE --- Estrae il prezzo più basso dalle varianti per usarlo nei metadati.
	// Si presume che `size` abbia una proprietà `price: number`.
	const prices = product.variants
		.flatMap((v) => v.sizes.map((s) => s.price))
		.filter((p) => p > 0);
	const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

	return {
		title,
		description,
		alternates: {
			canonical: url,
		},
		openGraph: {
			type: "product",
			title,
			description,
			url,
			images: [
				{
					url: image,
					width: 800,
					height: 800,
					alt: product.name,
				},
			],
			siteName: SITE_CONFIG.name,
			locale: localeMap[locale] || localeMap.en, // Usa il locale della pagina
			// --- CORREZIONE --- Utilizzo delle proprietà Open Graph standard per i prodotti.
			// La sezione 'other' non è più necessaria per questi dati.
			price: {
				amount: lowestPrice.toString(),
				currency: "USD", // Dovrebbe essere dinamico se il sito supporta più valute
			},
			availability: product.variants.some((v) => v.sizes.some((s) => s.inStock))
				? "instock"
				: "oos",
			brand: product.brand.name,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [image],
		},
		// La sezione 'other' non è più necessaria per i dettagli del prodotto che ora sono in openGraph
	};
}

// === Category Page Metadata ===
export function generateCategoryMetadata(
	category: Category,
	productCount?: number
): Metadata {
	const title = `${category.name} Collection`;
	const description =
		category.description ||
		`Discover our ${category.name.toLowerCase()} collection. ${
			productCount
				? `Shop ${productCount} products`
				: "Shop premium quality items"
		} with fast shipping and easy returns.`;
	const url = `${SITE_CONFIG.url}/products/category/${category.slug}`;

	return {
		title,
		description,
		alternates: {
			canonical: url,
		},
		openGraph: {
			type: "website",
			title,
			description,
			url,
			images: [
				{
					url: category.imageUrl || "/images/category-default.jpg",
					width: 1200,
					height: 630,
					alt: `${category.name} Collection`,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [category.imageUrl || "/images/category-default.jpg"],
		},
	};
}

// === Search Results Metadata ===
export function generateSearchMetadata(
	query: string,
	resultCount: number
): Metadata {
	const title = `Search results for "${query}"`;
	const description = `Found ${resultCount} products for "${query}". Shop Nike shoes, clothing and accessories with fast shipping.`;

	return {
		title,
		description,
		robots: {
			index: false, // Corretto: non indicizzare le pagine di ricerca
			follow: true,
		},
	};
}

// === Structured Data Generators ===
export function generateProductStructuredData(product: Product) {
	// --- CORREZIONE --- Calcola correttamente lowPrice e highPrice usando `price` invece di `inStock`.
	const allPrices = product.variants
		.flatMap((v) => v.sizes.map((s) => s.price)) // Si presume che s.price sia un numero
		.filter((p) => typeof p === "number" && p > 0);

	const lowPrice = allPrices.length ? Math.min(...allPrices) : undefined;
	const highPrice = allPrices.length ? Math.max(...allPrices) : undefined;

	const structuredData = {
		"@context": "https://schema.org/",
		"@type": "Product",
		name: product.name,
		description: product.description,
		brand: {
			"@type": "Brand",
			name: product.brand.name,
		},
		category: product.category.name,
		image: product.images.map((img) => img.url),
		sku: product.id,
		offers: {
			"@type": "AggregateOffer",
			lowPrice: lowPrice,
			highPrice: highPrice,
			priceCurrency: "USD", // Dovrebbe essere dinamico se il sito supporta più valute
			availability: product.variants.some((v) => v.sizes.some((s) => s.inStock))
				? "https://schema.org/InStock"
				: "https://schema.org/OutOfStock",
			seller: {
				"@type": "Organization",
				name: SITE_CONFIG.name,
			},
		},
		aggregateRating: product.rating
			? {
					"@type": "AggregateRating",
					ratingValue: product.rating.average,
					ratingCount: product.rating.count,
					bestRating: 5,
					worstRating: 1,
			  }
			: undefined,
	};

	return JSON.stringify(structuredData, null, 2);
}

export function generateOrganizationStructuredData() {
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: SITE_CONFIG.name,
		url: SITE_CONFIG.url,
		logo: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
		contactPoint: {
			"@type": "ContactPoint",
			telephone: "+1-800-344-6453",
			contactType: "Customer Support",
			availableLanguage: ["English", "Italian", "French", "German"],
		},
		sameAs: [
			"https://www.facebook.com/nike",
			"https://www.twitter.com/nike",
			"https://www.instagram.com/nike",
			"https://www.youtube.com/user/nike",
		],
	};

	return JSON.stringify(structuredData, null, 2);
}

export function generateWebsiteStructuredData() {
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE_CONFIG.name,
		url: SITE_CONFIG.url,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	return JSON.stringify(structuredData, null, 2);
}

// === Breadcrumb Structured Data ===
export function generateBreadcrumbStructuredData(
	items: Array<{ name: string; url?: string }>
) {
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			...(item.url && { item: `${SITE_CONFIG.url}${item.url}` }),
		})),
	};

	return JSON.stringify(structuredData, null, 2);
}

// === Sitemap Generators ===
// Si presume che `ProductListItem` abbia una proprietà `updatedAt`
export function generateProductSitemapEntries(products: ProductListItem[]) {
	return products.map((product) => ({
		url: `${SITE_CONFIG.url}/products/${product.slug}`,
		// --- MIGLIORAMENTO --- Utilizza la data di aggiornamento reale del prodotto.
		lastModified: product.updatedAt || new Date().toISOString(),
		changeFrequency: "weekly" as const,
		priority: 0.8,
		images: [
			{
				url: product.imageUrl,
				title: product.title,
				caption: product.description,
			},
		],
	}));
}

// Si presume che `Category` abbia una proprietà `updatedAt`
export function generateCategorySitemapEntries(categories: Category[]) {
	return categories.map((category) => ({
		url: `${SITE_CONFIG.url}/products/category/${category.slug}`,
		// --- MIGLIORAMENTO --- Utilizza la data di aggiornamento reale della categoria.
		lastModified: category.updatedAt || new Date().toISOString(),
		changeFrequency: "daily" as const,
		priority: 0.9,
	}));
}

// === Accessibility Helpers ===
export function generateAriaLabel(product: ProductListItem): string {
	const priceText =
		product.originalPrice && product.originalPrice > product.price
			? `on sale for ${formatPrice(product.price)}, originally ${formatPrice(
					product.originalPrice
			  )}`
			: `priced at ${formatPrice(product.price)}`;

	const statusText = product.isNew ? ", new arrival" : "";

	// --- MIGLIORAMENTO --- Resa l'azione più generica e meno legata al "click".
	return `${product.title} by ${product.brand}, ${priceText}${statusText}. View product details.`;
}

export function generateImageAlt(product: ProductListItem): string {
	return `${product.title} - ${product.brand} ${product.category}`;
}
