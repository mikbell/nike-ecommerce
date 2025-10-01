"use client";

import React from "react";
import { Button } from "./ui/button";
import { User, LogOut, ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

interface UserMenuProps {
	userName: string;
	userEmail: string;
}

export default function UserMenu({ userName, userEmail }: UserMenuProps) {
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
		// router.refresh() is generally not needed after router.push to a new route
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

				<DropdownMenuSeparator />

				{/* Sign Out Action */}
				<DropdownMenuItem
					onClick={handleSignOut}
					className="cursor-pointer" // Add a cursor to reinforce interactivity
				>
					<LogOut className="mr-2 h-4 w-4" />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
