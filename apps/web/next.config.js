/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    experimental: {
        // Otimizar imports de pacotes grandes
        optimizePackageImports: ['@morina/ui', 'lucide-react', 'recharts'],
    },
    transpilePackages: ['@morina/ui'],

    // Security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ];
    },

    // Configurações de imagem
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    async redirects() {
        return [
            { source: '/clientes', destination: '/admin/clients/list', permanent: true },
            { source: '/clientes/new', destination: '/admin/clients/new', permanent: true },
            { source: '/clientes/:id', destination: '/admin/clients/:id', permanent: true },
            { source: '/clientes/:id/edit', destination: '/admin/clients/:id/edit', permanent: true },
            
            { source: '/fornecedores', destination: '/admin/suppliers/list', permanent: true },
            { source: '/fornecedores/new', destination: '/admin/suppliers/new', permanent: true },
            { source: '/fornecedores/:id', destination: '/admin/suppliers/:id', permanent: true },
            { source: '/fornecedores/:id/edit', destination: '/admin/suppliers/:id/edit', permanent: true },
            
            { source: '/catalogo', destination: '/admin/products/list', permanent: true },
            { source: '/catalog', destination: '/admin/products/list', permanent: true },
            
            { source: '/pre-fichas-tecnicas', destination: '/admin/pre-technical-sheets/list', permanent: true },
            { source: '/pre-fichas-tecnicas/new', destination: '/admin/pre-technical-sheets/new', permanent: true },
            
            { source: '/fichas-custo', destination: '/admin/cost-sheets/list', permanent: true },
            { source: '/fichas-custo/new', destination: '/admin/cost-sheets/new', permanent: true },
            
            { source: '/insumos', destination: '/admin/inputs/list', permanent: true },
            { source: '/insumos/new', destination: '/admin/inputs/new', permanent: true },
            
            { source: '/producao', destination: '/admin/production', permanent: true },
            { source: '/logistica', destination: '/admin/logistics', permanent: true },
            
            { source: '/representantes', destination: '/admin/representatives/list', permanent: true },
            { source: '/comissoes', destination: '/admin/commissions/list', permanent: true },
            
            { source: '/users', destination: '/admin/users/list', permanent: true },
            { source: '/users/new', destination: '/admin/users/new', permanent: true },
            
            { source: '/products', destination: '/admin/products/list', permanent: true },
            { source: '/products/new', destination: '/admin/products/new', permanent: true },
        ];
    },

    // API Proxy - Redireciona /api/* para o backend
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/:path*`,
            },
        ];
    },
};


// Injeta configuração do Sentry
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
    withBundleAnalyzer(nextConfig),
    {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,
        org: "morinalight",
        project: "morinalight",
    },
    {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Transpiles SDK to be compatible with IE11 (increases bundle size)
        transpileClientSDK: true,

        // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
        tunnelRoute: "/monitoring",

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,
    }
);
