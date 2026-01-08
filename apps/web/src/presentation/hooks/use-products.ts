'use client';

import { ProductResponseDTO } from '@/application/dto';
import { useQuery } from '@tanstack/react-query';

// Note: In Clean Architecture, we typically use a Query (CQRS) for reading.
// For now, let's assume valid API endpoint or DI Query usage.
// Since we are migrating, we might fetch from API directly if "ListProductsQuery" isn't fully ready/exposed via DI to client (client can't use DI directly for classes usually, unless passed via Server Component or API).
// So standard pattern: Hook calls API which calls Query.

export type ProductFilters = {
  status?: string;
  search?: string;
};

async function fetchProducts(filters?: ProductFilters): Promise<ProductResponseDTO[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters?.search && filters.search.length >= 2) {
    params.append('busca', filters.search);
  }

  const res = await fetch(`/api/catalogo/produtos?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  // Assume the API returns { itens: ... } or just array. 
  // Previous code: const data: ProductsResponse = await response.json(); setProducts(data.itens || []);
  // We need to handle this structure relative to what the DTO expects.
  // If useProducts expects ProductResponseDTO[], but API returns { items: [] }, we need to map.
  const data = await res.json();
  return data.itens || data; 
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  });
}
