"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useCallback, useMemo } from 'react';
import queryString from 'query-string';
import { FilterState, PriceRange, NumericRange } from '@/types/filters';
import { useFilterStore } from '@/lib/stores/filter-store';
import { cleanFilters } from '@/lib/filters/engine';
import { useDebouncedCallback } from 'use-debounce';

// === URL Parameter Mapping ===
const URL_PARAM_MAP: Record<string, string> = {
  categories: 'cat',
  brands: 'brand',
  genders: 'gender',
  sizes: 'size',
  colors: 'color',
  materials: 'material',
  collections: 'collection',
  priceRange: 'price',
  discountRange: 'discount',
  ratingRange: 'rating',
  isOnSale: 'sale',
  isFeatured: 'featured',
  isNew: 'new',
  inStock: 'stock',
  hasReviews: 'reviews',
  search: 'q',
  sort: 'sort',
  page: 'page',
  limit: 'limit'
};

const REVERSE_URL_PARAM_MAP = Object.fromEntries(
  Object.entries(URL_PARAM_MAP).map(([key, value]) => [value, key])
);

// === Utility Functions ===

/**
 * Convert filter state to URL query parameters
 */
export function filtersToQuery(filters: FilterState): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const paramKey = URL_PARAM_MAP[key] || key;

    // Handle different value types
    if (Array.isArray(value)) {
      if (value.length > 0) {
        query[paramKey] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      // Handle range objects
      if ('min' in value || 'max' in value) {
        const range = value as NumericRange;
        const rangeStr = `${range.min || ''}-${range.max || ''}`;
        if (rangeStr !== '-') {
          query[paramKey] = rangeStr;
        }
      } else if (Array.isArray(value)) {
        // Handle sort array
        query[paramKey] = value.map(item => 
          typeof item === 'object' ? `${item.field}:${item.order}` : String(item)
        );
      }
    } else if (typeof value === 'boolean') {
      query[paramKey] = value ? '1' : '0';
    } else {
      query[paramKey] = String(value);
    }
  });

  return query;
}

/**
 * Convert URL query parameters to filter state
 */
export function queryToFilters(query: Record<string, string | string[]>): FilterState {
  const filters: FilterState = {};

  Object.entries(query).forEach(([paramKey, value]) => {
    if (!value || value === '') return;

    const filterKey = REVERSE_URL_PARAM_MAP[paramKey] || paramKey;
    
    // Skip non-filter parameters
    if (!Object.keys(URL_PARAM_MAP).includes(filterKey)) return;

    // Handle different parameter types
    if (filterKey === 'priceRange' || filterKey === 'discountRange' || filterKey === 'ratingRange') {
      // Handle range parameters
      const rangeStr = Array.isArray(value) ? value[0] : value;
      const [min, max] = rangeStr.split('-');
      const range: NumericRange = {};
      
      if (min && min !== '') range.min = Number(min);
      if (max && max !== '') range.max = Number(max);
      
      if (Object.keys(range).length > 0) {
        filters[filterKey as keyof FilterState] = range as any;
      }
    } else if (filterKey === 'sort') {
      // Handle sort parameter
      const sortValues = Array.isArray(value) ? value : [value];
      const sortConfigs = sortValues.map(sortStr => {
        const [field, order] = sortStr.split(':');
        return { field, order: order || 'asc' };
      });
      filters.sort = sortConfigs as any;
    } else if (['isOnSale', 'isFeatured', 'isNew', 'inStock', 'hasReviews'].includes(filterKey)) {
      // Handle boolean parameters
      const boolValue = Array.isArray(value) ? value[0] : value;
      filters[filterKey as keyof FilterState] = boolValue === '1' || boolValue === 'true';
    } else if (['page', 'limit'].includes(filterKey)) {
      // Handle numeric parameters
      const numValue = Array.isArray(value) ? value[0] : value;
      const parsed = parseInt(numValue, 10);
      if (!isNaN(parsed)) {
        filters[filterKey as keyof FilterState] = parsed as any;
      }
    } else if (filterKey === 'search') {
      // Handle search parameter
      filters.search = Array.isArray(value) ? value[0] : value;
    } else {
      // Handle array parameters (categories, brands, etc.)
      filters[filterKey as keyof FilterState] = Array.isArray(value) ? value : [value] as any;
    }
  });

  return filters;
}

/**
 * Generate URL from filters
 */
export function buildFilterUrl(filters: FilterState, pathname: string): string {
  const cleanedFilters = cleanFilters(filters);
  const query = filtersToQuery(cleanedFilters);
  
  if (Object.keys(query).length === 0) {
    return pathname;
  }
  
  const queryString = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => queryString.append(key, v));
    } else {
      queryString.set(key, value);
    }
  });
  
  return `${pathname}?${queryString.toString()}`;
}

// === Custom Hook for URL Synchronization ===
export function useFilterUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { filters, updateMultipleFilters } = useFilterStore();

  // Parse current URL parameters
  const currentQuery = useMemo(() => {
    const params: Record<string, string | string[]> = {};
    
    searchParams.forEach((value, key) => {
      const existing = params[key];
      if (existing) {
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          params[key] = [existing, value];
        }
      } else {
        params[key] = value;
      }
    });
    
    return params;
  }, [searchParams]);

  // Debounced URL update function
  const debouncedUpdateUrl = useDebouncedCallback(
    (newFilters: FilterState) => {
      const url = buildFilterUrl(newFilters, pathname);
      
      // Only update URL if it's different from current
      const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      if (url !== currentUrl) {
        router.replace(url, { scroll: false });
      }
    },
    300 // 300ms debounce
  );

  // Sync URL to store on mount and URL changes
  useEffect(() => {
    const filtersFromUrl = queryToFilters(currentQuery);
    
    // Only update store if filters are different
    const currentFiltersStr = JSON.stringify(cleanFilters(filters));
    const urlFiltersStr = JSON.stringify(cleanFilters(filtersFromUrl));
    
    if (currentFiltersStr !== urlFiltersStr) {
      updateMultipleFilters(filtersFromUrl);
    }
  }, [currentQuery]); // Don't include filters in deps to avoid infinite loop

  // Sync store to URL when filters change
  useEffect(() => {
    debouncedUpdateUrl(filters);
  }, [filters, debouncedUpdateUrl]);

  // Helper functions
  const updateUrlWithFilters = useCallback((newFilters: FilterState) => {
    const url = buildFilterUrl(newFilters, pathname);
    router.replace(url, { scroll: false });
  }, [pathname, router]);

  const clearUrlFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const getFilterFromUrl = useCallback((key: string): any => {
    const filtersFromUrl = queryToFilters(currentQuery);
    return filtersFromUrl[key as keyof FilterState];
  }, [currentQuery]);

  return {
    updateUrlWithFilters,
    clearUrlFilters,
    getFilterFromUrl,
    currentQuery,
    filtersFromUrl: queryToFilters(currentQuery)
  };
}

// === Browser History Integration ===
export function useFilterHistory() {
  const { filters, updateMultipleFilters } = useFilterStore();
  
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.filters) {
        updateMultipleFilters(event.state.filters);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [updateMultipleFilters]);

  const pushFilterState = useCallback((newFilters: FilterState) => {
    const url = buildFilterUrl(newFilters, window.location.pathname);
    window.history.pushState(
      { filters: newFilters }, 
      '', 
      url
    );
  }, []);

  const replaceFilterState = useCallback((newFilters: FilterState) => {
    const url = buildFilterUrl(newFilters, window.location.pathname);
    window.history.replaceState(
      { filters: newFilters }, 
      '', 
      url
    );
  }, []);

  return {
    pushFilterState,
    replaceFilterState
  };
}

// === Share Filters Hook ===
export function useShareFilters() {
  const pathname = usePathname();
  const { filters } = useFilterStore();

  const generateShareUrl = useCallback((baseUrl?: string): string => {
    const base = baseUrl || window.location.origin;
    const url = buildFilterUrl(filters, pathname);
    return `${base}${url}`;
  }, [filters, pathname]);

  const copyFiltersToClipboard = useCallback(async (): Promise<boolean> => {
    try {
      const url = generateShareUrl();
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy filters to clipboard:', error);
      return false;
    }
  }, [generateShareUrl]);

  const generateShareData = useCallback(() => {
    const activeFiltersCount = Object.keys(cleanFilters(filters)).length;
    const url = generateShareUrl();
    
    return {
      title: `Nike Store - Filtri Prodotti`,
      text: `Scopri ${activeFiltersCount} filtri applicati ai nostri prodotti Nike`,
      url
    };
  }, [filters, generateShareUrl]);

  const shareFilters = useCallback(async (): Promise<boolean> => {
    const shareData = generateShareData();
    
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (error) {
        console.error('Failed to share filters:', error);
        return false;
      }
    } else {
      // Fallback to clipboard
      return await copyFiltersToClipboard();
    }
  }, [generateShareData, copyFiltersToClipboard]);

  return {
    generateShareUrl,
    copyFiltersToClipboard,
    shareFilters,
    generateShareData
  };
}

// === Analytics Hook ===
export function useFilterAnalytics() {
  const { filters } = useFilterStore();

  const trackFilterChange = useCallback((key: string, value: any, action: 'add' | 'remove' | 'change') => {
    // Track filter usage analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'filter_change', {
        filter_type: key,
        filter_value: String(value),
        action,
        total_active_filters: Object.keys(cleanFilters(filters)).length
      });
    }

    // Custom analytics tracking
    if (typeof window !== 'undefined' && window.analytics?.track) {
      window.analytics.track('Filter Changed', {
        filterType: key,
        filterValue: value,
        action,
        activeFiltersCount: Object.keys(cleanFilters(filters)).length,
        timestamp: new Date().toISOString()
      });
    }
  }, [filters]);

  const trackFilterReset = useCallback((key?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'filter_reset', {
        filter_type: key || 'all',
        previous_filter_count: Object.keys(cleanFilters(filters)).length
      });
    }
  }, [filters]);

  const trackFilterSearch = useCallback((query: string, resultsCount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'filter_search', {
        search_term: query,
        results_count: resultsCount,
        active_filters: Object.keys(cleanFilters(filters)).length
      });
    }
  }, [filters]);

  return {
    trackFilterChange,
    trackFilterReset,
    trackFilterSearch
  };
}