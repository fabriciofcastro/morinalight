/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    experimental: {
        // Otimizar imports de pacotes grandes
        optimizePackageImports: ['@morina/ui', 'lucide-react', 'recharts'],
    },

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
