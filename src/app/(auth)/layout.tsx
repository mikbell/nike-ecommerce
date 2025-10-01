import Logo from "@/components/logo";
import React from "react";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Left side: In Light Mode, è scuro (come branding). In Dark Mode, useremo i colori invertiti (ad esempio, primary/primary-foreground)
	// per mantenere un tema di branding distintivo, ma coerente.
	const brandingBgClass = "bg-primary text-primary-foreground"; // Primary background in Light Mode (scuro/branding), che si inverte.
	const brandingGradient = "bg-gradient-to-br from-primary to-primary/80"; // Gradiente basato su primary

	return (
		// Lo sfondo generale del layout dovrebbe essere background
		<div className="min-h-screen flex bg-background transition-colors duration-300">
			{/* Left side - Branding (Visibile solo su schermi grandi) */}
			<div
				className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${brandingBgClass}`}>
				{/* Decorative Gradient Overlay */}
				<div className={`absolute inset-0 -z-10 ${brandingGradient}`} />

				<div className="relative z-10 flex flex-col justify-between p-12">
					{/* Logo (Ora usa colori semantici: card/card-foreground) */}
					<div className="flex items-center">
						<Logo />
					</div>

					{/* Main content */}
					<div className="space-y-6">
						<h1 className="text-heading-2 md:text-heading-1 font-bold leading-tight">
							Just Do It
						</h1>
						{/* Testo di supporto: usiamo un colore con opacità per il testo secondario */}
						<p className="text-lead text-white/70 max-w-md">
							Join millions of athletes and fitness enthusiasts who trust Nike
							for their performance needs.
						</p>

						{/* Dots indicator */}
						<div className="flex space-x-2">
							{/* Dot attivo: bg-white per contrasto con bg-primary */}
							<div className="w-2 h-2 bg-white rounded-full" />
							{/* Dot inattivo: opacità per un colore più tenuo */}
							<div className="w-2 h-2 bg-white/30 rounded-full" />
							<div className="w-2 h-2 bg-white/30 rounded-full" />
						</div>
					</div>

					{/* Footer */}
					{/* Il testo usa l'opacità per renderlo sottile */}
					<div className="text-white/70 text-sm">
						© {new Date().getFullYear()} Nike. All rights reserved.
					</div>
				</div>
			</div>

			{/* Right side - Form (Contenitore principale) */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
				<div className="w-full max-w-md">{children}</div>
			</div>
		</div>
	);
}
