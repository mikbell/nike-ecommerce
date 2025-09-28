'use client';

import Image from 'next/image';
import { Product } from '@/lib/store/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-64 w-full">
        <Image
          src={product.imageUrl || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price}
          </span>
          <span className="text-sm text-gray-500">
            {product.brand}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <span>Size: {product.size}</span>
          <span>Color: {product.color}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Stock: {product.stock}
          </span>
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}