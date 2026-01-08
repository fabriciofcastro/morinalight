import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrdersClient } from '../orders-client';

// Mock hooks
vi.mock('@/presentation/hooks/use-orders', () => ({
  useOrders: () => ({
    data: [
      {
        id: '1',
        orderNumber: 'ORD-001',
        customerName: 'Test Customer',
        customerEmail: 'customer@test.com',
        status: 'pending',
        total: 299.99,
        createdAt: new Date().toISOString()
      }
    ],
    isLoading: false,
    error: null
  })
}));

vi.mock('@/presentation/hooks/use-create-order', () => ({
  useCreateOrder: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

vi.mock('@/presentation/hooks/use-cancel-order', () => ({
  useCancelOrder: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

describe('OrdersClient', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render orders list', () => {
    render(<OrdersClient />, { wrapper });
    
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('Test Customer')).toBeInTheDocument();
  });

  it('should display order total', () => {
    render(<OrdersClient />, { wrapper });
    
    expect(screen.getByText(/299\.99/)).toBeInTheDocument();
  });

  it('should have create order button', () => {
    render(<OrdersClient />, { wrapper });
    
    const createButton = screen.getByRole('button', { name: /novo pedido/i });
    expect(createButton).toBeInTheDocument();
  });
});
