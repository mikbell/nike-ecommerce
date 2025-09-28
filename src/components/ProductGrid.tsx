'use client';

import { useEffect } from 'react';
import { useProductStore } from '@/lib/store/products';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { products, loading, error, setProducts, setLoading, setError } = useProductStore();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [setProducts, setLoading, setError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>Error loading products: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-600 py-8">
        <p>No products found. Make sure to seed the database first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}