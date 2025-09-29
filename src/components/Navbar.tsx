"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { Search, Heart, ShoppingCart, Menu, X } from "lucide-react";
interface NavbarProps {
	className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const navLinks = [
		{ href: "/new", label: "New & Featured" },
		{ href: "/men", label: "Men" },
		{ href: "/women", label: "Women" },
		{ href: "/kids", label: "Kids" },
		{ href: "/sale", label: "Sale" },
	];

	return (
		<nav
			className={cn(
				"bg-light-100 border-b border-light-300 sticky top-0 z-50",
				className
			)}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div className="flex-shrink-0">
						<Link
							href="/"
							className="flex items-center text-dark-900 font-bold text-2xl font-jost">
							<Image src="/logo.svg" alt="Logo" width={100} height={100} className="w-16 h-16"/>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-8">
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

					{/* Right side icons */}
					<div className="hidden md:flex items-center space-x-4">
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
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden">
						<Button
							variant="ghost"
							onClick={toggleMenu}
							aria-label="Toggle menu">
							{isMenuOpen ? <X /> : <Menu />}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation Menu */}
				{isMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 bg-light-100 border-t border-light-300">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-dark-900 hover:text-dark-700 block px-3 py-2 text-body font-medium transition-colors duration-200"
									onClick={() => setIsMenuOpen(false)}>
									{link.label}
								</Link>
							))}

							{/* Mobile icons */}
							<div className="flex items-center space-x-4 px-3 py-2 border-t border-light-300 mt-4 pt-4">
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
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
