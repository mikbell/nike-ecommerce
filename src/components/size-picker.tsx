"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Size {
	size: string;
	inStock: boolean;
}

interface SizePickerProps {
	sizes: Size[];
}

export default function SizePicker({ sizes }: SizePickerProps) {
	const [selectedSize, setSelectedSize] = useState<string | null>(null);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<p className="text-body-medium font-medium text-dark-900">Select Size</p>
				{selectedSize && (
					<p className="text-body text-dark-700">
						Size: <span className="font-medium text-dark-900">{selectedSize}</span>
					</p>
				)}
			</div>
			
			<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
				{sizes.map(({ size, inStock }) => (
					<button
						key={size}
						onClick={() => inStock && setSelectedSize(size)}
						disabled={!inStock}
						className={cn(
							"relative py-3 px-4 rounded-md border-2 transition-all duration-200 text-body-medium font-medium",
							!inStock && "cursor-not-allowed opacity-40",
							inStock && selectedSize === size && "border-dark-900 bg-dark-900 text-light-100",
							inStock && selectedSize !== size && "border-light-400 hover:border-dark-500 text-dark-900",
							!inStock && "border-light-400 text-dark-500"
						)}
						aria-label={`Size ${size} ${!inStock ? "(Out of stock)" : ""}`}>
						{size}
						{!inStock && (
							<span className="absolute inset-0 flex items-center justify-center">
								<span className="w-full h-px bg-dark-500 rotate-[-45deg]" />
							</span>
						)}
					</button>
				))}
			</div>

			{!selectedSize && (
				<p className="text-caption text-dark-700 italic">
					Please select a size to continue
				</p>
			)}
		</div>
	);
}
