/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true
    },
    typescript: {
      ignoreBuildErrors: true
    },
    reactStrictMode: true,
    // Production optimizations
    productionBrowserSourceMaps: false,
    // Build optimization for Vercel
    onDemandEntries: {
      maxInactiveAge: 60 * 60 * 1000,
      pagesBufferLength: 5,
    },
    // Image optimization
    images: {
      domains:[
        'cdn.onlyfans.com',
      ],
      formats: ['image/avif', 'image/webp'],
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      minimumCacheTTL: 60,
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
          port: '',
          pathname: '/**',
        },
        { protocol: 'https', hostname: 'thumbs.onlyfans.com' },
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'randomuser.me',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'i.pravatar.cc',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'qyloyaubnicryoazpcja.supabase.co',
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
        {
          protocol: 'https',
          hostname: 'public.onlyfans.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'thumbs.onlyfans.com',
          port: '',
          pathname: '/**',
        }
      ],
    },
    // Webpack optimization - use Next.js defaults
    webpack: (config) => {
      return config;
    },
    // Caching and headers
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin'
            }
          ]
        },
        {
          source: '/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            }
          ]
        },
        {
          source: '/images/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            }
          ]
        },
        {
          source: '/api/(.*)',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*'
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS'
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization, x-refresh-token'
            },
            {
              key: 'Cache-Control',
              value: 'no-store, must-revalidate'
            }
          ]
        },
        {
          source: '/api/(.*)/(.*)',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*'
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS'
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization, x-refresh-token'
            },
            {
              key: 'Cache-Control',
              value: 'no-store, must-revalidate'
            }
          ]
        }
      ];
    },
    // Redirects for optimization
    async redirects() {
      return [];
    }
  };
  
  module.exports = nextConfig;
  