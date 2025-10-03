import queryString from "query-string";

export type ProductFilters = {
	genders?: string[];
	sizes?: string[];
	colors?: string[];
	priceRanges?: string[];
	sort?: string;
};

function toStringArray(
	value: string | (string | null)[] | null | undefined
): string[] | undefined {
	if (!value) return undefined;
	const arr = Array.isArray(value) ? value : [value];
	const filtered = arr.filter((v): v is string => v !== null);
	return filtered.length > 0 ? filtered : undefined;
}

export function parseFiltersFromQuery(
	query: string | Record<string, string | string[] | undefined>
): ProductFilters {
	const parsed = typeof query === "string" ? queryString.parse(query, { arrayFormat: "bracket" }) : query;
	
	return {
		genders: toStringArray(parsed.genders || parsed["genders[]"]),
		sizes: toStringArray(parsed.sizes || parsed["sizes[]"]),
		colors: toStringArray(parsed.colors || parsed["colors[]"]),
		priceRanges: toStringArray(parsed.priceRanges || parsed["priceRanges[]"]),
		sort: typeof parsed.sort === "string" ? parsed.sort : undefined,
	};
}

export function stringifyFiltersToQuery(filters: ProductFilters): string {
	const cleaned = Object.fromEntries(
		Object.entries(filters).filter(
			([, value]) =>
				value !== undefined &&
				value !== null &&
				(Array.isArray(value) ? value.length > 0 : true)
		)
	);
	return queryString.stringify(cleaned, { arrayFormat: "bracket" });
}

export function updateQueryParam(
	currentQuery: string,
	key: string,
	value: string | string[]
): string {
	const parsed = queryString.parse(currentQuery);
	parsed[key] = value;
	return queryString.stringify(parsed, { arrayFormat: "bracket" });
}

export function removeQueryParam(currentQuery: string, key: string): string {
	const parsed = queryString.parse(currentQuery);
	delete parsed[key];
	return queryString.stringify(parsed, { arrayFormat: "bracket" });
}
