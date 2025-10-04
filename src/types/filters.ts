// === Filter Types ===

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'between'
  | 'in'
  | 'not_in';

export type LogicalOperator = 'AND' | 'OR';

export type SortOrder = 'asc' | 'desc';

export type SortField = 
  | 'name'
  | 'price'
  | 'createdAt'
  | 'updatedAt'
  | 'rating'
  | 'popularity'
  | 'discount';

// === Range Types ===
export interface NumericRange {
  min?: number;
  max?: number;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface PriceRange extends NumericRange {
  currency?: string;
}

// === Filter Value Types ===
export type FilterValue = 
  | string
  | number
  | boolean
  | string[]
  | number[]
  | NumericRange
  | DateRange
  | PriceRange;

// === Individual Filter Definition ===
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}

// === Filter Group ===
export interface FilterGroup {
  operator: LogicalOperator;
  conditions: (FilterCondition | FilterGroup)[];
}

// === Sort Configuration ===
export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

// === Complete Filter State ===
export interface FilterState {
  // Quick Filters (backward compatibility)
  categories?: string[];
  brands?: string[];
  genders?: string[];
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  collections?: string[];
  
  // Range Filters
  priceRange?: PriceRange;
  discountRange?: NumericRange;
  ratingRange?: NumericRange;
  
  // Boolean Filters
  isOnSale?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  hasReviews?: boolean;
  
  // Advanced Filters
  advancedFilters?: FilterGroup;
  
  // Sorting
  sort?: SortConfig[];
  
  // Search
  search?: string;
  searchFields?: string[];
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Meta
  operator?: LogicalOperator; // For combining quick filters
}

// === Filter Options Configuration ===
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

export interface FilterGroupConfig {
  key: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select' | 'search' | 'toggle' | 'color' | 'size';
  options?: FilterOption[];
  multiple?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  searchable?: boolean;
  showCount?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  icon?: string;
  description?: string;
  validation?: {
    required?: boolean;
    minItems?: number;
    maxItems?: number;
    customValidator?: (value: FilterValue) => boolean | string;
  };
}

// === Filter UI State ===
export interface FilterUIState {
  expandedGroups: Record<string, boolean>;
  searchValues: Record<string, string>;
  activeFilters: Record<string, FilterValue>;
  pendingFilters: Record<string, FilterValue>;
  isLoading: boolean;
  errors: Record<string, string>;
  lastApplied?: Date;
}

// === Filter Analytics ===
export interface FilterAnalytics {
  filterKey: string;
  value: string;
  count: number;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
}

// === Filter Result Metadata ===
export interface FilterResultMeta {
  total: number;
  filtered: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: Record<string, { value: string; count: number }[]>;
  appliedFilters: FilterState;
  suggestedFilters?: FilterOption[];
  executionTime?: number;
}

// === Filter Preset ===
export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  filters: FilterState;
  isPublic: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  tags?: string[];
}

// === Filter History ===
export interface FilterHistoryEntry {
  id: string;
  filters: FilterState;
  resultCount: number;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
}

// === Utility Types ===
export type FilterChangeHandler = (key: string, value: FilterValue) => void;
export type FilterResetHandler = (key?: string) => void;
export type FilterApplyHandler = (filters: FilterState) => void;
export type FilterPresetHandler = (preset: FilterPreset) => void;

// === Validation Types ===
export interface FilterValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// === Filter Context ===
export interface FilterContextValue {
  state: FilterState;
  uiState: FilterUIState;
  meta: FilterResultMeta | null;
  
  // Actions
  updateFilter: FilterChangeHandler;
  resetFilter: FilterResetHandler;
  applyFilters: FilterApplyHandler;
  clearAllFilters: () => void;
  
  // Presets
  savePreset: (name: string, description?: string) => Promise<void>;
  loadPreset: FilterPresetHandler;
  deletePreset: (id: string) => Promise<void>;
  
  // History
  goBack: () => void;
  goForward: () => void;
  
  // Validation
  validateFilters: (filters: FilterState) => FilterValidationResult;
  
  // Utils
  getActiveFiltersCount: () => number;
  hasActiveFilters: () => boolean;
  exportFilters: () => string;
  importFilters: (data: string) => boolean;
}

// === Database Filter Types ===
export interface DatabaseFilter {
  column: string;
  operator: FilterOperator;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'json';
}

export interface DatabaseQuery {
  filters: DatabaseFilter[];
  operator: LogicalOperator;
  sorts: { column: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
  includes?: string[];
}

// === Export all types ===
export type {
  FilterOperator,
  LogicalOperator,
  SortOrder,
  SortField,
  FilterValue,
  FilterCondition,
  FilterGroup,
  SortConfig,
  FilterState,
  FilterOption,
  FilterGroupConfig,
  FilterUIState,
  FilterAnalytics,
  FilterResultMeta,
  FilterPreset,
  FilterHistoryEntry,
  FilterChangeHandler,
  FilterResetHandler,
  FilterApplyHandler,
  FilterPresetHandler,
  FilterValidationResult,
  FilterContextValue,
  DatabaseFilter,
  DatabaseQuery,
  NumericRange,
  DateRange,
  PriceRange
};