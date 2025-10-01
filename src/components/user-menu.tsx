"use client";

import React from "react";
import { Button } from "./ui/button";
import { User, LogOut } from "lucide-react";
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
		router.refresh();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="flex items-center gap-2">
					<User className="h-5 w-5" />
					<span className="hidden md:inline">{userName}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem disabled className="text-sm text-muted-foreground">
					{userEmail}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut}>
					<LogOut className="mr-2 h-4 w-4" />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
