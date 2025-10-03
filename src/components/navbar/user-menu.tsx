"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronDown, List } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserMenuProps {
	userName: string;
	userEmail: string;
}

export default function UserMenu({ userName, userEmail }: UserMenuProps) {
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	// Capitalize the first letter in a local variable for display
	const firstName = userName
		? userName.split(" ")[0].charAt(0).toUpperCase() +
		  userName.split(" ")[0].slice(1)
		: "User";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-2">
					<User className="h-5 w-5" />
					{/* Only show the name on wider screens (md:inline) */}
					<span className="hidden md:inline">Ciao, {firstName}</span>
					<ChevronDown className="h-5 w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{/* Display Name and Email in separate labels */}
				<DropdownMenuLabel>
					<span className="font-semibold">{userName}</span>
				</DropdownMenuLabel>
				<DropdownMenuLabel className="text-sm font-normal text-muted-foreground pt-0">
					{userEmail}
				</DropdownMenuLabel>

				<DropdownMenuItem className="cursor-pointer" asChild>
					<Link href="/account/orders">
						<List className="mr-2 h-4 w-4" />
						<span className="text-sm">I miei ordini</span>
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				{/* Sign Out Action */}
				<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
					<LogOut className="mr-2 h-4 w-4" />
					<span className="text-sm">Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
