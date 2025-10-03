"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
	parseFiltersFromQuery,
	stringifyFiltersToQuery,
} from "@/lib/utils/query";

const SORT_OPTIONS = [
	{ label: "Featured", value: "featured" },
	{ label: "Newest", value: "newest" },
	{ label: "Price: High to Low", value: "price_desc" },
	{ label: "Price: Low to High", value: "price_asc" },
];

export default function Sort() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentFilters = parseFiltersFromQuery(
		Object.fromEntries(searchParams.entries())
	);
	const currentSort = currentFilters.sort || "featured";

	const handleSortChange = (value: string) => {
		const newFilters = {
			...currentFilters,
			sort: value === "featured" ? undefined : value,
		};

		router.push(`${pathname}?${stringifyFiltersToQuery(newFilters)}`, {
			scroll: false,
		});
	};

	return (
		<div className="flex items-center gap-3">
			<span className="text-body text-dark-700">Sort by:</span>
			<select
				value={currentSort}
				onChange={(e) => handleSortChange(e.target.value)}
				className="text-body text-dark-900 border border-light-400 rounded-md px-3 py-2 bg-light-100 focus:outline-none focus:ring-2 focus:ring-dark-900">
				{SORT_OPTIONS.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
