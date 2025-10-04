"use client";

import React, { memo, useMemo, useState, useCallback, useEffect } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { ProductListItem } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// === Props Interface ===
interface ProductListProps {
  products: ProductListItem[];
  loading?: boolean;
  error?: string;
  className?: string;
  variant?: "grid" | "list";
  initialDisplayCount?: number;
  loadMoreCount?: number;
  onFavoriteToggle?: (productId: string) => void;
  favoriteIds?: Set<string>;
}

// === Empty State Component ===
const EmptyState = memo<{ message?: string }>(({ message = "No products found" }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-6xl mb-4 opacity-20">👟</div>
    <h3 className="text-lg font-medium text-foreground mb-2">
      {message}
    </h3>
    <p className="text-sm text-muted-foreground max-w-md">
      Try adjusting your search or filter criteria to find what you're looking for.
    </p>
  </div>
));

EmptyState.displayName = "EmptyState";

// === Loading State Component ===
const LoadingState = memo<{ count?: number }>(({ count = 12 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className="bg-background rounded-lg overflow-hidden shadow-sm ring-1 ring-border/50"
      >
        <div className="aspect-square bg-muted animate-pulse" />
        <div className="p-4 space-y-2">
          <div className="h-3 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
));

LoadingState.displayName = "LoadingState";

// === Error State Component ===
const ErrorState = memo<{ error: string; onRetry?: () => void }>(({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-6xl mb-4 opacity-20">⚠️</div>
    <h3 className="text-lg font-medium text-foreground mb-2">
      Something went wrong
    </h3>
    <p className="text-sm text-muted-foreground max-w-md mb-4">
      {error}
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    )}
  </div>
));

ErrorState.displayName = "ErrorState";

// === Load More Button Component ===
const LoadMoreButton = memo<{
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
}>(({ onClick, loading, hasMore }) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8">
      <Button
        onClick={onClick}
        disabled={loading}
        variant="outline"
        size="lg"
        className="min-w-32"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
});

LoadMoreButton.displayName = "LoadMoreButton";

// === Main ProductList Component ===
const ProductListOptimized = memo<ProductListProps>(({
  products,
  loading = false,
  error,
  className,
  variant = "grid",
  initialDisplayCount = 12,
  loadMoreCount = 12,
  onFavoriteToggle,
  favoriteIds = new Set(),
}) => {
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset display count when products change
  useEffect(() => {
    setDisplayCount(initialDisplayCount);
  }, [products, initialDisplayCount]);

  // === Memoized Values ===
  const displayedProducts = useMemo(() => {
    return products.slice(0, displayCount);
  }, [products, displayCount]);

  const hasMore = useMemo(() => {
    return displayCount < products.length;
  }, [displayCount, products.length]);

  const gridClassName = useMemo(() => {
    return cn(
      "grid gap-6",
      variant === "grid" 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1 md:grid-cols-2 gap-8",
      className
    );
  }, [variant, className]);

  // === Event Handlers ===
  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setDisplayCount(prev => Math.min(prev + loadMoreCount, products.length));
    setLoadingMore(false);
  }, [loadMoreCount, products.length]);

  const handleFavoriteToggle = useCallback((productId: string) => {
    onFavoriteToggle?.(productId);
  }, [onFavoriteToggle]);

  // === Render States ===
  if (loading && products.length === 0) {
    return <LoadingState count={initialDisplayCount} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!loading && products.length === 0) {
    return <EmptyState />;
  }

  // === Main Render ===
  return (
    <div className="space-y-6">
      <div className={gridClassName}>
        {displayedProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4} // Prioritize first 4 images
            onFavoriteToggle={handleFavoriteToggle}
            isFavorite={favoriteIds.has(product.id)}
            variant={variant === "list" ? "compact" : "default"}
          />
        ))}
      </div>

      {/* Load More Button */}
      <LoadMoreButton
        onClick={handleLoadMore}
        loading={loadingMore}
        hasMore={hasMore}
      />

      {/* Results Summary */}
      <div className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Showing {displayedProducts.length} of {products.length} products
        </p>
      </div>
    </div>
  );
});

ProductListOptimized.displayName = "ProductListOptimized";

export { ProductListOptimized };
export type { ProductListProps };