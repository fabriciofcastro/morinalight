"use client";

/**
 * Componente de loader padrão para páginas
 * Usa o mesmo padrão visual do catálogo (ícone girando)
 * 
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <PageLoader message="Carregando dados..." />;
 * }
 * ```
 */
type PageLoaderProps = {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function PageLoader({
  message = "Carregando...",
  className = "",
  size = "md",
}: PageLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-6 ${className}`}>
      <div className="flex flex-col items-center justify-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent`} />
        {message && (
          <p className="mt-4 text-sm text-white/60">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Componente de loader inline para uso dentro de containers
 * 
 * @example
 * ```tsx
 * {loading ? (
 *   <InlineLoader message="Carregando..." />
 * ) : (
 *   <Content />
 * )}
 * ```
 */
type InlineLoaderProps = {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function InlineLoader({
  message = "Carregando...",
  className = "",
  size = "md",
}: InlineLoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="flex flex-col items-center justify-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent`} />
        {message && (
          <p className="mt-4 text-sm text-white/60">{message}</p>
        )}
      </div>
    </div>
  );
}







