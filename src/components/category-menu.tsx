"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

interface Category {
	id: string;
	name: string;
	slug: string;
	children?: Category[];
}

interface CategoryMenuProps {
	className?: string;
}

export default function CategoryMenu({ className }: CategoryMenuProps) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await fetch("/api/categories");
				if (!res.ok) throw new Error("Failed to fetch categories");
				const data = await res.json();
				setCategories(data);
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchCategories();
	}, []);

	if (loading) {
		return (
			<div className={cn("flex items-center space-x-6", className)}>
				<div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
				<div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
				<div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
			</div>
		);
	}

	return (
		<NavigationMenu className={className}>
			<NavigationMenuList>
				<NavigationMenuItem>
					<Link href="/products" legacyBehavior passHref>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							All Products
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>

				{categories.map((category) => (
					<NavigationMenuItem key={category.id}>
						{category.children && category.children.length > 0 ? (
							<>
								<NavigationMenuTrigger>
									{category.name}
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
										<div className="col-span-2">
											<Link
												href={`/products/category/${category.slug}`}
												className="block p-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
											>
												<div className="text-sm font-medium leading-none">
													All {category.name}
												</div>
												<p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
													Browse all {category.name.toLowerCase()} products
												</p>
											</Link>
										</div>
										{category.children.map((subcategory) => (
											<Link
												key={subcategory.id}
												href={`/products/category/${subcategory.slug}`}
												className="block p-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
											>
												<div className="text-sm font-medium leading-none">
													{subcategory.name}
												</div>
											</Link>
										))}
									</div>
								</NavigationMenuContent>
							</>
						) : (
							<Link href={`/products/category/${category.slug}`} legacyBehavior passHref>
								<NavigationMenuLink className={navigationMenuTriggerStyle()}>
									{category.name}
								</NavigationMenuLink>
							</Link>
						)}
					</NavigationMenuItem>
				))}

				<NavigationMenuItem>
					<Link href="/products?sort=newest" legacyBehavior passHref>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							New & Featured
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>

				<NavigationMenuItem>
					<Link href="/products?priceRanges=0-50,50-100" legacyBehavior passHref>
						<NavigationMenuLink className={navigationMenuTriggerStyle()}>
							Sale
						</NavigationMenuLink>
					</Link>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}