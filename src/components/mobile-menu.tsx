"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const NavLink = ({
	href,
	label,
	className,
	onClick,
}: {
	href: string;
	label: string;
	className?: string;
	onClick?: () => void;
}) => (
	<Link href={href} className={className} onClick={onClick}>
		{label}
	</Link>
);

interface NavLink {
	href: string;
	label: string;
}

interface MobileNavProps {
	navLinks: NavLink[];
}

// Unifichiamo la logica di trigger e menu per un'unica gestione dello stato (isMenuOpen)
const MobileNav = ({ navLinks }: MobileNavProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen((prev) => !prev);
	};

	return (
		<div className="md:hidden">
			{/* Trigger (Visibile su Mobile) */}
			<Button
				variant="ghost"
				onClick={toggleMenu}
				aria-label="Toggle menu">
				{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</Button>
			{isMenuOpen && (
				<div className="absolute top-full left-0 right-0 shadow-lg border-b border-border bg-card transition-all duration-300 z-50">
					<div className="px-4 py-3 space-y-2 flex flex-col">
						{/* Links di Navigazione */}
						{navLinks.map((link) => (
							<NavLink
								key={link.href}
								href={link.href}
								label={link.label}
								onClick={() => setIsMenuOpen(false)}
							/>
						))}

						{/* Mobile icons - Usano text-foreground per le icone */}
						<div className="flex items-center space-x-4 border-t border-border mt-4 pt-4">
							<Button variant="ghost">
								<Search className="h-6 w-6" />
							</Button>

							<Button variant="ghost">
								<Heart className="h-6 w-6" />
							</Button>

							<Button variant="ghost" className="relative">
								<ShoppingCart className="h-6 w-6" />
								<span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-destructive text-primary-foreground text-footnote rounded-full h-5 w-5 flex items-center justify-center font-bold text-xs">
									0
								</span>
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MobileNav;
