import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const Hero = () => {
	return (
		<section className="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-b from-background/90 to-background">
			{/* Decorative gradient blob */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-muted blur-3xl opacity-60 dark:opacity-40" />
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				{/* Badge: Usa secondary/secondary-foreground per il contrasto */}
				<Badge>Trending now</Badge>

				{/* Titolo: Usa foreground per il colore principale del testo */}
				<h1 className="mt-4 text-heading-1 tracking-tight text-foreground">
					Just Do It
				</h1>

				{/* Paragrafo: Usa muted-foreground per un testo leggermente meno in risalto */}
				<p className="mt-4 text-lead text-muted-foreground max-w-2xl mx-auto">
					Discover the latest Nike shoes and gear. From running to basketball,
					find your perfect fit and unleash your potential.
				</p>

				<div className="mt-8 flex items-center justify-center gap-4">
					<Button>Shop Now</Button>
					<Button variant="outline">Explore Collection</Button>
				</div>
			</div>
		</section>
	);
};

export default Hero;
