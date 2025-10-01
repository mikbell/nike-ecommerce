import React from "react";
import { Button } from "./ui/button";
import { Search, Heart, ShoppingCart } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";

const DesktopNav = ({ navLinks }: { navLinks: { href: string; label: string }[] }) => {
	return (
		<>
			<div className="hidden md:block">
				<div className="ml-10 flex items-baseline gap-8">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-dark-900 hover:text-dark-700 px-3 py-2 text-body font-medium transition-colors duration-200">
							{link.label}
						</Link>
					))}
				</div>
			</div>
			<div className="hidden md:flex items-center">
				<Link href="/sign-in">
					<Button variant="ghost">Sign in</Button>
				</Link>

				<Link href="/sign-up">
					<Button variant="ghost">Sign up</Button>
				</Link>

				{/* Search */}
				<Button variant="ghost">
					<Search />
				</Button>

				{/* Favorites */}
				<Button variant="ghost">
					<Heart />
				</Button>

				{/* Cart */}
				<Button variant="ghost" className="relative">
					<ShoppingCart />
					<span className="absolute -top-1 -right-1 bg-red text-light-100 text-footnote rounded-full h-4 w-4 flex items-center justify-center">
						0
					</span>
				</Button>
				<ModeToggle />
			</div>
		</>
	);
};

export default DesktopNav;
