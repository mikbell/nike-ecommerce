import { Suspense } from "react";
import { notFound } from "next/navigation";
import Filters from "@/components/filters";
import Sort from "@/components/sort";
import { Badge } from "@/components/ui/badge";
import { getProductsByCategory } from "@/lib/db/queries/products";
import { getCategoryBySlug, getAllCategories } from "@/lib/db/queries/categories";
import {
	parseFiltersFromQuery,
	stringifyFiltersToQuery,
} from "@/lib/utils/query";
import { X } from "lucide-react";
import Link from "next/link";
import ProductList from "@/components/product-list";
import Breadcrumbs from "@/components/breadcrumbs";

type Product = Awaited<ReturnType<typeof getProductsByCategory>>[0];
type SearchParams = { [key: string]: string | string[] | undefined };

function filterProducts(
	products: Product[],
	filters: ReturnType<typeof parseFiltersFromQuery>
) {
	return products.filter((product) => {
		if (filters.genders && filters.genders.length > 0) {
			if (!filters.genders.includes(product.gender)) return false;
		}

		if (filters.sizes && filters.sizes.length > 0) {
			if (!filters.sizes.some((size) => product.sizes.includes(size)))
				return false;
		}

		if (filters.colors && filters.colors.length > 0) {
			if (!filters.colors.some((color) => product.colors.includes(color)))
				return false;
		}

		if (filters.priceRanges && filters.priceRanges.length > 0) {
			const matchesRange = filters.priceRanges.some((range) => {
				if (range === "0-50") return product.price <= 50;
				if (range === "50-100")
					return product.price > 50 && product.price <= 100;
				if (range === "100-150")
					return product.price > 100 && product.price <= 150;
				if (range === "150+") return product.price > 150;
				return false;
			});
			if (!matchesRange) return false;
		}

		return true;
	});
}

function sortProducts(products: Product[], sortBy: string) {
	const sorted = [...products];

	switch (sortBy) {
		case "newest":
			return sorted.sort((a, b) => {
				const aIsNew = a.isNew ? 1 : 0;
				const bIsNew = b.isNew ? 1 : 0;
				return bIsNew - aIsNew;
			});
		case "price_asc":
			return sorted.sort((a, b) => a.price - b.price);
		case "price_desc":
			return sorted.sort((a, b) => b.price - a.price);
		case "featured":
		default:
			return sorted;
	}
}

// Generate static paths for all categories
export async function generateStaticParams() {
	const categories = await getAllCategories();
	return categories.map((category) => ({
		slug: category.slug,
	}));
}

export default async function CategoryPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<SearchParams>;
}) {
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;
	const category = await getCategoryBySlug(resolvedParams.slug);
	
	if (!category) {
		notFound();
	}

	const allProducts = await getProductsByCategory(resolvedParams.slug);
	const filters = parseFiltersFromQuery(resolvedSearchParams);
	const filteredProducts = filterProducts(allProducts, filters);
	const sortedProducts = sortProducts(filteredProducts, filters.sort || "featured");

	const hasActiveFilters =
		filters.genders?.length ||
		filters.sizes?.length ||
		filters.colors?.length ||
		filters.priceRanges?.length;

	// Build breadcrumb items
	const breadcrumbItems = [
		{ label: "Products", href: "/products" },
	];

	// Add parent category if exists
	if (category.parent) {
		breadcrumbItems.push({
			label: category.parent.name,
			href: `/products/category/${category.parent.slug}`,
		});
	}

	// Add current category (no href as it's the current page)
	breadcrumbItems.push({
		label: category.name,
	});

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Breadcrumbs */}
					<div className="mb-6">
						<Breadcrumbs items={breadcrumbItems} />
					</div>

					{/* Header */}
					<div className="mb-8">
						<h1 className="text-heading-1 font-jost text-dark-900 mb-2">
							{category.name}
						</h1>
						<p className="text-body text-dark-700">
							Showing {sortedProducts.length} of {allProducts.length} products
						</p>
						
						{/* Subcategories */}
						{category.children && category.children.length > 0 && (
							<div className="mt-4">
								<h2 className="text-body-medium font-medium text-dark-900 mb-3">
									Shop by category:
								</h2>
								<div className="flex flex-wrap gap-2">
									{category.children.map((subcategory) => (
										<Link
											key={subcategory.id}
											href={`/products/category/${subcategory.slug}`}
										>
											<Badge variant="outline" className="cursor-pointer hover:bg-dark-100">
												{subcategory.name}
											</Badge>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Active Filters */}
					{hasActiveFilters && (
						<div className="mb-6 flex flex-wrap items-center gap-2">
							<span className="text-body text-dark-700">Active filters:</span>
							{filters.genders?.map((gender) => (
								<Link
									key={gender}
									href={`/products/category/${resolvedParams.slug}?${stringifyFiltersToQuery({
										...filters,
										genders: filters.genders?.filter((g) => g !== gender),
									})}`}>
									<Badge variant="secondary" className="cursor-pointer">
										{gender} <X className="w-3 h-3 ml-1" />
									</Badge>
								</Link>
							))}
							{filters.sizes?.map((size) => (
								<Link
									key={size}
									href={`/products/category/${resolvedParams.slug}?${stringifyFiltersToQuery({
										...filters,
										sizes: filters.sizes?.filter((s) => s !== size),
									})}`}>
									<Badge variant="secondary" className="cursor-pointer">
										Size {size} <X className="w-3 h-3 ml-1" />
									</Badge>
								</Link>
							))}
							{filters.colors?.map((color) => (
								<Link
									key={color}
									href={`/products/category/${resolvedParams.slug}?${stringifyFiltersToQuery({
										...filters,
										colors: filters.colors?.filter((c) => c !== color),
									})}`}>
									<Badge variant="secondary" className="cursor-pointer">
										{color} <X className="w-3 h-3 ml-1" />
									</Badge>
								</Link>
							))}
							{filters.priceRanges?.map((range) => {
								const rangeLabel =
									range === "0-50"
										? "$0-$50"
										: range === "50-100"
											? "$50-$100"
											: range === "100-150"
												? "$100-$150"
												: "$150+";
								return (
									<Link
										key={range}
										href={`/products/category/${resolvedParams.slug}?${stringifyFiltersToQuery({
											...filters,
											priceRanges: filters.priceRanges?.filter((r) => r !== range),
										})}`}>
										<Badge variant="secondary" className="cursor-pointer">
											{rangeLabel} <X className="w-3 h-3 ml-1" />
										</Badge>
									</Link>
								);
							})}
						</div>
					)}

					{/* Content */}
					<div className="flex flex-col lg:flex-row gap-8">
						<aside className="lg:w-64 flex-shrink-0">
							<Suspense fallback={<div>Loading filters...</div>}>
								<Filters />
							</Suspense>
						</aside>

						<div className="flex-1">
							<div className="mb-6 flex justify-end">
								<Suspense fallback={<div>Loading sort...</div>}>
									<Sort />
								</Suspense>
							</div>

							{sortedProducts.length === 0 ? (
								<div className="text-center py-12">
									<p className="text-body text-dark-600 mb-4">
										No products found in this category.
									</p>
									<Link
										href="/products"
										className="text-dark-900 underline hover:no-underline"
									>
										View all products
									</Link>
								</div>
							) : (
								<Suspense fallback={<div>Loading products...</div>}>
									<ProductList products={sortedProducts} />
								</Suspense>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}