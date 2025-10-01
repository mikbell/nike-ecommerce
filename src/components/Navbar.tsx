import { cn } from "@/lib/utils";

import Logo from "./logo";
import MobileNav from "./mobile-menu";
import DesktopNav from "./desktop-nav";
import { getCurrentUser } from "@/lib/auth/actions";

interface NavbarProps {
	className?: string;
}

const Navbar = async ({ className }: NavbarProps) => {
	const navLinks = [
		{ href: "/new", label: "New & Featured" },
		{ href: "/men", label: "Men" },
		{ href: "/women", label: "Women" },
		{ href: "/kids", label: "Kids" },
		{ href: "/sale", label: "Sale" },
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
					<DesktopNav navLinks={navLinks} currentUser={currentUser} />
					<MobileNav navLinks={navLinks} currentUser={currentUser} />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
