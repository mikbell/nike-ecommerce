import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProductFilters, PRICE_RANGES } from "@/types";

// === Class Name Utilities ===
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// === Number Utilities ===
export function formatPrice(
  price: number,
  options: {
    currency?: string;
    locale?: string;
    showDecimals?: boolean;
  } = {}
): string {
  const { currency = 'USD', locale = 'en-US', showDecimals = true } = options;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price);
}

export function calculateDiscount(originalPrice: number, salePrice: number): {
  amount: number;
  percentage: number;
} {
  const amount = originalPrice - salePrice;
  const percentage = Math.round((amount / originalPrice) * 100);
  return { amount, percentage };
}

// === String Utilities ===
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}

// === Date Utilities ===
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options,
  }).format(new Date(date));
}

export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  const intervals = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${pluralize(count, interval.unit)} ago`;
    }
  }

  return 'Just now';
}

export function isNewProduct(createdAt: Date | string, daysThreshold = 30): boolean {
  const now = new Date();
  const productDate = new Date(createdAt);
  const diffInDays = Math.floor((now.getTime() - productDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= daysThreshold;
}

// === Validation Utilities ===
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// === Array Utilities ===
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = String(keyFn(item));
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function uniqueBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => string | number | Date,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// === Filter Utilities ===
export function parseFiltersFromQuery(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilters & { sort?: string } {
  const parseParam = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').filter(Boolean);
  };

  return {
    categories: parseParam(searchParams.categories),
    brands: parseParam(searchParams.brands),
    genders: parseParam(searchParams.genders),
    sizes: parseParam(searchParams.sizes),
    colors: parseParam(searchParams.colors),
    priceRanges: parseParam(searchParams.priceRanges),
    tags: parseParam(searchParams.tags),
    inStock: searchParams.inStock === 'true',
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : undefined,
  };
}

export function stringifyFiltersToQuery(filters: ProductFilters & { sort?: string }): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    
    if (Array.isArray(value) && value.length > 0) {
      params.set(key, value.join(','));
    } else if (typeof value === 'string') {
      params.set(key, value);
    } else if (typeof value === 'boolean') {
      params.set(key, value.toString());
    }
  });
  
  return params.toString();
}

export function matchesPriceRange(price: number, priceRange: string): boolean {
  const range = PRICE_RANGES.find(r => r.value === priceRange);
  if (!range) return false;
  
  return price >= range.min && (range.max === Infinity || price <= range.max);
}

// === Error Utilities ===
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

export function isApiError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string'
  );
}

// === Local Storage Utilities ===
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch {
      // Silent fail
    }
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // Silent fail
    }
  }
};

// === Debounce Utility ===
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>): void => {
    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    }, wait);

    if (callNow) {
      func(...args);
    }
  };
}

// === Performance Utilities ===
export function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const retry = () => {
      attempt++;
      fn()
        .then(resolve)
        .catch((error) => {
          if (attempt >= maxRetries) {
            reject(error);
          } else {
            setTimeout(retry, delay * attempt);
          }
        });
    };

    retry();
  });
}