"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  SlidersHorizontal, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Filter,
  RotateCcw,
  Bookmark,
  History,
  Star,
  Palette,
  Ruler
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useFilterStore, useActiveFilters, useFilterActions } from '@/lib/stores/filter-store';
import { FilterGroupConfig, FilterOption, PriceRange } from '@/types/filters';
import { formatPrice } from '@/lib/utils';

// === Filter Configuration ===
const FILTER_GROUPS: Record<string, FilterGroupConfig> = {
  categories: {
    key: 'categories',
    label: 'Categorie',
    type: 'checkbox',
    icon: 'box',
    defaultExpanded: true,
    showCount: true,
    options: [
      { value: 'sneakers', label: 'Sneakers', count: 156 },
      { value: 'running', label: 'Running', count: 89 },
      { value: 'basketball', label: 'Basketball', count: 67 },
      { value: 'casual', label: 'Casual', count: 124 },
      { value: 'sandals', label: 'Sandali', count: 43 },
      { value: 'boots', label: 'Stivali', count: 29 }
    ]
  },
  brands: {
    key: 'brands',
    label: 'Brand',
    type: 'checkbox',
    searchable: true,
    showCount: true,
    options: [
      { value: 'nike', label: 'Nike', count: 234 },
      { value: 'adidas', label: 'Adidas', count: 187 },
      { value: 'jordan', label: 'Jordan', count: 98 },
      { value: 'converse', label: 'Converse', count: 76 },
      { value: 'vans', label: 'Vans', count: 54 },
      { value: 'newbalance', label: 'New Balance', count: 43 }
    ]
  },
  genders: {
    key: 'genders',
    label: 'Genere',
    type: 'radio',
    options: [
      { value: 'men', label: 'Uomo', count: 312 },
      { value: 'women', label: 'Donna', count: 298 },
      { value: 'unisex', label: 'Unisex', count: 89 },
      { value: 'kids', label: 'Bambini', count: 145 }
    ]
  },
  sizes: {
    key: 'sizes',
    label: 'Taglia',
    type: 'size',
    multiple: true,
    options: [
      { value: '36', label: '36' },
      { value: '37', label: '37' },
      { value: '38', label: '38' },
      { value: '39', label: '39' },
      { value: '40', label: '40' },
      { value: '41', label: '41' },
      { value: '42', label: '42' },
      { value: '43', label: '43' },
      { value: '44', label: '44' },
      { value: '45', label: '45' },
      { value: '46', label: '46' }
    ]
  },
  colors: {
    key: 'colors',
    label: 'Colore',
    type: 'color',
    multiple: true,
    options: [
      { value: 'black', label: 'Nero', color: '#000000', count: 89 },
      { value: 'white', label: 'Bianco', color: '#FFFFFF', count: 76 },
      { value: 'red', label: 'Rosso', color: '#DC2626', count: 54 },
      { value: 'blue', label: 'Blu', color: '#2563EB', count: 67 },
      { value: 'green', label: 'Verde', color: '#16A34A', count: 43 },
      { value: 'yellow', label: 'Giallo', color: '#EAB308', count: 32 },
      { value: 'pink', label: 'Rosa', color: '#EC4899', count: 29 },
      { value: 'gray', label: 'Grigio', color: '#6B7280', count: 56 }
    ]
  },
  priceRange: {
    key: 'priceRange',
    label: 'Prezzo',
    type: 'range',
    min: 0,
    max: 500,
    step: 10,
    unit: '€'
  }
};

// === Color Swatch Component ===
const ColorSwatch: React.FC<{ 
  option: FilterOption; 
  selected: boolean; 
  onSelect: () => void; 
}> = ({ option, selected, onSelect }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={onSelect}
          className={`
            relative w-8 h-8 rounded-full border-2 transition-all duration-200
            ${selected 
              ? 'border-black shadow-lg scale-110' 
              : 'border-gray-300 hover:border-gray-400 hover:scale-105'
            }
          `}
          style={{ backgroundColor: option.color }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
            </motion.div>
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>
        <span>{option.label} {option.count && `(${option.count})`}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// === Size Button Component ===
const SizeButton: React.FC<{ 
  option: FilterOption; 
  selected: boolean; 
  onSelect: () => void; 
}> = ({ option, selected, onSelect }) => (
  <motion.button
    onClick={onSelect}
    className={`
      px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200
      ${selected 
        ? 'bg-black text-white border-black' 
        : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
      }
    `}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {option.label}
  </motion.button>
);

// === Filter Group Component ===
const FilterGroup: React.FC<{
  config: FilterGroupConfig;
  activeValues: any;
  onUpdate: (key: string, value: any) => void;
}> = ({ config, activeValues, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(config.defaultExpanded ?? false);
  const [searchValue, setSearchValue] = useState('');
  
  const { uiState } = useFilterStore();
  const expanded = uiState.expandedGroups[config.key] ?? isExpanded;
  
  const filteredOptions = useMemo(() => {
    if (!config.searchable || !searchValue) return config.options || [];
    return (config.options || []).filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [config.options, config.searchable, searchValue]);

  const handleToggle = () => {
    useFilterStore.getState().toggleExpandGroup(config.key);
  };

  const renderFilterContent = () => {
    switch (config.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            {config.searchable && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Cerca ${config.label.toLowerCase()}...`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 h-8"
                />
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option) => {
                const isSelected = Array.isArray(activeValues) 
                  ? activeValues.includes(option.value)
                  : activeValues === option.value;
                
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${config.key}-${option.value}`}
                      checked={isSelected}
                      onCheckedChange={() => onUpdate(config.key, option.value)}
                      disabled={option.disabled}
                    />
                    <Label
                      htmlFor={`${config.key}-${option.value}`}
                      className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span className={option.disabled ? 'text-gray-400' : ''}>
                        {option.label}
                      </span>
                      {config.showCount && option.count && (
                        <Badge variant="secondary" className="text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={activeValues || ''}
            onValueChange={(value) => onUpdate(config.key, value)}
            className="space-y-2"
          >
            {(config.options || []).map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${config.key}-${option.value}`}
                  disabled={option.disabled}
                />
                <Label
                  htmlFor={`${config.key}-${option.value}`}
                  className="flex-1 text-sm cursor-pointer flex items-center justify-between"
                >
                  <span className={option.disabled ? 'text-gray-400' : ''}>
                    {option.label}
                  </span>
                  {config.showCount && option.count && (
                    <Badge variant="secondary" className="text-xs">
                      {option.count}
                    </Badge>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'color':
        return (
          <div className="flex flex-wrap gap-3">
            {(config.options || []).map((option) => {
              const isSelected = Array.isArray(activeValues) 
                ? activeValues.includes(option.value)
                : activeValues === option.value;
              
              return (
                <ColorSwatch
                  key={option.value}
                  option={option}
                  selected={isSelected}
                  onSelect={() => onUpdate(config.key, option.value)}
                />
              );
            })}
          </div>
        );

      case 'size':
        return (
          <div className="grid grid-cols-4 gap-2">
            {(config.options || []).map((option) => {
              const isSelected = Array.isArray(activeValues) 
                ? activeValues.includes(option.value)
                : activeValues === option.value;
              
              return (
                <SizeButton
                  key={option.value}
                  option={option}
                  selected={isSelected}
                  onSelect={() => onUpdate(config.key, option.value)}
                />
              );
            })}
          </div>
        );

      case 'range':
        const range = activeValues as PriceRange || {};
        const min = range.min ?? config.min ?? 0;
        const max = range.max ?? config.max ?? 100;
        
        return (
          <div className="space-y-4">
            <div className="px-2">
              <Slider
                value={[min, max]}
                onValueChange={([newMin, newMax]) => {
                  onUpdate(config.key, { min: newMin, max: newMax });
                }}
                max={config.max}
                min={config.min}
                step={config.step}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{config.unit}{min}</span>
              <span>{config.unit}{max}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={min}
                onChange={(e) => onUpdate(config.key, { ...range, min: Number(e.target.value) })}
                className="h-8 text-sm"
                min={config.min}
                max={config.max}
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={max}
                onChange={(e) => onUpdate(config.key, { ...range, max: Number(e.target.value) })}
                className="h-8 text-sm"
                min={config.min}
                max={config.max}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-200 pb-4"
    >
      <Collapsible open={expanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            onClick={handleToggle}
            className="w-full flex items-center justify-between p-0 h-auto font-medium text-left hover:bg-transparent"
          >
            <div className="flex items-center space-x-2">
              {config.icon === 'palette' && <Palette className="h-4 w-4" />}
              {config.icon === 'ruler' && <Ruler className="h-4 w-4" />}
              <span>{config.label}</span>
            </div>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            {renderFilterContent()}
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

// === Active Filters Component ===
const ActiveFilters: React.FC = () => {
  const { filters } = useActiveFilters();
  const { resetFilter } = useFilterActions();

  if (!Object.keys(filters).length) return null;

  const getFilterLabel = (key: string, value: any): string => {
    const config = FILTER_GROUPS[key];
    if (!config) return String(value);

    if (config.type === 'range' && typeof value === 'object') {
      const range = value as PriceRange;
      return `${config.unit || ''}${range.min || config.min} - ${config.unit || ''}${range.max || config.max}`;
    }

    if (Array.isArray(value)) {
      return value.map(v => {
        const option = config.options?.find(o => o.value === v);
        return option?.label || v;
      }).join(', ');
    }

    const option = config.options?.find(o => o.value === value);
    return option?.label || String(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-900">Filtri Attivi</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => useFilterStore.getState().clearAllFilters()}
          className="text-xs text-red-600 hover:text-red-700"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Rimuovi tutti
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return null;
          
          const config = FILTER_GROUPS[key];
          const label = getFilterLabel(key, value);
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Badge
                variant="secondary"
                className="flex items-center space-x-1 pr-1 pl-3 py-1"
              >
                <span className="text-xs">{config?.label}: {label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetFilter(key)}
                  className="h-4 w-4 p-0 hover:bg-red-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// === Main Filter Sidebar Component ===
const FilterSidebar: React.FC<{ className?: string }> = ({ className }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { filters } = useFilterStore();
  const { count, hasFilters } = useActiveFilters();
  const { updateFilter } = useFilterActions();

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-900">Filtri</h2>
          {count > 0 && (
            <Badge variant="default" className="h-5 min-w-[20px] text-xs">
              {count}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Salva filtri</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Cronologia filtri</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Separator />

      {/* Active Filters */}
      <ActiveFilters />

      {/* Filter Groups */}
      <div className="space-y-6">
        {Object.values(FILTER_GROUPS).map((config) => (
          <FilterGroup
            key={config.key}
            config={config}
            activeValues={filters[config.key as keyof typeof filters]}
            onUpdate={updateFilter}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtri
              {count > 0 && (
                <Badge variant="default" className="ml-2 h-5 min-w-[20px] text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-6 overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Filtri Prodotti</SheetTitle>
            </SheetHeader>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`hidden lg:block w-80 sticky top-4 ${className}`}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {sidebarContent}
        </div>
      </motion.div>
    </>
  );
};

export default FilterSidebar;