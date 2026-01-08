// Performance optimization example for ProductsClient
// Add these optimizations to existing components

import { memo, useCallback, useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
  onUpdate: (id: string) => void;
}

// Example: Memoize expensive filter operations
export const useOptimizedProductFilters = (products: Product[], search: string, status: string) => {
  return useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || product.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);
};

// Example: Memoize callbacks
export const useOptimizedCallbacks = (onUpdate: (id: string) => void) => {
  const handleUpdate = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);
  
  return { handleUpdate };
};

// Example: Memo for expensive components
export const ProductCard = memo(({ product, onUpdate }: ProductCardProps) => {
  return (
    <div>
      {/* Product card content */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.updatedAt === nextProps.product.updatedAt;
});
