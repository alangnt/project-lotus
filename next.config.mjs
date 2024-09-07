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
        ]
    }
};

export default nextConfig;
