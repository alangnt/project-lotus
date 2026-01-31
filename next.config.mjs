/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com'
            }
        ],
        domains: [
            "localhost",
            "127.0.0.1",
            "projectlotus.com",
            "projectlotus.com.br",
            "www.projectlotus.com",
            "www.projectlotus.com.br",
            "projectlotus.vercel.app",
            "www.projectlotus.vercel.app",
            "project-lotus-8pfq.vercel.app",
            "www.project-lotus-8pfq.vercel.app"
        ]
    },
    async headers() {
        return [
            {
                // Apply security headers to all routes
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
