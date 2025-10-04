"use client";

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useIntersectionObserver } from 'usehooks-ts';
import { FilterState, FilterOption, FilterAnalytics } from '@/types/filters';
import { useFilterStore } from '@/lib/stores/filter-store';
import { cleanFilters } from '@/lib/filters/engine';

// === Performance Monitoring ===
export class FilterPerformanceMonitor {
  private static instance: FilterPerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: Set<(metrics: Record<string, number>) => void> = new Set();

  static getInstance(): FilterPerformanceMonitor {
    if (!FilterPerformanceMonitor.instance) {
      FilterPerformanceMonitor.instance = new FilterPerformanceMonitor();
    }
    return FilterPerformanceMonitor.instance;
  }

  startTiming(operation: string): () => number {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const metrics = this.metrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
    
    this.notifyObservers();
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [operation, durations] of this.metrics.entries()) {
      if (durations.length === 0) continue;
      
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      result[operation] = { avg, min, max, count: durations.length };
    }
    
    return result;
  }

  subscribe(callback: (metrics: Record<string, number>) => void): () => void {
    this.observers.add(callback);
    
    return () => {
      this.observers.delete(callback);
    };
  }

  private notifyObservers(): void {
    const metrics = this.getMetrics();
    const simplified = Object.fromEntries(
      Object.entries(metrics).map(([key, value]) => [key, value.avg])
    );
    
    this.observers.forEach(callback => callback(simplified));
  }
}

// === Memoized Filter Engine ===
export class MemoizedFilterEngine {
  private static cache = new Map<string, any>();
  private static readonly MAX_CACHE_SIZE = 1000;

  static applyFilters<T extends Record<string, any>>(
    items: T[],
    filters: FilterState,
    itemsHash?: string
  ): T[] {
    const cacheKey = `${itemsHash || 'default'}_${JSON.stringify(cleanFilters(filters))}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const monitor = FilterPerformanceMonitor.getInstance();
    const endTiming = monitor.startTiming('filter_application');

    // Apply filters (simplified - would use FilterEngine in real implementation)
    const filtered = items.filter(item => {
      // Quick performance check - if no filters, return all
      const cleanedFilters = cleanFilters(filters);
      if (Object.keys(cleanedFilters).length === 0) return true;
      
      return this.itemMatchesFilters(item, filters);
    });

    endTiming();

    // Cache management
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(cacheKey, filtered);
    return filtered;
  }

  private static itemMatchesFilters<T extends Record<string, any>>(
    item: T,
    filters: FilterState
  ): boolean {
    // Simplified matching logic for performance
    // In real implementation, this would use FilterEngine.matchesFilters
    
    // Categories
    if (filters.categories?.length && !filters.categories.includes(item.category)) {
      return false;
    }
    
    // Brands
    if (filters.brands?.length && !filters.brands.includes(item.brand)) {
      return false;
    }
    
    // Price range
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (min !== undefined && item.price < min) return false;
      if (max !== undefined && item.price > max) return false;
    }
    
    // Boolean filters
    if (filters.isOnSale !== undefined && item.isOnSale !== filters.isOnSale) {
      return false;
    }
    
    return true;
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }
}

// === Virtual Scrolling Hook ===
export function useVirtualizedFilterOptions(
  options: FilterOption[],
  containerHeight: number = 200
) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Height per option
    overscan: 5
  });

  const virtualItems = virtualizer.getVirtualItems();

  return {
    parentRef,
    virtualizer,
    virtualItems,
    getTotalSize: () => virtualizer.getTotalSize()
  };
}

// === Optimized Filter Options Hook ===
export function useOptimizedFilterOptions(
  options: FilterOption[],
  searchValue: string,
  limit: number = 50
) {
  return useMemo(() => {
    const monitor = FilterPerformanceMonitor.getInstance();
    const endTiming = monitor.startTiming('option_filtering');

    let filtered = options;

    // Search filtering
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      filtered = options.filter(option =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query)
      );
    }

    // Limit results for performance
    const limited = filtered.slice(0, limit);
    
    endTiming();
    
    return {
      options: limited,
      hasMore: filtered.length > limit,
      total: filtered.length
    };
  }, [options, searchValue, limit]);
}

// === Debounced Filter Updates ===
export function useDebouncedFilterUpdate() {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { updateFilter } = useFilterStore();

  const debouncedUpdate = useCallback(
    (key: string, value: any, delay: number = 300) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        updateFilter(key, value);
      }, delay);
    },
    [updateFilter]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedUpdate;
}

// === Intersection Observer for Lazy Loading ===
export function useLazyFilterOptions(
  options: FilterOption[],
  batchSize: number = 20
) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const entry = useIntersectionObserver(loadMoreRef, {
    threshold: 0.1
  });

  const isVisible = !!entry?.isIntersecting;

  useEffect(() => {
    if (isVisible && visibleCount < options.length) {
      setVisibleCount(prev => Math.min(prev + batchSize, options.length));
    }
  }, [isVisible, visibleCount, options.length, batchSize]);

  const visibleOptions = useMemo(
    () => options.slice(0, visibleCount),
    [options, visibleCount]
  );

  const hasMore = visibleCount < options.length;

  return {
    visibleOptions,
    hasMore,
    loadMoreRef,
    totalCount: options.length,
    visibleCount
  };
}

// === Filter Analytics with Batching ===
export class FilterAnalyticsBatcher {
  private static instance: FilterAnalyticsBatcher;
  private batch: FilterAnalytics[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds

  static getInstance(): FilterAnalyticsBatcher {
    if (!FilterAnalyticsBatcher.instance) {
      FilterAnalyticsBatcher.instance = new FilterAnalyticsBatcher();
    }
    return FilterAnalyticsBatcher.instance;
  }

  track(analytics: Omit<FilterAnalytics, 'timestamp'>): void {
    const event: FilterAnalytics = {
      ...analytics,
      timestamp: new Date()
    };

    this.batch.push(event);

    if (this.batch.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flush(), this.BATCH_TIMEOUT);
    }
  }

  private flush(): void {
    if (this.batch.length === 0) return;

    const events = [...this.batch];
    this.batch = [];

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    // Send analytics to server or analytics service
    this.sendAnalytics(events);
  }

  private async sendAnalytics(events: FilterAnalytics[]): Promise<void> {
    try {
      await fetch('/api/analytics/filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });
    } catch (error) {
      console.error('Failed to send filter analytics:', error);
      
      // Re-queue events on failure (with limit to prevent infinite growth)
      if (this.batch.length < 100) {
        this.batch.unshift(...events);
      }
    }
  }
}

// === Optimized Filter Hook ===
export function useOptimizedFilters() {
  const store = useFilterStore();
  const performanceMonitor = FilterPerformanceMonitor.getInstance();
  
  const optimizedFilters = useMemo(() => {
    const endTiming = performanceMonitor.startTiming('filter_computation');
    
    // Pre-compute common filter combinations
    const result = {
      hasActiveFilters: Object.keys(cleanFilters(store.filters)).length > 0,
      activeCount: Object.keys(cleanFilters(store.filters)).length,
      cleanFilters: cleanFilters(store.filters)
    };
    
    endTiming();
    return result;
  }, [store.filters, performanceMonitor]);

  return {
    ...store,
    ...optimizedFilters
  };
}

// === Memory Management ===
export function useFilterMemoryManagement() {
  useEffect(() => {
    const cleanup = () => {
      // Clear filter engine cache
      MemoizedFilterEngine.clearCache();
      
      // Clear any other caches
      if ('caches' in window) {
        caches.open('filter-cache').then(cache => {
          cache.keys().then(keys => {
            const oldKeys = keys.filter(key => {
              const url = new URL(key.url);
              const timestamp = url.searchParams.get('_t');
              if (!timestamp) return false;
              
              const age = Date.now() - parseInt(timestamp);
              return age > 5 * 60 * 1000; // 5 minutes
            });
            
            oldKeys.forEach(key => cache.delete(key));
          });
        });
      }
    };

    // Cleanup on visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanup();
      }
    };

    // Cleanup on memory pressure (if supported)
    const handleMemoryPressure = () => {
      cleanup();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // @ts-ignore - memory API might not be available
    if ('memory' in performance) {
      // @ts-ignore
      const checkMemory = () => {
        // @ts-ignore
        const memInfo = performance.memory;
        if (memInfo.usedJSHeapSize > memInfo.totalJSHeapSize * 0.8) {
          cleanup();
        }
      };
      
      const memoryInterval = setInterval(checkMemory, 30000); // Check every 30 seconds
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(memoryInterval);
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

// === Skeleton Components ===
export const FilterOptionSkeleton: React.FC = () => (
  <div className="flex items-center space-x-2 py-2">
    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
  </div>
);

export const FilterGroupSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <FilterOptionSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const FilterSidebarSkeleton: React.FC = () => (
  <div className="w-80 space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="flex space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
    
    {Array.from({ length: 4 }).map((_, i) => (
      <FilterGroupSkeleton key={i} />
    ))}
  </div>
);

// === Performance Hooks ===
export function useFilterPerformanceMetrics() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const monitor = FilterPerformanceMonitor.getInstance();
    return monitor.subscribe(setMetrics);
  }, []);

  return metrics;
}

// Development only - performance debugging
if (process.env.NODE_ENV === 'development') {
  // Log slow filter operations
  const originalConsoleWarn = console.warn;
  
  FilterPerformanceMonitor.getInstance().subscribe((metrics) => {
    Object.entries(metrics).forEach(([operation, avgTime]) => {
      if (avgTime > 100) { // More than 100ms
        originalConsoleWarn(
          `🐌 Slow filter operation detected: ${operation} took ${avgTime.toFixed(2)}ms on average`
        );
      }
    });
  });
}