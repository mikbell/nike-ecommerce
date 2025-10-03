"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
	parseFiltersFromQuery,
	stringifyFiltersToQuery,
	type ProductFilters,
} from "@/lib/utils/query";
import { Button } from "./ui/button";
import { X, SlidersHorizontal } from "lucide-react";

const FILTER_OPTIONS = {
	genders: ["Men", "Women", "Unisex"],
	sizes: [
		"6",
		"6.5",
		"7",
		"7.5",
		"8",
		"8.5",
		"9",
		"9.5",
		"10",
		"10.5",
		"11",
		"11.5",
		"12",
		"12.5",
		"13",
	],
	colors: ["Black", "White", "Red", "Blue", "Grey", "Green", "Orange"],
	priceRanges: [
		{ label: "$0 - $50", value: "0-50" },
		{ label: "$50 - $100", value: "50-100" },
		{ label: "$100 - $150", value: "100-150" },
		{ label: "$150+", value: "150+" },
	],
};

export default function Filters() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [isOpen, setIsOpen] = useState(false);
	const [expandedGroups, setExpandedGroups] = useState<
		Record<string, boolean>
	>({
		genders: true,
		sizes: false,
		colors: false,
		priceRanges: false,
	});

	const currentFilters = parseFiltersFromQuery(
		Object.fromEntries(searchParams.entries())
	);

	const handleFilterChange = (
		filterType: keyof ProductFilters,
		value: string
	) => {
		const current = (currentFilters[filterType] as string[]) || [];
		const newValues = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];

		const newFilters = {
			...currentFilters,
			[filterType]: newValues.length > 0 ? newValues : undefined,
		};

		router.push(`${pathname}?${stringifyFiltersToQuery(newFilters)}`, {
			scroll: false,
		});
	};

	const clearAllFilters = () => {
		router.push(pathname, { scroll: false });
	};

	const FilterGroup = ({
		title,
		filterKey,
		options,
	}: {
		title: string;
		filterKey: string;
		options: string[] | { label: string; value: string }[];
	}) => {
		const isExpanded = expandedGroups[filterKey];
		const currentValues =
			(currentFilters[filterKey as keyof ProductFilters] as string[]) || [];

		return (
			<div className="border-b border-light-400 pb-4">
				<button
					onClick={() =>
						setExpandedGroups({ ...expandedGroups, [filterKey]: !isExpanded })
					}
					className="flex items-center justify-between w-full text-left text-body-medium font-medium text-dark-900 mb-3">
					{title}
					<span className="text-dark-700">{isExpanded ? "−" : "+"}</span>
				</button>
				{isExpanded && (
					<div className="space-y-2">
						{options.map((option) => {
							const value = typeof option === "string" ? option : option.value;
							const label = typeof option === "string" ? option : option.label;
							const isChecked = currentValues.includes(value);

							return (
								<label
									key={value}
									className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={isChecked}
										onChange={() =>
											handleFilterChange(filterKey as keyof ProductFilters, value)
										}
										className="w-4 h-4 rounded border-dark-300"
									/>
									<span className="text-body text-dark-900">{label}</span>
								</label>
							);
						})}
					</div>
				)}
			</div>
		);
	};

	const filterContent = (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-heading-3 font-jost text-dark-900">Filters</h2>
				{(currentFilters.genders?.length ||
					currentFilters.sizes?.length ||
					currentFilters.colors?.length ||
					currentFilters.priceRanges?.length) && (
					<Button variant="ghost" size="sm" onClick={clearAllFilters}>
						Clear All
					</Button>
				)}
			</div>

			<FilterGroup
				title="Gender"
				filterKey="genders"
				options={FILTER_OPTIONS.genders}
			/>
			<FilterGroup
				title="Size"
				filterKey="sizes"
				options={FILTER_OPTIONS.sizes}
			/>
			<FilterGroup
				title="Color"
				filterKey="colors"
				options={FILTER_OPTIONS.colors}
			/>
			<FilterGroup
				title="Price Range"
				filterKey="priceRanges"
				options={FILTER_OPTIONS.priceRanges}
			/>
		</div>
	);

	return (
		<>
			<div className="lg:hidden mb-4">
				<Button
					onClick={() => setIsOpen(true)}
					variant="outline"
					className="w-full">
					<SlidersHorizontal className="w-4 h-4 mr-2" />
					Filters
				</Button>
			</div>

			{isOpen && (
				<div className="lg:hidden fixed inset-0 z-50">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute left-0 top-0 bottom-0 w-80 bg-light-100 p-6 overflow-y-auto shadow-xl">
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4"
							onClick={() => setIsOpen(false)}>
							<X className="w-5 h-5" />
						</Button>
						{filterContent}
					</div>
				</div>
			)}

			<div className="hidden lg:block sticky top-4">{filterContent}</div>
		</>
	);
}
