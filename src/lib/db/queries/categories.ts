import { db } from "@/lib/db";

export async function getAllCategories() {
	try {
		const categories = await db.query.categories.findMany({
			with: {
				parent: true,
				children: true,
			},
		});
		return categories;
	} catch (error) {
		console.error('💥 Error in getAllCategories:', error);
		return [];
	}
}

export async function getCategoryBySlug(slug: string) {
	try {
		const category = await db.query.categories.findFirst({
			where: (categories, { eq }) => eq(categories.slug, slug),
			with: {
				parent: true,
				children: true,
			},
		});
		return category;
	} catch (error) {
		console.error('💥 Error in getCategoryBySlug:', error);
		return null;
	}
}

export async function getMainCategories() {
	try {
		const mainCategories = await db.query.categories.findMany({
			where: (categories, { isNull }) => isNull(categories.parentId),
			with: {
				children: true,
			},
		});
		return mainCategories;
	} catch (error) {
		console.error('💥 Error in getMainCategories:', error);
		return [];
	}
}

export async function getCategoryTree() {
	try {
		const categories = await getAllCategories();
		
		// Build tree structure
		const categoryMap = new Map();
		const rootCategories: Array<typeof categories[0] & { children: Array<typeof categories[0]> }> = [];

		// First pass: create map of all categories
		categories.forEach(category => {
			categoryMap.set(category.id, {
				...category,
				children: [],
			});
		});

		// Second pass: build tree structure
		categories.forEach(category => {
			const categoryNode = categoryMap.get(category.id);
			if (category.parentId) {
				const parent = categoryMap.get(category.parentId);
				if (parent) {
					parent.children.push(categoryNode);
				}
			} else {
				rootCategories.push(categoryNode);
			}
		});

		return rootCategories;
	} catch (error) {
		console.error('💥 Error in getCategoryTree:', error);
		return [];
	}
}