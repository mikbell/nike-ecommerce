'use client';
import Card from '@/components/Card';

const Home = () => {
    const sampleShoes = [
        {
            title: "Air Jordan 1 Retro High OG",
            description: "Classic basketball shoe with premium leather construction",
            price: 170,
            originalPrice: 200,
            imageUrl: "/shoes/shoe-1.jpg", // Using placeholder from public folder
            category: "Basketball",
            colors: ["Black", "White", "Red"],
            sizes: ["8", "9", "10", "11"],
            isNew: true,
            href: "/product/air-jordan-1"
        },
        {
            title: "Nike Air Max 90",
            description: "Iconic running shoe with visible Air cushioning",
            price: 120,
            imageUrl: "/shoes/shoe-2.webp", // Using placeholder from public folder
            category: "Running",
            colors: ["White", "Black", "Grey"],
            sizes: ["7", "8", "9", "10", "11", "12"],
            isSale: true,
            href: "/product/air-max-90"
        },
        {
            title: "Nike Dunk Low",
            description: "Versatile lifestyle shoe with classic basketball DNA",
            price: 100,
            imageUrl: "/shoes/shoe-3.webp", // Using placeholder from public folder
            category: "Lifestyle",
            colors: ["White", "Black"],
            sizes: ["8", "9", "10"],
            href: "/product/dunk-low"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-b from-light-200 to-light-100">
                    {/* Decorative gradient blob */}
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute left-1/2 top-[-10%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[oklch(0.97_0.03_30)] blur-3xl opacity-60" />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-caption text-secondary-foreground">
                            Trending now
                        </span>
                        <h1 className="mt-4 text-heading-1 font-jost tracking-tight text-dark-900">
                            Just Do It
                        </h1>
                        <p className="mt-4 text-lead text-dark-700 max-w-2xl mx-auto">
                            Discover the latest Nike shoes and gear. From running to basketball,
                            find your perfect fit and unleash your potential.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <button className="rounded-md bg-primary px-6 py-3 text-body-medium font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                                Shop Now
                            </button>
                            <button className="rounded-md border border-border px-6 py-3 text-body-medium font-medium text-foreground transition-colors hover:bg-secondary">
                                Explore Collection
                            </button>
                        </div>
                    </div>
                </section>

                {/* Featured Products */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-caption text-secondary-foreground">
                                Curated for you
                            </span>
                            <h2 className="mt-4 text-heading-2 font-jost text-dark-900">
                                Featured Products
                            </h2>
                            <p className="mt-2 text-dark-700">
                                Our most-loved picks across running, basketball, and lifestyle.
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {sampleShoes.map((shoe, index) => (
                                <Card
                                    key={index}
                                    {...shoe}
                                    onAddToCart={() => console.log(`Added ${shoe.title} to cart`)}
                                    onToggleFavorite={() => console.log(`Toggled favorite for ${shoe.title}`)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
