import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CardProps {
  id?: string | number;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  imageAlt?: string;
  category?: string;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  isSale?: boolean;
  href?: string;
  className?: string;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

const Card = ({
  title,
  description,
  price,
  originalPrice,
  imageUrl,
  imageAlt,
  category,
  colors = [],
  sizes = [],
  isNew = false,
  isSale = false,
  href,
  className,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}: CardProps) => {
  const cardContent = (
    <div className={cn(
      'group bg-light-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300',
      className
    )}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-light-200">
        <Image
          src={imageUrl}
          alt={imageAlt || title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-green text-light-100 px-2 py-1 text-caption font-medium rounded">
              New
            </span>
          )}
          {isSale && (
            <span className="bg-red text-light-100 px-2 py-1 text-caption font-medium rounded">
              Sale
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute top-3 right-3 p-2 bg-light-100/80 hover:bg-light-100 rounded-full transition-colors duration-200"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={cn(
                'w-5 h-5',
                isFavorite ? 'text-red fill-current' : 'text-dark-700'
              )}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Quick Add to Cart - appears on hover */}
        {onAddToCart && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              className="w-full bg-dark-900 text-light-100 py-2 px-4 text-body-medium font-medium rounded hover:bg-dark-700 transition-colors duration-200"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <p className="text-dark-700 text-caption font-medium mb-1 uppercase tracking-wide">
            {category}
          </p>
        )}

        {/* Title */}
        <h3 className="text-dark-900 text-body-medium font-medium mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-dark-700 text-body mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-dark-700 text-caption">Colors:</span>
            <div className="flex gap-1">
              {colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-light-400"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {colors.length > 4 && (
                <span className="text-dark-700 text-caption ml-1">
                  +{colors.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-dark-700 text-caption">Sizes:</span>
            <div className="flex gap-1 flex-wrap">
              {sizes.slice(0, 3).map((size, index) => (
                <span
                  key={index}
                  className="text-dark-700 text-caption bg-light-200 px-2 py-1 rounded"
                >
                  {size}
                </span>
              ))}
              {sizes.length > 3 && (
                <span className="text-dark-700 text-caption">
                  +{sizes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-dark-900 text-body-medium font-medium">
            ${price.toFixed(2)}
          </span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="text-dark-500 text-body line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-red text-caption font-medium">
                {Math.round(((originalPrice - price) / originalPrice) * 100)}% off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // If href is provided, wrap in Link
  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default Card;
