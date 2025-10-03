import { cn } from "@/lib/utils";

import Logo from "@/components/logo";
import MobileNav from "@/components/navbar/mobile-nav";
import DesktopNav from "@/components/navbar/desktop-nav";
import CategoryMenu from "@/components/category-menu";
import { getCurrentUser } from "@/lib/auth/actions";

interface NavbarProps {
	className?: string;
}

const Navbar = async ({ className }: NavbarProps) => {
	const navLinks = [
		{ href: "/products?sort=newest", label: "New & Featured" },
		{ href: "/products/category/men", label: "Men" },
		{ href: "/products/category/women", label: "Women" },
		{ href: "/products/category/kids", label: "Kids" },
		{ href: "/products?priceRanges=0-50,50-100", label: "Sale" },
	];

	const currentUser = await getCurrentUser();

	return (
		<nav
			className={cn(
				"bg-background border-b border-border sticky top-0 z-50",
				className
			)}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<Logo />
					{/* Desktop Navigation with Category Menu */}
					<div className="hidden md:flex items-center flex-1 justify-center">
						<CategoryMenu />
					</div>
					<DesktopNav navLinks={navLinks} currentUser={currentUser} />
					<MobileNav navLinks={navLinks} currentUser={currentUser} />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
