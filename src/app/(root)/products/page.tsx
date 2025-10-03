import { Suspense } from "react";
import Card from "@/components/Card";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS, type MockProduct } from "@/lib/data/mockProducts";
import {
	parseFiltersFromQuery,
	stringifyFiltersToQuery,
} from "@/lib/utils/query";
import { X } from "lucide-react";
import Link from "next/link";

type SearchParams = { [key: string]: string | string[] | undefined };

function filterProducts(
	products: MockProduct[],
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

function sortProducts(products: MockProduct[], sortBy: string) {
	const sorted = [...products];

	switch (sortBy) {
		case "newest":
			return sorted.sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
			);
		case "price_asc":
			return sorted.sort((a, b) => a.price - b.price);
		case "price_desc":
			return sorted.sort((a, b) => b.price - a.price);
		case "featured":
		default:
			return sorted;
	}
}

export default function ProductsPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const filters = parseFiltersFromQuery(searchParams);
	const filteredProducts = filterProducts(MOCK_PRODUCTS, filters);
	const sortedProducts = sortProducts(filteredProducts, filters.sort || "featured");

	const hasActiveFilters =
		filters.genders?.length ||
		filters.sizes?.length ||
		filters.colors?.length ||
		filters.priceRanges?.length;

	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-8">
						<h1 className="text-heading-1 font-jost text-dark-900 mb-2">
							All Products
						</h1>
						<p className="text-body text-dark-700">
							Showing {sortedProducts.length} of {MOCK_PRODUCTS.length} products
						</p>
					</div>

					{hasActiveFilters && (
						<div className="mb-6 flex flex-wrap items-center gap-2">
							<span className="text-body text-dark-700">Active filters:</span>
							{filters.genders?.map((gender) => (
								<Link
									key={gender}
									href={`/products?${stringifyFiltersToQuery({
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
									href={`/products?${stringifyFiltersToQuery({
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
									href={`/products?${stringifyFiltersToQuery({
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
										href={`/products?${stringifyFiltersToQuery({
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

							{sortedProducts.length > 0 ? (
								<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
									{sortedProducts.map((product) => (
										<Card
											key={product.id}
											{...product}
											onAddToCart={() =>
												console.log(`Added ${product.title} to cart`)
											}
											onToggleFavorite={() =>
												console.log(`Toggled favorite for ${product.title}`)
											}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-16">
									<p className="text-heading-3 font-jost text-dark-900 mb-2">
										No products found
									</p>
									<p className="text-body text-dark-700 mb-6">
										Try adjusting your filters to see more products
									</p>
									<Link href="/products">
										<Badge>Clear all filters</Badge>
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
