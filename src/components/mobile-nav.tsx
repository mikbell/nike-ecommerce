"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { signOut } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

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

interface User {
	name: string;
	email: string;
}

interface MobileNavProps {
	navLinks: NavLink[];
	currentUser: User | null;
}

const MobileNav = ({ navLinks, currentUser }: MobileNavProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const router = useRouter();

	const toggleMenu = () => {
		setIsMenuOpen((prev) => !prev);
	};

	const handleSignOut = async () => {
		await signOut();
		setIsMenuOpen(false);
		router.push("/");
		router.refresh();
	};

	return (
		<div className="md:hidden">
			<Button
				variant="ghost"
				onClick={toggleMenu}
				aria-label="Toggle menu">
				{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
			</Button>
			{isMenuOpen && (
				<div className="absolute top-full left-0 right-0 shadow-lg border-b border-border bg-card transition-all duration-300 z-50">
					<div className="px-4 py-3 space-y-2 flex flex-col">
						{currentUser ? (
							<div className="border-b border-border pb-3 mb-3">
								<div className="flex items-center gap-2 mb-2">
									<User className="h-5 w-5" />
									<span className="font-medium">{currentUser.name}</span>
								</div>
								<p className="text-sm text-muted-foreground mb-2">{currentUser.email}</p>
								<Button 
									variant="ghost" 
									className="w-full justify-start"
									onClick={handleSignOut}
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sign Out
								</Button>
							</div>
						) : (
							<div className="border-b border-border pb-3 mb-3 space-y-2">
								<Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
									<Button variant="ghost" className="w-full">Sign in</Button>
								</Link>
								<Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
									<Button variant="ghost" className="w-full">Sign up</Button>
								</Link>
							</div>
						)}

						{navLinks.map((link) => (
							<NavLink
								key={link.href}
								href={link.href}
								label={link.label}
								onClick={() => setIsMenuOpen(false)}
							/>
						))}

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
