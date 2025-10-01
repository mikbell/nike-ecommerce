import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface SocialProvidersProps {
	mode: "signin" | "signup";
}

export default function SocialProviders({ mode }: SocialProvidersProps) {
	const actionText = mode === "signin" ? "Continue with" : "Continue with";

	return (
		<div className="space-y-3">
			<Button
				variant="outline"
				className="w-full h-12 text-base font-medium"
				type="button"
			>
				<Image
					src="/google.svg"
					alt="Google"
					width={18}
					height={18}
					className="mr-3"
				/>
				{actionText} Google
			</Button>
			
			<Button
				variant="outline"
				className="w-full h-12 text-base font-medium"
				type="button"
			>
				<Image
					src="/apple.svg"
					alt="Apple"
					width={18}
					height={18}
					className="mr-3"
				/>
				{actionText} Apple
			</Button>
		</div>
	);
}
