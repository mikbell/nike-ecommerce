import ProductList from "@/components/product-list";
import Hero from "@/components/hero";
import { Badge } from "@/components/ui/badge";
import { getAllProducts } from "@/lib/db/queries/products";

const Home = async () => {
	const products = await getAllProducts();
	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1">
				{/* Hero Section */}
				<Hero />

				{/* Featured Products */}
				<section className="py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center">
							<Badge>Curated for you</Badge>
							<h2 className="mt-4 text-heading-2 font-jost text-dark-900">
								Featured Products
							</h2>
							<p className="mt-2 text-dark-700">
								Our most-loved picks across running, basketball, and lifestyle.
							</p>
						</div>

						<ProductList products={products} />
					</div>
				</section>
			</main>
		</div>
	);
};

export default Home;
