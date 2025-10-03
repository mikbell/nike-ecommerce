import React from "react";
import { Button } from "./ui/button";
import { Search, Heart } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import UserMenu from "./user-menu";
import CartDrawer from "./cart/cart-drawer";

interface User {
	name: string;
	email: string;
}

const DesktopNav = ({
	navLinks,
	currentUser,
}: {
	navLinks: { href: string; label: string }[];
	currentUser: User | null;
}) => {
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
				{currentUser ? (
					<UserMenu userName={currentUser.name} userEmail={currentUser.email} />
				) : (
					<>
						<Link href="/sign-in">
							<Button variant="ghost">Sign in</Button>
						</Link>

						<Link href="/sign-up">
							<Button variant="ghost">Sign up</Button>
						</Link>
					</>
				)}

				<Button variant="ghost">
					<Search />
				</Button>

				<Button variant="ghost">
					<Heart />
				</Button>

				<CartDrawer />
				<ModeToggle />
			</div>
		</>
	);
};

export default DesktopNav;
