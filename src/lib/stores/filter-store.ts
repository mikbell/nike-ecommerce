"use client";

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { 
  FilterState, 
  FilterUIState, 
  FilterResultMeta, 
  FilterPreset,
  FilterHistoryEntry,
  FilterValidationResult,
  FilterValue,
  FilterGroupConfig
} from '@/types/filters';
import { FilterEngine, cleanFilters, isEmptyFilter } from '@/lib/filters/engine';

// === Store State Interface ===
interface FilterStoreState {
  // Core state
  filters: FilterState;
  uiState: FilterUIState;
  meta: FilterResultMeta | null;
  
  // Configuration
  config: Record<string, FilterGroupConfig>;
  
  // Presets
  presets: FilterPreset[];
  
  // History
  history: FilterHistoryEntry[];
  historyIndex: number;
  
  // Actions
  updateFilter: (key: string, value: FilterValue) => void;
  updateMultipleFilters: (updates: Partial<FilterState>) => void;
  resetFilter: (key?: string) => void;
  clearAllFilters: () => void;
  applyFilters: () => void;
  
  // UI Actions
  toggleExpandGroup: (groupKey: string) => void;
  setSearchValue: (groupKey: string, value: string) => void;
  setPendingFilter: (key: string, value: FilterValue) => void;
  commitPendingFilters: () => void;
  discardPendingFilters: () => void;
  
  // Presets
  savePreset: (name: string, description?: string, tags?: string[]) => string;
  loadPreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: Partial<FilterPreset>) => void;
  deletePreset: (presetId: string) => void;
  
  // History
  goBack: () => void;
  goForward: () => void;
  clearHistory: () => void;
  
  // Configuration
  setConfig: (config: Record<string, FilterGroupConfig>) => void;
  updateConfig: (groupKey: string, config: Partial<FilterGroupConfig>) => void;
  
  // Meta
  setMeta: (meta: FilterResultMeta) => void;
  
  // Validation
  validateFilters: () => FilterValidationResult;
  
  // Utilities
  getActiveFiltersCount: () => number;
  hasActiveFilters: () => boolean;
  exportFilters: () => string;
  importFilters: (data: string) => boolean;
  
  // Debug
  resetStore: () => void;
}

// === Initial State ===
const initialFilters: FilterState = {};

const initialUIState: FilterUIState = {
  expandedGroups: {
    categories: true,
    brands: false,
    genders: false,
    sizes: false,
    colors: false,
    priceRange: false,
    features: false
  },
  searchValues: {},
  activeFilters: {},
  pendingFilters: {},
  isLoading: false,
  errors: {}
};

// === Store Creation ===
export const useFilterStore = create<FilterStoreState>()(
  subscribeWithSelector(
    immer(
      persist(
        (set, get) => ({
          // Initial state
          filters: initialFilters,
          uiState: initialUIState,
          meta: null,
          config: {},
          presets: [],
          history: [],
          historyIndex: -1,
          
          // === Filter Actions ===
          updateFilter: (key: string, value: FilterValue) => {
            set((state) => {
              const currentValue = state.filters[key as keyof FilterState];
              
              // Handle array filters
              if (Array.isArray(currentValue) && typeof value === 'string') {
                const arrayValue = currentValue as string[];
                if (arrayValue.includes(value)) {
                  // Remove value
                  state.filters[key as keyof FilterState] = arrayValue.filter(v => v !== value) as any;
                } else {
                  // Add value
                  state.filters[key as keyof FilterState] = [...arrayValue, value] as any;
                }
              } else {
                // Direct assignment for other types
                state.filters[key as keyof FilterState] = value as any;
              }
              
              // Clean up empty arrays
              if (Array.isArray(state.filters[key as keyof FilterState]) && 
                  (state.filters[key as keyof FilterState] as any[]).length === 0) {
                delete state.filters[key as keyof FilterState];
              }
              
              // Update UI state
              state.uiState.activeFilters[key] = value;
              
              // Clear errors for this field
              delete state.uiState.errors[key];
              
              // Add to history
              get().addToHistory(state.filters);
            });
          },

          updateMultipleFilters: (updates: Partial<FilterState>) => {
            set((state) => {
              Object.assign(state.filters, updates);
              
              // Update UI state
              Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined) {
                  state.uiState.activeFilters[key] = value;
                }
              });
              
              // Add to history
              get().addToHistory(state.filters);
            });
          },

          resetFilter: (key?: string) => {
            set((state) => {
              if (key) {
                // Reset specific filter
                delete state.filters[key as keyof FilterState];
                delete state.uiState.activeFilters[key];
                delete state.uiState.errors[key];
              } else {
                // Reset all filters
                state.filters = {};
                state.uiState.activeFilters = {};
                state.uiState.errors = {};
                state.uiState.pendingFilters = {};
              }
              
              // Add to history
              get().addToHistory(state.filters);
            });
          },

          clearAllFilters: () => {
            set((state) => {
              state.filters = {};
              state.uiState.activeFilters = {};
              state.uiState.errors = {};
              state.uiState.pendingFilters = {};
              
              // Add to history
              get().addToHistory({});
            });
          },

          applyFilters: () => {
            set((state) => {
              state.uiState.lastApplied = new Date();
              // Trigger external filter application
            });
          },

          // === UI Actions ===
          toggleExpandGroup: (groupKey: string) => {
            set((state) => {
              state.uiState.expandedGroups[groupKey] = !state.uiState.expandedGroups[groupKey];
            });
          },

          setSearchValue: (groupKey: string, value: string) => {
            set((state) => {
              state.uiState.searchValues[groupKey] = value;
            });
          },

          setPendingFilter: (key: string, value: FilterValue) => {
            set((state) => {
              state.uiState.pendingFilters[key] = value;
            });
          },

          commitPendingFilters: () => {
            set((state) => {
              Object.entries(state.uiState.pendingFilters).forEach(([key, value]) => {
                state.filters[key as keyof FilterState] = value as any;
                state.uiState.activeFilters[key] = value;
              });
              state.uiState.pendingFilters = {};
              
              // Add to history
              get().addToHistory(state.filters);
            });
          },

          discardPendingFilters: () => {
            set((state) => {
              state.uiState.pendingFilters = {};
            });
          },

          // === Presets ===
          savePreset: (name: string, description?: string, tags?: string[]): string => {
            const presetId = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            set((state) => {
              const preset: FilterPreset = {
                id: presetId,
                name,
                description,
                filters: { ...state.filters },
                isPublic: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                usageCount: 0,
                tags: tags || []
              };
              
              state.presets.push(preset);
            });
            
            return presetId;
          },

          loadPreset: (presetId: string) => {
            const preset = get().presets.find(p => p.id === presetId);
            if (!preset) return;
            
            set((state) => {
              state.filters = { ...preset.filters };
              state.uiState.activeFilters = { ...preset.filters } as any;
              state.uiState.errors = {};
              
              // Increment usage count
              const presetIndex = state.presets.findIndex(p => p.id === presetId);
              if (presetIndex !== -1) {
                state.presets[presetIndex].usageCount++;
                state.presets[presetIndex].updatedAt = new Date();
              }
              
              // Add to history
              get().addToHistory(state.filters);
            });
          },

          updatePreset: (presetId: string, updates: Partial<FilterPreset>) => {
            set((state) => {
              const presetIndex = state.presets.findIndex(p => p.id === presetId);
              if (presetIndex !== -1) {
                Object.assign(state.presets[presetIndex], updates, { updatedAt: new Date() });
              }
            });
          },

          deletePreset: (presetId: string) => {
            set((state) => {
              state.presets = state.presets.filter(p => p.id !== presetId);
            });
          },

          // === History ===
          goBack: () => {
            const { history, historyIndex } = get();
            if (historyIndex > 0) {
              const prevEntry = history[historyIndex - 1];
              set((state) => {
                state.filters = { ...prevEntry.filters };
                state.uiState.activeFilters = { ...prevEntry.filters } as any;
                state.historyIndex = historyIndex - 1;
              });
            }
          },

          goForward: () => {
            const { history, historyIndex } = get();
            if (historyIndex < history.length - 1) {
              const nextEntry = history[historyIndex + 1];
              set((state) => {
                state.filters = { ...nextEntry.filters };
                state.uiState.activeFilters = { ...nextEntry.filters } as any;
                state.historyIndex = historyIndex + 1;
              });
            }
          },

          clearHistory: () => {
            set((state) => {
              state.history = [];
              state.historyIndex = -1;
            });
          },

          // === Configuration ===
          setConfig: (config: Record<string, FilterGroupConfig>) => {
            set((state) => {
              state.config = config;
              
              // Update UI state based on config
              Object.entries(config).forEach(([key, groupConfig]) => {
                if (groupConfig.defaultExpanded !== undefined) {
                  state.uiState.expandedGroups[key] = groupConfig.defaultExpanded;
                }
              });
            });
          },

          updateConfig: (groupKey: string, config: Partial<FilterGroupConfig>) => {
            set((state) => {
              if (state.config[groupKey]) {
                Object.assign(state.config[groupKey], config);
              } else {
                state.config[groupKey] = config as FilterGroupConfig;
              }
            });
          },

          // === Meta ===
          setMeta: (meta: FilterResultMeta) => {
            set((state) => {
              state.meta = meta;
            });
          },

          // === Validation ===
          validateFilters: (): FilterValidationResult => {
            const filters = get().filters;
            const validation = FilterEngine.validateFilters(filters);
            
            set((state) => {
              state.uiState.errors = validation.errors;
            });
            
            return validation;
          },

          // === Utilities ===
          getActiveFiltersCount: () => {
            return FilterEngine.countActiveFilters(get().filters);
          },

          hasActiveFilters: () => {
            return !isEmptyFilter(get().filters);
          },

          exportFilters: (): string => {
            const data = {
              filters: get().filters,
              timestamp: new Date().toISOString(),
              version: '1.0'
            };
            return JSON.stringify(data, null, 2);
          },

          importFilters: (data: string): boolean => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.filters && typeof parsed.filters === 'object') {
                const cleaned = cleanFilters(parsed.filters);
                set((state) => {
                  state.filters = cleaned;
                  state.uiState.activeFilters = cleaned as any;
                  state.uiState.errors = {};
                });
                
                // Add to history
                get().addToHistory(cleaned);
                return true;
              }
              return false;
            } catch {
              return false;
            }
          },

          // === Debug ===
          resetStore: () => {
            set((state) => {
              state.filters = initialFilters;
              state.uiState = { ...initialUIState };
              state.meta = null;
              state.presets = [];
              state.history = [];
              state.historyIndex = -1;
            });
          },

          // === Internal Helpers ===
          addToHistory: (filters: FilterState) => {
            const { history, historyIndex } = get();
            
            // Don't add duplicate entries
            const lastEntry = history[historyIndex];
            if (lastEntry && JSON.stringify(lastEntry.filters) === JSON.stringify(filters)) {
              return;
            }
            
            set((state) => {
              const entry: FilterHistoryEntry = {
                id: `history_${Date.now()}`,
                filters: { ...filters },
                resultCount: state.meta?.filtered || 0,
                timestamp: new Date()
              };
              
              // Remove entries after current index
              state.history = state.history.slice(0, historyIndex + 1);
              
              // Add new entry
              state.history.push(entry);
              state.historyIndex = state.history.length - 1;
              
              // Limit history size
              if (state.history.length > 50) {
                state.history = state.history.slice(-50);
                state.historyIndex = state.history.length - 1;
              }
            });
          }
        }),
        {
          name: 'nike-filter-store',
          partialize: (state) => ({
            filters: state.filters,
            presets: state.presets,
            uiState: {
              expandedGroups: state.uiState.expandedGroups,
              searchValues: state.uiState.searchValues
            }
          })
        }
      )
    )
  )
);

// === Store Selectors ===
export const useFilterState = () => useFilterStore(state => state.filters);
export const useFilterUIState = () => useFilterStore(state => state.uiState);
export const useFilterMeta = () => useFilterStore(state => state.meta);
export const useFilterPresets = () => useFilterStore(state => state.presets);
export const useFilterHistory = () => useFilterStore(state => ({ 
  entries: state.history, 
  index: state.historyIndex 
}));

// === Custom Hooks ===
export const useActiveFilters = () => {
  return useFilterStore(state => ({
    count: FilterEngine.countActiveFilters(state.filters),
    hasFilters: !isEmptyFilter(state.filters),
    filters: state.filters
  }));
};

export const useFilterActions = () => {
  return useFilterStore(state => ({
    updateFilter: state.updateFilter,
    updateMultipleFilters: state.updateMultipleFilters,
    resetFilter: state.resetFilter,
    clearAllFilters: state.clearAllFilters,
    applyFilters: state.applyFilters
  }));
};

export const useFilterPresetActions = () => {
  return useFilterStore(state => ({
    savePreset: state.savePreset,
    loadPreset: state.loadPreset,
    updatePreset: state.updatePreset,
    deletePreset: state.deletePreset
  }));
};

// === Development Helper ===
if (process.env.NODE_ENV === 'development') {
  // Subscribe to changes for debugging
  useFilterStore.subscribe(
    (state) => state.filters,
    (filters) => {
      console.log('🔍 Filter state changed:', filters);
    }
  );
}