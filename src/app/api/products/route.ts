import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  withErrorHandling, 
  withValidation,
  withRateLimit,
  createPaginatedResponse,
  composeMiddleware,
} from '@/lib/api';
import { 
  getAllProducts, 
  searchProducts,
  applyFilters,
  applySorting 
} from '@/lib/db/queries/products.optimized';
import { ProductFilters, SortValue, SORT_OPTIONS, PRICE_RANGES } from '@/types';

// === Validation Schemas ===
const ProductsQuerySchema = z.object({
  // Pagination
  page: z.string().transform(val => Math.max(1, parseInt(val) || 1)).optional(),
  limit: z.string().transform(val => Math.min(50, Math.max(1, parseInt(val) || 20))).optional(),
  
  // Search
  q: z.string().min(1).optional(),
  
  // Filters
  categories: z.string().optional(),
  brands: z.string().optional(),
  genders: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  priceRanges: z.string().optional(),
  tags: z.string().optional(),
  inStock: z.enum(['true', 'false']).optional(),
  
  // Sorting
  sort: z.enum(SORT_OPTIONS.map(o => o.value) as [string, ...string[]]).optional(),
  
  // Additional options
  featured: z.enum(['true', 'false']).optional(),
  new: z.enum(['true', 'false']).optional(),
  sale: z.enum(['true', 'false']).optional(),
});

type ProductsQuery = z.infer<typeof ProductsQuerySchema>;

// === Helper Functions ===
function parseArrayParam(param?: string): string[] {
  if (!param) return [];
  return param.split(',').filter(Boolean);
}

function buildFilters(query: ProductsQuery): ProductFilters {
  return {
    categories: parseArrayParam(query.categories),
    brands: parseArrayParam(query.brands),
    genders: parseArrayParam(query.genders),
    sizes: parseArrayParam(query.sizes),
    colors: parseArrayParam(query.colors),
    priceRanges: parseArrayParam(query.priceRanges),
    tags: parseArrayParam(query.tags),
    inStock: query.inStock === 'true',
  };
}

function validateFilters(filters: ProductFilters): void {
  // Validate price ranges
  if (filters.priceRanges) {
    const validRanges = PRICE_RANGES.map(r => r.value);
    const invalidRanges = filters.priceRanges.filter(range => !validRanges.includes(range));
    if (invalidRanges.length > 0) {
      throw new Error(`Invalid price ranges: ${invalidRanges.join(', ')}`);
    }
  }

  // Validate sort options
  // (This is handled by the schema validation above)
}

// === Main Handler ===
async function handleGetProducts(
  request: NextRequest,
  { query }: { query: ProductsQuery }
) {
  // Build filters from query
  const filters = buildFilters(query);
  validateFilters(filters);

  // Handle search vs. regular product listing
  let products;
  
  if (query.q) {
    // Search products
    products = await searchProducts(
      query.q,
      filters,
      query.sort as SortValue,
      100 // Max search results
    );
  } else {
    // Get all products and apply filters/sorting
    const allProducts = await getAllProducts();
    const filteredProducts = applyFilters(allProducts, filters);
    products = applySorting(filteredProducts, query.sort as SortValue);
  }

  // Apply additional filters
  if (query.featured === 'true') {
    products = products.filter(p => p.isNew || p.isSale); // Assuming featured = new or sale
  }
  
  if (query.new === 'true') {
    products = products.filter(p => p.isNew);
  }
  
  if (query.sale === 'true') {
    products = products.filter(p => p.isSale);
  }

  // Handle pagination
  const page = query.page || 1;
  const limit = query.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Return paginated response
  return createPaginatedResponse(
    paginatedProducts,
    {
      page,
      limit,
      total: products.length,
    },
    {
      message: query.q 
        ? `Found ${products.length} products for "${query.q}"`
        : `Retrieved ${products.length} products`,
    }
  );
}

// === Export with Middleware ===
export const GET = composeMiddleware(
  withRateLimit({ maxRequests: 100, windowMs: 60 * 1000 }),
  withValidation({ querySchema: ProductsQuerySchema }),
  withErrorHandling
)(handleGetProducts);

// === Route Segment Config ===
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Ensure fresh data
export const revalidate = 300; // Cache for 5 minutes