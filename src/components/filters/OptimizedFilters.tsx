"use client";

import React, { Suspense, lazy, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useFilterUrlSync } from '@/lib/filters/url-sync';
import { useFilterMemoryManagement, FilterSidebarSkeleton } from '@/lib/filters/performance';
import { useFilterStore } from '@/lib/stores/filter-store';
import { toast } from 'sonner';

// Lazy load the filter sidebar for better initial performance
const FilterSidebar = lazy(() => import('./FilterSidebar'));

// === Error Fallback Component ===
const FilterErrorFallback: React.FC<{ 
  error: Error; 
  resetErrorBoundary: () => void; 
}> = ({ error, resetErrorBoundary }) => (
  <div className="w-80 p-6 bg-red-50 border border-red-200 rounded-lg">
    <h3 className="text-red-800 font-medium mb-2">Errore nei Filtri</h3>
    <p className="text-red-600 text-sm mb-4">
      Si è verificato un errore nel caricamento dei filtri.
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
    >
      Riprova
    </button>
    {process.env.NODE_ENV === 'development' && (
      <details className="mt-4">
        <summary className="text-red-700 cursor-pointer">Dettagli errore</summary>
        <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap">
          {error.message}
        </pre>
      </details>
    )}
  </div>
);

// === Main Optimized Filters Component ===
const OptimizedFilters: React.FC<{ 
  className?: string;
  onFilterChange?: (activeCount: number) => void;
}> = ({ className, onFilterChange }) => {
  // Initialize URL synchronization
  useFilterUrlSync();
  
  // Setup memory management
  useFilterMemoryManagement();
  
  // Track filter changes for parent component
  const activeFiltersCount = useFilterStore(state => 
    Object.keys(state.filters).filter(key => {
      const value = state.filters[key as keyof typeof state.filters];
      return value !== undefined && 
             value !== null && 
             (!Array.isArray(value) || value.length > 0);
    }).length
  );

  useEffect(() => {
    onFilterChange?.(activeFiltersCount);
  }, [activeFiltersCount, onFilterChange]);

  // Handle filter errors
  const handleFilterError = (error: Error, errorInfo: any) => {
    console.error('Filter Error:', error, errorInfo);
    
    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: window.Sentry?.captureException(error);
    }
    
    toast.error('Errore nel sistema di filtri. Ricarica la pagina se il problema persiste.');
  };

  return (
    <ErrorBoundary
      FallbackComponent={FilterErrorFallback}
      onError={handleFilterError}
      onReset={() => {
        // Reset filter store on error recovery
        useFilterStore.getState().resetStore();
      }}
    >
      <Suspense fallback={<FilterSidebarSkeleton />}>
        <FilterSidebar className={className} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default OptimizedFilters;