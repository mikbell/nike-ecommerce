"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}

export default function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="border-b border-light-400 pb-4">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-between w-full text-left py-4"
				aria-expanded={isOpen}>
				<h3 className="text-body-medium font-medium text-dark-900">{title}</h3>
				<ChevronDown
					className={cn(
						"w-5 h-5 text-dark-700 transition-transform duration-200",
						isOpen && "rotate-180"
					)}
				/>
			</button>
			{isOpen && (
				<div className="text-body text-dark-700 space-y-2 pb-2">
					{children}
				</div>
			)}
		</div>
	);
}
