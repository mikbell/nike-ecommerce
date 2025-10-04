// === Core Types ===
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// === User Types ===
export interface User extends BaseEntity {
  name: string;
  email: string;
  image?: string;
  role: 'admin' | 'user';
}

// === Product Types ===
export interface ProductVariant {
  id: string;
  color: {
    name: string;
    slug: string;
    hexCode: string;
  };
  size: {
    name: string;
    value: string;
  };
  price: number;
  salePrice?: number;
  inStock: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  imageUrl?: string;
}

export interface Brand extends BaseEntity {
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

export interface Product extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  category: Category;
  brand: Brand;
  gender: {
    id: string;
    label: string;
    value: string;
  };
  variants: ProductVariant[];
  images: ProductImage[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isNew: boolean;
  rating?: {
    average: number;
    count: number;
  };
}

// === Simplified Product for Lists ===
export interface ProductListItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  brand: string;
  gender: string;
  colors: string[];
  sizes: string[];
  isNew: boolean;
  isSale: boolean;
  rating?: number;
  href: string;
}

// === Cart Types ===
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  size: string;
  color: string;
  quantity: number;
  maxQuantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

// === Filter Types ===
export interface ProductFilters {
  categories?: string[];
  brands?: string[];
  genders?: string[];
  sizes?: string[];
  colors?: string[];
  priceRanges?: string[];
  tags?: string[];
  inStock?: boolean;
}

export interface SortOption {
  label: string;
  value: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Best Rating', value: 'rating' },
] as const;

export type SortValue = typeof SORT_OPTIONS[number]['value'];

// === Order Types ===
export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
}

// === API Response Types ===
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === Form Types ===
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  saveInfo: boolean;
  newsletter: boolean;
}

// === Navigation Types ===
export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  children?: NavLink[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

// === Component Props Types ===
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// === Error Types ===
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// === Constants ===
export const PRICE_RANGES = [
  { label: '$0 - $50', value: '0-50', min: 0, max: 50 },
  { label: '$50 - $100', value: '50-100', min: 50, max: 100 },
  { label: '$100 - $150', value: '100-150', min: 100, max: 150 },
  { label: '$150+', value: '150+', min: 150, max: Infinity },
] as const;

export const GENDER_OPTIONS = [
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids', value: 'kids' },
  { label: 'Unisex', value: 'unisex' },
] as const;