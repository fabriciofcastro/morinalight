import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UsersClient } from '../users-client';

// Mock hooks
vi.mock('@/presentation/hooks/use-users', () => ({
  useUsers: () => ({
    data: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        isActive: true
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        isActive: true
      }
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn()
  })
}));

vi.mock('@/presentation/hooks/use-create-user', () => ({
  useCreateUser: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

vi.mock('@/presentation/hooks/use-update-user', () => ({
  useUpdateUser: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

describe('UsersClient', () => {
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

  it('should render users list', () => {
    render(<UsersClient />, { wrapper });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should display user emails', () => {
    render(<UsersClient />, { wrapper });
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should have create user button', () => {
    render(<UsersClient />, { wrapper });
    
    const createButton = screen.getByRole('button', { name: /novo usuário/i });
    expect(createButton).toBeInTheDocument();
  });
});
