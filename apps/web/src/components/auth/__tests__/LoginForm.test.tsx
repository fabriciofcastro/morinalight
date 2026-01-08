import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from '../LoginForm';

// Mock hooks
vi.mock('@/presentation/hooks/use-login', () => ({
  useLogin: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

describe('LoginForm', () => {
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

  it('should render email and password inputs', () => {
    render(<LoginForm />, { wrapper });
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha|password/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<LoginForm />, { wrapper });
    
    const submitButton = screen.getByRole('button', { name: /entrar|login|iniciar/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should allow typing in email field', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper });
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should have password visibility toggle', () => {
    render(<LoginForm />, { wrapper });
    
    const toggleButton = screen.getByRole('button', { name: /mostrar|show|hide/i });
    expect(toggleButton).toBeInTheDocument();
  });
});
