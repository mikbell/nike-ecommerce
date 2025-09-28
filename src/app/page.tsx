'use client';

import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Footer from '@/components/Footer';

const Home = () => {
    // Sample shoe data for demonstration
    const sampleShoes = [
        {
            title: "Air Jordan 1 Retro High OG",
            description: "Classic basketball shoe with premium leather construction",
            price: 170,
            originalPrice: 200,
            imageUrl: "/next.svg", // Using placeholder from public folder
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
            imageUrl: "/vercel.svg", // Using placeholder from public folder
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
            imageUrl: "/globe.svg", // Using placeholder from public folder
            category: "Lifestyle",
            colors: ["White", "Black"],
            sizes: ["8", "9", "10"],
            href: "/product/dunk-low"
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-light-200 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-heading-1 font-jost text-dark-900 mb-4">
                            Just Do It
                        </h1>
                        <p className="text-lead text-dark-700 mb-8 max-w-2xl mx-auto">
                            Discover the latest Nike shoes and gear. From running to basketball, 
                            find your perfect fit and unleash your potential.
                        </p>
                        <button className="bg-dark-900 text-light-100 px-8 py-3 text-body-medium font-medium rounded hover:bg-dark-700 transition-colors duration-200">
                            Shop Now
                        </button>
                    </div>
                </section>

                {/* Featured Products */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-heading-2 font-jost text-dark-900 mb-8 text-center">
                            Featured Products
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            <Footer />
        </div>
    );
}

export default Home;
