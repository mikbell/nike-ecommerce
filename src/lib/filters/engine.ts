import { 
  FilterState, 
  FilterCondition, 
  FilterGroup, 
  FilterOperator, 
  LogicalOperator, 
  DatabaseQuery, 
  DatabaseFilter,
  FilterValidationResult,
  FilterResultMeta,
  NumericRange,
  PriceRange,
  SortConfig
} from '@/types/filters';

// === Filter Engine Class ===
export class FilterEngine {
  /**
   * Build database query from filter state
   */
  static buildDatabaseQuery(filters: FilterState): DatabaseQuery {
    const dbFilters: DatabaseFilter[] = [];
    const sorts: { column: string; direction: 'asc' | 'desc' }[] = [];

    // Quick filters
    this.addArrayFilter(dbFilters, 'category', filters.categories);
    this.addArrayFilter(dbFilters, 'brand', filters.brands);
    this.addArrayFilter(dbFilters, 'gender', filters.genders);
    this.addArrayFilter(dbFilters, 'size', filters.sizes);
    this.addArrayFilter(dbFilters, 'color', filters.colors);
    this.addArrayFilter(dbFilters, 'material', filters.materials);
    this.addArrayFilter(dbFilters, 'collection', filters.collections);

    // Range filters
    this.addRangeFilter(dbFilters, 'price', filters.priceRange);
    this.addRangeFilter(dbFilters, 'discount_percentage', filters.discountRange);
    this.addRangeFilter(dbFilters, 'average_rating', filters.ratingRange);

    // Boolean filters
    this.addBooleanFilter(dbFilters, 'is_on_sale', filters.isOnSale);
    this.addBooleanFilter(dbFilters, 'is_featured', filters.isFeatured);
    this.addBooleanFilter(dbFilters, 'is_new', filters.isNew);
    this.addBooleanFilter(dbFilters, 'in_stock', filters.inStock);
    this.addBooleanFilter(dbFilters, 'has_reviews', filters.hasReviews);

    // Search filter
    if (filters.search) {
      dbFilters.push({
        column: 'search_vector',
        operator: 'contains',
        value: filters.search,
        type: 'string'
      });
    }

    // Advanced filters
    if (filters.advancedFilters) {
      const advancedFilters = this.buildAdvancedFilters(filters.advancedFilters);
      dbFilters.push(...advancedFilters);
    }

    // Sorting
    if (filters.sort && filters.sort.length > 0) {
      sorts.push(...filters.sort.map(sort => ({
        column: this.mapSortField(sort.field),
        direction: sort.order
      })));
    } else {
      // Default sorting
      sorts.push({ column: 'created_at', direction: 'desc' });
    }

    return {
      filters: dbFilters,
      operator: filters.operator || 'AND',
      sorts,
      limit: filters.limit || 20,
      offset: ((filters.page || 1) - 1) * (filters.limit || 20)
    };
  }

  /**
   * Apply filters to array of items (client-side filtering)
   */
  static applyFilters<T extends Record<string, any>>(
    items: T[], 
    filters: FilterState
  ): T[] {
    return items.filter(item => this.matchesFilters(item, filters));
  }

  /**
   * Check if item matches all filters
   */
  private static matchesFilters<T extends Record<string, any>>(
    item: T, 
    filters: FilterState
  ): boolean {
    const operator = filters.operator || 'AND';
    const conditions: boolean[] = [];

    // Quick filters
    conditions.push(this.matchesArrayFilter(item.category, filters.categories));
    conditions.push(this.matchesArrayFilter(item.brand, filters.brands));
    conditions.push(this.matchesArrayFilter(item.gender, filters.genders));
    conditions.push(this.matchesArrayFilter(item.size, filters.sizes));
    conditions.push(this.matchesArrayFilter(item.color, filters.colors));
    conditions.push(this.matchesArrayFilter(item.material, filters.materials));
    conditions.push(this.matchesArrayFilter(item.collection, filters.collections));

    // Range filters
    conditions.push(this.matchesRangeFilter(item.price, filters.priceRange));
    conditions.push(this.matchesRangeFilter(item.discount_percentage, filters.discountRange));
    conditions.push(this.matchesRangeFilter(item.average_rating, filters.ratingRange));

    // Boolean filters
    conditions.push(this.matchesBooleanFilter(item.is_on_sale, filters.isOnSale));
    conditions.push(this.matchesBooleanFilter(item.is_featured, filters.isFeatured));
    conditions.push(this.matchesBooleanFilter(item.is_new, filters.isNew));
    conditions.push(this.matchesBooleanFilter(item.in_stock, filters.inStock));
    conditions.push(this.matchesBooleanFilter(item.has_reviews, filters.hasReviews));

    // Search filter
    if (filters.search) {
      const searchFields = filters.searchFields || ['name', 'description', 'brand'];
      const searchMatches = searchFields.some(field => 
        item[field]?.toLowerCase?.().includes(filters.search!.toLowerCase())
      );
      conditions.push(searchMatches);
    }

    // Advanced filters
    if (filters.advancedFilters) {
      conditions.push(this.matchesAdvancedFilters(item, filters.advancedFilters));
    }

    // Apply logical operator
    const validConditions = conditions.filter(c => c !== undefined);
    
    if (validConditions.length === 0) return true;
    
    return operator === 'AND' 
      ? validConditions.every(c => c === true)
      : validConditions.some(c => c === true);
  }

  /**
   * Validate filter state
   */
  static validateFilters(filters: FilterState): FilterValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Validate price range
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (min !== undefined && max !== undefined && min > max) {
        errors.priceRange = 'Prezzo minimo non può essere maggiore del prezzo massimo';
      }
      if (min !== undefined && min < 0) {
        errors.priceRange = 'Il prezzo minimo deve essere maggiore o uguale a 0';
      }
    }

    // Validate rating range
    if (filters.ratingRange) {
      const { min, max } = filters.ratingRange;
      if (min !== undefined && (min < 0 || min > 5)) {
        errors.ratingRange = 'La valutazione deve essere tra 0 e 5';
      }
      if (max !== undefined && (max < 0 || max > 5)) {
        errors.ratingRange = 'La valutazione deve essere tra 0 e 5';
      }
    }

    // Validate pagination
    if (filters.page !== undefined && filters.page < 1) {
      errors.page = 'Il numero di pagina deve essere maggiore di 0';
    }
    if (filters.limit !== undefined && (filters.limit < 1 || filters.limit > 100)) {
      errors.limit = 'Il limite deve essere tra 1 e 100';
    }

    // Warnings
    if (filters.limit && filters.limit > 50) {
      warnings.limit = 'Un limite alto potrebbe influire sulle performance';
    }

    // Check for too many filters
    const activeFiltersCount = this.countActiveFilters(filters);
    if (activeFiltersCount > 10) {
      warnings.general = 'Troppi filtri attivi potrebbero ridurre i risultati significativamente';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }

  /**
   * Count active filters
   */
  static countActiveFilters(filters: FilterState): number {
    let count = 0;

    // Array filters
    if (filters.categories?.length) count++;
    if (filters.brands?.length) count++;
    if (filters.genders?.length) count++;
    if (filters.sizes?.length) count++;
    if (filters.colors?.length) count++;
    if (filters.materials?.length) count++;
    if (filters.collections?.length) count++;

    // Range filters
    if (filters.priceRange && (filters.priceRange.min !== undefined || filters.priceRange.max !== undefined)) count++;
    if (filters.discountRange && (filters.discountRange.min !== undefined || filters.discountRange.max !== undefined)) count++;
    if (filters.ratingRange && (filters.ratingRange.min !== undefined || filters.ratingRange.max !== undefined)) count++;

    // Boolean filters
    if (filters.isOnSale !== undefined) count++;
    if (filters.isFeatured !== undefined) count++;
    if (filters.isNew !== undefined) count++;
    if (filters.inStock !== undefined) count++;
    if (filters.hasReviews !== undefined) count++;

    // Search
    if (filters.search) count++;

    // Advanced filters
    if (filters.advancedFilters) count++;

    return count;
  }

  /**
   * Generate filter result metadata
   */
  static generateResultMeta(
    totalItems: number,
    filteredItems: number,
    filters: FilterState,
    executionTime?: number
  ): FilterResultMeta {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const hasMore = (page * limit) < filteredItems;

    return {
      total: totalItems,
      filtered: filteredItems,
      page,
      limit,
      hasMore,
      facets: {}, // Should be populated by the database query
      appliedFilters: filters,
      executionTime
    };
  }

  /**
   * Merge multiple filter states
   */
  static mergeFilters(...filterStates: FilterState[]): FilterState {
    const merged: FilterState = {};

    for (const filters of filterStates) {
      // Merge array filters
      this.mergeArrayField(merged, filters, 'categories');
      this.mergeArrayField(merged, filters, 'brands');
      this.mergeArrayField(merged, filters, 'genders');
      this.mergeArrayField(merged, filters, 'sizes');
      this.mergeArrayField(merged, filters, 'colors');
      this.mergeArrayField(merged, filters, 'materials');
      this.mergeArrayField(merged, filters, 'collections');

      // Merge range filters (last wins)
      if (filters.priceRange) merged.priceRange = filters.priceRange;
      if (filters.discountRange) merged.discountRange = filters.discountRange;
      if (filters.ratingRange) merged.ratingRange = filters.ratingRange;

      // Merge boolean filters (last wins)
      if (filters.isOnSale !== undefined) merged.isOnSale = filters.isOnSale;
      if (filters.isFeatured !== undefined) merged.isFeatured = filters.isFeatured;
      if (filters.isNew !== undefined) merged.isNew = filters.isNew;
      if (filters.inStock !== undefined) merged.inStock = filters.inStock;
      if (filters.hasReviews !== undefined) merged.hasReviews = filters.hasReviews;

      // Merge other fields
      if (filters.search) merged.search = filters.search;
      if (filters.searchFields) merged.searchFields = filters.searchFields;
      if (filters.sort) merged.sort = filters.sort;
      if (filters.page !== undefined) merged.page = filters.page;
      if (filters.limit !== undefined) merged.limit = filters.limit;
      if (filters.operator) merged.operator = filters.operator;
      if (filters.advancedFilters) merged.advancedFilters = filters.advancedFilters;
    }

    return merged;
  }

  // === Private Helper Methods ===

  private static addArrayFilter(
    dbFilters: DatabaseFilter[], 
    column: string, 
    values?: string[]
  ): void {
    if (values && values.length > 0) {
      dbFilters.push({
        column,
        operator: 'in',
        value: values,
        type: 'array'
      });
    }
  }

  private static addRangeFilter(
    dbFilters: DatabaseFilter[], 
    column: string, 
    range?: NumericRange
  ): void {
    if (!range) return;

    if (range.min !== undefined) {
      dbFilters.push({
        column,
        operator: 'greater_than_or_equal',
        value: range.min,
        type: 'number'
      });
    }

    if (range.max !== undefined) {
      dbFilters.push({
        column,
        operator: 'less_than_or_equal',
        value: range.max,
        type: 'number'
      });
    }
  }

  private static addBooleanFilter(
    dbFilters: DatabaseFilter[], 
    column: string, 
    value?: boolean
  ): void {
    if (value !== undefined) {
      dbFilters.push({
        column,
        operator: 'equals',
        value,
        type: 'boolean'
      });
    }
  }

  private static buildAdvancedFilters(group: FilterGroup): DatabaseFilter[] {
    // Implementation for advanced filter groups would go here
    // This is a simplified version
    return [];
  }

  private static matchesArrayFilter(
    itemValue: any, 
    filterValues?: string[]
  ): boolean | undefined {
    if (!filterValues || filterValues.length === 0) return undefined;
    
    if (Array.isArray(itemValue)) {
      return itemValue.some(val => filterValues.includes(String(val)));
    }
    
    return filterValues.includes(String(itemValue));
  }

  private static matchesRangeFilter(
    itemValue: number, 
    range?: NumericRange
  ): boolean | undefined {
    if (!range) return undefined;
    
    const { min, max } = range;
    
    if (min !== undefined && itemValue < min) return false;
    if (max !== undefined && itemValue > max) return false;
    
    return true;
  }

  private static matchesBooleanFilter(
    itemValue: boolean, 
    filterValue?: boolean
  ): boolean | undefined {
    if (filterValue === undefined) return undefined;
    return itemValue === filterValue;
  }

  private static matchesAdvancedFilters(
    item: any, 
    group: FilterGroup
  ): boolean {
    // Implementation for advanced filter matching would go here
    return true;
  }

  private static mapSortField(field: string): string {
    const mapping: Record<string, string> = {
      'name': 'name',
      'price': 'price',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'rating': 'average_rating',
      'popularity': 'view_count',
      'discount': 'discount_percentage'
    };
    
    return mapping[field] || field;
  }

  private static mergeArrayField(
    merged: FilterState, 
    filters: FilterState, 
    field: keyof FilterState
  ): void {
    const values = filters[field] as string[] | undefined;
    if (values && values.length > 0) {
      const existing = (merged[field] as string[]) || [];
      merged[field] = [...new Set([...existing, ...values])] as any;
    }
  }
}

// === Utility Functions ===

/**
 * Create a price range filter
 */
export function createPriceRange(min?: number, max?: number, currency = 'EUR'): PriceRange {
  return { min, max, currency };
}

/**
 * Create a numeric range filter
 */
export function createNumericRange(min?: number, max?: number): NumericRange {
  return { min, max };
}

/**
 * Create sort configuration
 */
export function createSort(field: string, order: 'asc' | 'desc' = 'asc'): SortConfig {
  return { field: field as any, order };
}

/**
 * Check if filter state is empty
 */
export function isEmptyFilter(filters: FilterState): boolean {
  return FilterEngine.countActiveFilters(filters) === 0;
}

/**
 * Clean filter state (remove empty/undefined values)
 */
export function cleanFilters(filters: FilterState): FilterState {
  const cleaned: FilterState = {};

  // Clean array filters
  if (filters.categories?.length) cleaned.categories = filters.categories;
  if (filters.brands?.length) cleaned.brands = filters.brands;
  if (filters.genders?.length) cleaned.genders = filters.genders;
  if (filters.sizes?.length) cleaned.sizes = filters.sizes;
  if (filters.colors?.length) cleaned.colors = filters.colors;
  if (filters.materials?.length) cleaned.materials = filters.materials;
  if (filters.collections?.length) cleaned.collections = filters.collections;

  // Clean range filters
  if (filters.priceRange && (filters.priceRange.min !== undefined || filters.priceRange.max !== undefined)) {
    cleaned.priceRange = filters.priceRange;
  }
  if (filters.discountRange && (filters.discountRange.min !== undefined || filters.discountRange.max !== undefined)) {
    cleaned.discountRange = filters.discountRange;
  }
  if (filters.ratingRange && (filters.ratingRange.min !== undefined || filters.ratingRange.max !== undefined)) {
    cleaned.ratingRange = filters.ratingRange;
  }

  // Clean boolean filters
  if (filters.isOnSale !== undefined) cleaned.isOnSale = filters.isOnSale;
  if (filters.isFeatured !== undefined) cleaned.isFeatured = filters.isFeatured;
  if (filters.isNew !== undefined) cleaned.isNew = filters.isNew;
  if (filters.inStock !== undefined) cleaned.inStock = filters.inStock;
  if (filters.hasReviews !== undefined) cleaned.hasReviews = filters.hasReviews;

  // Clean other fields
  if (filters.search?.trim()) cleaned.search = filters.search.trim();
  if (filters.searchFields?.length) cleaned.searchFields = filters.searchFields;
  if (filters.sort?.length) cleaned.sort = filters.sort;
  if (filters.page && filters.page > 1) cleaned.page = filters.page;
  if (filters.limit && filters.limit !== 20) cleaned.limit = filters.limit;
  if (filters.operator && filters.operator !== 'AND') cleaned.operator = filters.operator;
  if (filters.advancedFilters) cleaned.advancedFilters = filters.advancedFilters;

  return cleaned;
}