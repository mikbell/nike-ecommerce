import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
	className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
	return (
		<nav 
			className={cn("flex items-center space-x-2 text-sm text-dark-600", className)}
			aria-label="Breadcrumb"
		>
			<Link 
				href="/" 
				className="hover:text-dark-900 transition-colors"
				aria-label="Home"
			>
				<Home className="w-4 h-4" />
			</Link>
			
			{items.map((item, index) => (
				<div key={index} className="flex items-center space-x-2">
					<ChevronRight className="w-4 h-4 text-dark-400" />
					{item.href ? (
						<Link 
							href={item.href}
							className="hover:text-dark-900 transition-colors"
						>
							{item.label}
						</Link>
					) : (
						<span className="text-dark-900 font-medium">
							{item.label}
						</span>
					)}
				</div>
			))}
		</nav>
	);
}