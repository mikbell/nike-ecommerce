import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Heart,
	ShoppingBag,
	Star,
	StarHalf,
	Package,
	RotateCcw,
	ShoppingCart,
} from "lucide-react";
import ProductGallery from "@/components/product-gallery";
import SizePicker from "@/components/size-picker";
import CollapsibleSection from "@/components/collapsible-section";
import {
	getProductBySlug,
	getRelatedProducts,
} from "@/lib/db/queries/products";
import RelatedProducts from "@/components/related-products";

interface ProductPageProps {
	params: Promise<{
		slug: string;
	}>;
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { slug } = await params;
	const product = await getProductBySlug(slug);

	if (!product) {
		notFound();
	}

	const relatedProducts = await getRelatedProducts(product.id, 4);
	const currentVariant = product.variants[0];
	const fullStars = Math.floor(product.reviews.averageRating);
	const hasHalfStar = product.reviews.averageRating % 1 >= 0.5;

	const discount = product.originalPrice
		? Math.round(
				((product.originalPrice - product.price) / product.originalPrice) * 100
		  )
		: 0;

	return (
		<div className="min-h-screen bg-light-100">
			<main className="py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
						<div>
							<ProductGallery
								variants={product.variants}
								productTitle={product.title}
							/>
						</div>

						<div className="flex flex-col gap-6">
							<div className="flex items-center gap-2">
								{product.isNew && <Badge>New Release</Badge>}
								{product.isSale && <Badge variant="destructive">Sale</Badge>}
								<span className="text-caption text-dark-700 uppercase tracking-wide">
									{product.category}
								</span>
							</div>

							<div>
								<h1 className="text-heading-2 font-jost text-dark-900 mb-2">
									{product.title}
								</h1>
								<p className="text-body text-dark-700 mb-4">
									{product.gender}&apos;s Shoes
								</p>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex items-center gap-1">
									{[...Array(fullStars)].map((_, i) => (
										<Star key={i} className="w-5 h-5 fill-orange text-orange" />
									))}
									{hasHalfStar && (
										<StarHalf className="w-5 h-5 fill-orange text-orange" />
									)}
									{[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map(
										(_, i) => (
											<Star
												key={`empty-${i}`}
												className="w-5 h-5 text-dark-300"
											/>
										)
									)}
								</div>
								<span className="text-body text-dark-700">
									{product.reviews.averageRating} (
									{product.reviews.totalReviews} reviews)
								</span>
							</div>

							<div className="flex items-center gap-3">
								<span className="text-heading-3 font-jost text-dark-900">
									${product.price.toFixed(2)}
								</span>
								{product.originalPrice &&
									product.originalPrice > product.price && (
										<>
											<span className="text-body text-dark-500 line-through">
												${product.originalPrice.toFixed(2)}
											</span>
											<Badge variant="destructive">{discount}% OFF</Badge>
										</>
									)}
							</div>

							<div className="border-t border-light-400 pt-6">
								<p className="text-body text-dark-700 leading-relaxed">
									{product.description}
								</p>
							</div>

							<div className="border-t border-light-400 pt-6">
								<SizePicker sizes={currentVariant.sizes} />
							</div>

							<div className="flex flex-col sm:flex-row gap-3">
								<Button variant="outline" className="flex-1 h-12 text-body-medium" size="lg">
									<ShoppingCart className="w-5 h-5 mr-2" />
									Add to Cart
								</Button>
								<Button variant="outline" size="lg" className="h-12">
									<Heart className="w-5 h-5" />
								</Button>
							</div>

							<div className="border-t border-light-400 pt-6 space-y-4">
								<CollapsibleSection title="Product Details" defaultOpen>
									<div className="space-y-4">
										<div>
											<p className="font-medium text-dark-900 mb-2">
												Materials
											</p>
											<ul className="list-disc list-inside space-y-1">
												{product.details.materials.map((material, index) => (
													<li key={index}>{material}</li>
												))}
											</ul>
										</div>
										<div>
											<p className="font-medium text-dark-900 mb-2">Features</p>
											<ul className="list-disc list-inside space-y-1">
												{product.details.features.map((feature, index) => (
													<li key={index}>{feature}</li>
												))}
											</ul>
										</div>
										<div className="grid grid-cols-2 gap-4 pt-2">
											<div>
												<p className="text-caption text-dark-700 mb-1">
													Style Code
												</p>
												<p className="text-body font-medium text-dark-900">
													{product.details.styleCode}
												</p>
											</div>
											<div>
												<p className="text-caption text-dark-700 mb-1">
													Colorway
												</p>
												<p className="text-body font-medium text-dark-900">
													{product.details.colorway}
												</p>
											</div>
										</div>
									</div>
								</CollapsibleSection>

								<CollapsibleSection title="Shipping & Returns">
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											<Package className="w-5 h-5 text-dark-700 mt-1 flex-shrink-0" />
											<div>
												<p className="font-medium text-dark-900 mb-1">
													Free Shipping
												</p>
												<p className="text-body text-dark-700">
													Free standard shipping on orders over $50. Express
													shipping available at checkout.
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<RotateCcw className="w-5 h-5 text-dark-700 mt-1 flex-shrink-0" />
											<div>
												<p className="font-medium text-dark-900 mb-1">
													Easy Returns
												</p>
												<p className="text-body text-dark-700">
													Free returns within 60 days of purchase. Items must be
													unworn and in original packaging.
												</p>
											</div>
										</div>
									</div>
								</CollapsibleSection>

								<CollapsibleSection title="Reviews">
									<div className="text-center py-8">
										<p className="text-body text-dark-700 mb-2">
											Be the first to review this product
										</p>
										<Button variant="outline" size="sm">
											Write a Review
										</Button>
									</div>
								</CollapsibleSection>
							</div>
						</div>
					</div>

					<RelatedProducts relatedProducts={relatedProducts} />
				</div>
			</main>
		</div>
	);
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
	const { slug } = await params;
	const product = await getProductBySlug(slug);

	if (!product) {
		return {
			title: "Product Not Found",
		};
	}

	return {
		title: `${product.title} - ${product.brand}`,
		description: product.description,
		openGraph: {
			title: `${product.title} - ${product.brand}`,
			description: product.description,
			images: product.variants[0]?.images[0]
				? [product.variants[0].images[0]]
				: [],
		},
	};
}
