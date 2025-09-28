import ProductGrid from '@/components/ProductGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Nike Store</h1>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                Sign In
              </button>
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
                Cart (0)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Featured Products
          </h2>
          <p className="text-gray-600">
            Discover the latest Nike products and gear
          </p>
        </div>
        
        <ProductGrid />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Nike E-commerce. Built with Next.js, TypeScript, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
