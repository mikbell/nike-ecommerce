import { NextResponse } from "next/server";
import { getCategoryTree } from "@/lib/db/queries/categories";

export async function GET() {
	try {
		const categories = await getCategoryTree();
		return NextResponse.json(categories);
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}