"use client";

import React, { memo, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { ProductListItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddToCart } from "@/lib/stores/cart-store.optimized";

// === Props Interface ===
interface ProductCardProps {
  product: ProductListItem;
  priority?: boolean;
  showQuickActions?: boolean;
  onFavoriteToggle?: (productId: string) => void;
  isFavorite?: boolean;
  className?: string;
  variant?: "default" | "compact" | "featured";
}

// === Color Display Component ===
const ColorDots = memo<{ colors: string[]; limit?: number }>(({ colors, limit = 4 }) => {
  const displayColors = colors.slice(0, limit);
  const remainingCount = Math.max(0, colors.length - limit);

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">Colors:</span>
      <div className="flex items-center gap-1">
        {displayColors.map((color, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full border border-border"
            style={{ backgroundColor: color.toLowerCase() }}
            title={color}
            aria-label={`Color: ${color}`}
          />
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  );
});

ColorDots.displayName = "ColorDots";

// === Size Display Component ===
const SizeInfo = memo<{ sizes: string[]; limit?: number }>(({ sizes, limit = 3 }) => {
  const displaySizes = sizes.slice(0, limit);
  const remainingCount = Math.max(0, sizes.length - limit);

  if (sizes.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">Sizes:</span>
      <div className="flex items-center gap-1">
        {displaySizes.map((size, index) => (
          <span
            key={index}
            className="text-xs bg-muted px-1.5 py-0.5 rounded"
          >
            {size}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-muted-foreground">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  );
});

SizeInfo.displayName = "SizeInfo";

// === Rating Component ===
const Rating = memo<{ rating?: number; className?: string }>(({ rating, className }) => {
  if (!rating) return null;

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3 h-3",
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          )}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
});

Rating.displayName = "Rating";

// === Main ProductCard Component ===
const ProductCard = memo<ProductCardProps>(({
  product,
  priority = false,
  showQuickActions = true,
  onFavoriteToggle,
  isFavorite = false,
  className,
  variant = "default"
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const addToCart = useAddToCart();

  // === Memoized Values ===
  const discount = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return calculateDiscount(product.originalPrice, product.price);
    }
    return null;
  }, [product.price, product.originalPrice]);

  const badgeVariant = useMemo(() => {
    if (product.isSale) return "destructive";
    if (product.isNew) return "default";
    return null;
  }, [product.isSale, product.isNew]);

  // === Event Handlers ===
  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(product.id);
  }, [onFavoriteToggle, product.id]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For now, we'll use a default variant - in a real scenario,
    // this would open a variant selector or use the first available variant
    addToCart({
      productId: product.id,
      variantId: `${product.id}-default`, // This should be actual variant ID
      name: product.title,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      size: product.sizes[0] || "M",
      color: product.colors[0] || "Default",
      maxQuantity: 10, // This should come from inventory
    });
  }, [addToCart, product]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // === Variant Styles ===
  const variantStyles = useMemo(() => {
    const base = "group bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-border/50";
    
    switch (variant) {
      case "compact":
        return cn(base, "max-w-sm");
      case "featured":
        return cn(base, "lg:col-span-2", className);
      default:
        return cn(base, className);
    }
  }, [variant, className]);

  // === Render ===
  return (
    <article className={variantStyles} role="article">
      <Link href={product.href} className="block">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageError ? "/images/placeholder-product.jpg" : product.imageUrl}
            alt={product.title}
            fill
            className={cn(
              "object-cover group-hover:scale-105 transition-transform duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            sizes={
              variant === "featured" 
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 50vw, 25vw"
            }
            priority={priority}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge variant="default" size="sm">
                New
              </Badge>
            )}
            {product.isSale && discount && (
              <Badge variant="destructive" size="sm">
                -{discount.percentage}%
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  isFavorite && "text-red-500"
                )}
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </Button>
            </div>
          )}

          {/* Quick Add Button */}
          {showQuickActions && product.sizes.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={handleAddToCart}
                className="w-full h-8 text-xs"
                aria-label={`Add ${product.title} to cart`}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Quick Add
              </Button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-2">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              {product.category}
            </p>
          )}

          {/* Title */}
          <h3 className="font-medium text-sm leading-tight line-clamp-2">
            {product.title}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-muted-foreground">
              {product.brand}
            </p>
          )}

          {/* Rating */}
          {product.rating && (
            <Rating rating={product.rating} />
          )}

          {/* Colors */}
          {product.colors.length > 0 && (
            <ColorDots colors={product.colors} />
          )}

          {/* Sizes */}
          <SizeInfo sizes={product.sizes} />

          {/* Price */}
          <div className="flex items-center gap-2 pt-1">
            <span className="font-semibold text-sm">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export { ProductCard };
export type { ProductCardProps };