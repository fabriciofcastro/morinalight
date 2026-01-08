import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SafeSuspense } from '../SafeSuspense';

const Box = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

const ErrorComponent = () => {
  throw new Error('Test Error');
  return null;
};

describe('SafeSuspense', () => {
  it('renders children when no error occurs', () => {
    render(
      <SafeSuspense>
        <Box>Content</Box>
      </SafeSuspense>
    );
    expect(screen.getByText('Content')).toBeDefined();
  });

  it('renders error fallback when a child throws', () => {
    // Suppress console.error for this test as we expect an error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <SafeSuspense>
        <ErrorComponent />
      </SafeSuspense>
    );
    
    expect(screen.getByText('Erro ao Carregar Componente')).toBeDefined();
    expect(screen.getByText('Test Error')).toBeDefined();
    
    spy.mockRestore();
  });
});
