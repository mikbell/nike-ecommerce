import { create } from 'zustand';

export interface Product {
  id: number;
  slug: string | null;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  category: string | null;
  brand: string | null;
  size: string | null;
  color: string | null;
  gender: string | null;
  stock: number | null;
  isNew: boolean;
  isSale: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,
  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));