import { unstable_cache } from 'next/cache';
import { db } from "@/lib/db";
import { ProductListItem, Product, ProductFilters, SortValue } from "@/types";
import { isNewProduct, matchesPriceRange, sortBy } from "@/lib/utils";

// === Cache Configuration ===
const CACHE_TAGS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
} as const;

const CACHE_DURATIONS = {
  PRODUCTS: 60 * 5, // 5 minutes
  STATIC: 60 * 60 * 24, // 24 hours
} as const;

// === Helper Functions ===
function transformProductToListItem(product: any): ProductListItem {
  const variants = product.variants || [];
  const images = product.images || [];
  
  const uniqueColors = Array.from(new Set(variants.map((v: any) => v.color.name)));
  const uniqueSizes = Array.from(new Set(variants.map((v: any) => v.size.name)));
  
  const hasSale = variants.some((v: any) => v.salePrice !== null);
  const basePrice = variants.length > 0 ? parseFloat(variants[0].price) : 0;
  const salePrice = hasSale && variants[0].salePrice ? parseFloat(variants[0].salePrice) : null;
  
  const primaryImage = images.find((img: any) => img.isPrimary) || images[0];
  
  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    description: product.description || "",
    price: salePrice || basePrice,
    originalPrice: hasSale && salePrice ? basePrice : undefined,
    imageUrl: primaryImage?.url || "/shoes/shoe-1.jpg",
    category: product.category.name,
    brand: product.brand.name,
    gender: product.gender.label,
    colors: uniqueColors,
    sizes: uniqueSizes,
    isNew: isNewProduct(product.createdAt),
    isSale: hasSale,
    rating: product.rating?.average,
    href: `/products/${product.slug}`,
  };
}

function applyFilters(products: ProductListItem[], filters: ProductFilters): ProductListItem[] {
  return products.filter((product) => {
    // Gender filter
    if (filters.genders?.length && !filters.genders.includes(product.gender.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filters.categories?.length && !filters.categories.includes(product.category.toLowerCase())) {
      return false;
    }

    // Brand filter
    if (filters.brands?.length && !filters.brands.includes(product.brand.toLowerCase())) {
      return false;
    }

    // Size filter
    if (filters.sizes?.length && !filters.sizes.some(size => product.sizes.includes(size))) {
      return false;
    }

    // Color filter
    if (filters.colors?.length && !filters.colors.some(color => 
      product.colors.some(productColor => 
        productColor.toLowerCase().includes(color.toLowerCase())
      )
    )) {
      return false;
    }

    // Price range filter
    if (filters.priceRanges?.length && !filters.priceRanges.some(range => 
      matchesPriceRange(product.price, range)
    )) {
      return false;
    }

    // In stock filter
    if (filters.inStock && product.sizes.length === 0) {
      return false;
    }

    return true;
  });
}

function applySorting(products: ProductListItem[], sortValue?: SortValue): ProductListItem[] {
  switch (sortValue) {
    case 'newest':
      return sortBy(products, (p) => p.isNew ? 1 : 0, 'desc');
    
    case 'price_asc':
      return sortBy(products, (p) => p.price, 'asc');
    
    case 'price_desc':
      return sortBy(products, (p) => p.price, 'desc');
    
    case 'rating':
      return sortBy(products, (p) => p.rating || 0, 'desc');
    
    case 'featured':
    default:
      return products; // Assume products are already in featured order
  }
}

// === Cached Query Functions ===

export const getAllProducts = unstable_cache(
  async (): Promise<ProductListItem[]> => {
    try {
      const products = await db.query.products.findMany({
        where: (products, { eq }) => eq(products.isPublished, true),
        with: {
          category: true,
          gender: true,
          brand: true,
          variants: {
            with: {
              color: true,
              size: true,
            },
          },
          images: {
            orderBy: (images, { asc }) => [asc(images.sortOrder)],
          },
        },
        orderBy: (products, { desc }) => [desc(products.createdAt)],
      });

      if (products.length === 0) {
        return [];
      }

      return products.map(transformProductToListItem);
    } catch (error) {
      console.error('💥 Error in getAllProducts:', error);
      return [];
    }
  },
  ['all-products'],
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.PRODUCTS,
  }
);

export const getProductsByCategory = unstable_cache(
  async (categorySlug: string): Promise<ProductListItem[]> => {
    try {
      // First get the category
      const category = await db.query.categories.findFirst({
        where: (categories, { eq }) => eq(categories.slug, categorySlug),
        with: {
          children: true,
        },
      });

      if (!category) {
        return [];
      }

      // Get all category IDs (including subcategories)
      const categoryIds = [category.id, ...category.children.map(child => child.id)];

      // Get products from this category and its subcategories
      const products = await db.query.products.findMany({
        where: (products, { and, inArray, eq }) => 
          and(
            inArray(products.categoryId, categoryIds),
            eq(products.isPublished, true)
          ),
        with: {
          category: true,
          gender: true,
          brand: true,
          variants: {
            with: {
              color: true,
              size: true,
            },
          },
          images: {
            orderBy: (images, { asc }) => [asc(images.sortOrder)],
          },
        },
        orderBy: (products, { desc }) => [desc(products.createdAt)],
      });

      return products.map(transformProductToListItem);
    } catch (error) {
      console.error('💥 Error in getProductsByCategory:', error);
      return [];
    }
  },
  ['products-by-category'],
  {
    tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.CATEGORIES],
    revalidate: CACHE_DURATIONS.PRODUCTS,
  }
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const product = await db.query.products.findFirst({
        where: (products, { and, eq }) => 
          and(
            eq(products.slug, slug),
            eq(products.isPublished, true)
          ),
        with: {
          category: true,
          gender: true,
          brand: true,
          variants: {
            with: {
              color: true,
              size: true,
            },
          },
          images: {
            orderBy: (images, { asc }) => [asc(images.sortOrder)],
          },
        },
      });

      if (!product) {
        return null;
      }

      // Transform variants by color
      const variantsByColor = product.variants.reduce((acc: any, variant: any) => {
        const colorName = variant.color.name;
        if (!acc[colorName]) {
          acc[colorName] = {
            color: colorName,
            colorSlug: variant.color.slug,
            hexCode: variant.color.hexCode,
            images: [],
            sizes: [],
          };
        }

        const variantImages = product.images.filter((img: any) => img.variantId === variant.id);
        if (variantImages.length > 0) {
          acc[colorName].images.push(...variantImages.map((img: any) => img.url));
        }

        if (!acc[colorName].sizes.find((s: any) => s.size === variant.size.name)) {
          acc[colorName].sizes.push({
            size: variant.size.name,
            inStock: variant.inStock > 0,
          });
        }

        return acc;
      }, {});

      const productVariants = Object.values(variantsByColor).map((variant: any) => ({
        ...variant,
        images: variant.images.length > 0 ? variant.images : [product.images[0]?.url || "/shoes/shoe-1.jpg"],
      }));

      const basePrice = product.variants.length > 0 ? parseFloat(product.variants[0].price) : 0;
      const hasSale = product.variants.some((v: any) => v.salePrice !== null);
      const salePrice = hasSale && product.variants[0].salePrice ? parseFloat(product.variants[0].salePrice) : null;

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description || "",
        category: product.category,
        brand: product.brand,
        gender: product.gender,
        variants: productVariants,
        images: product.images,
        tags: [], // TODO: Add tags when implemented
        isPublished: product.isPublished,
        isFeatured: false, // TODO: Add featured field when implemented
        isNew: isNewProduct(product.createdAt),
        rating: {
          average: 4.5, // TODO: Implement real ratings
          count: Math.floor(Math.random() * 100) + 10,
        },
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    } catch (error) {
      console.error('💥 Error in getProductBySlug:', error);
      return null;
    }
  },
  ['product-by-slug'],
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.PRODUCTS,
  }
);

export const getFeaturedProducts = unstable_cache(
  async (limit: number = 8): Promise<ProductListItem[]> => {
    try {
      const products = await db.query.products.findMany({
        where: (products, { eq }) => eq(products.isPublished, true),
        with: {
          category: true,
          gender: true,
          brand: true,
          variants: {
            with: {
              color: true,
              size: true,
            },
          },
          images: {
            orderBy: (images, { asc }) => [asc(images.sortOrder)],
          },
        },
        orderBy: (products, { desc }) => [desc(products.createdAt)],
        limit,
      });

      return products.map(transformProductToListItem);
    } catch (error) {
      console.error('💥 Error in getFeaturedProducts:', error);
      return [];
    }
  },
  ['featured-products'],
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.PRODUCTS,
  }
);

export const searchProducts = unstable_cache(
  async (
    query: string,
    filters: ProductFilters = {},
    sortValue?: SortValue,
    limit: number = 20
  ): Promise<ProductListItem[]> => {
    try {
      const allProducts = await getAllProducts();
      
      // Text search
      const searchResults = allProducts.filter((product) => {
        const searchString = `${product.title} ${product.description} ${product.category} ${product.brand}`.toLowerCase();
        return searchString.includes(query.toLowerCase());
      });

      // Apply filters
      const filteredProducts = applyFilters(searchResults, filters);

      // Apply sorting
      const sortedProducts = applySorting(filteredProducts, sortValue);

      // Apply limit
      return sortedProducts.slice(0, limit);
    } catch (error) {
      console.error('💥 Error in searchProducts:', error);
      return [];
    }
  },
  ['search-products'],
  {
    tags: [CACHE_TAGS.PRODUCTS],
    revalidate: CACHE_DURATIONS.PRODUCTS,
  }
);

// === Export optimized functions ===
export {
  applyFilters,
  applySorting,
  transformProductToListItem,
};