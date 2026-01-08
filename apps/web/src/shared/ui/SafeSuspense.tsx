'use client';

import React, { Suspense } from 'react';
import { ErrorState } from './base/ErrorState';
import { LoadingState } from './base/LoadingState';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorState 
          title="Erro ao Carregar Componente"
          message={this.state.error?.message || "Algo deu errado ao renderizar este widget."}
        />
      );
    }

    return this.props.children;
  }
}

interface SafeSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

/**
 * SafeSuspense
 * 
 * Combines React Suspense with a robust ErrorBoundary.
 * Best used for wrapping heavy widgets or lazy-loaded components.
 */
export function SafeSuspense({ 
  children, 
  fallback = <LoadingState message="Preparando componente..." />,
  errorFallback
}: SafeSuspenseProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
