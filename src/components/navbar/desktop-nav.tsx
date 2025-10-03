import React from "react";
import { Button } from "../ui/button";
import { Search, Heart } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import UserMenu from "./user-menu";
import CartDrawer from "../cart/cart-drawer";

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
			<div className="hidden md:flex items-center">
				{currentUser ? (
					<UserMenu userName={currentUser.name} userEmail={currentUser.email} />
				) : (
					<>
						<Link href="/sign-in">
							<Button variant="ghost">Sign in</Button>
						</Link>

						<Link href="/sign-up">
							<Button variant="default">Sign up</Button>
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
	);
};

export default DesktopNav;
