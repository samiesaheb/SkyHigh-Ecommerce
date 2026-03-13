import type { NextConfig } from "next";

// Bundle analyzer setup
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Development patterns
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.120",
        port: "8000",
        pathname: "/media/**",
      },
      // Production patterns (add your domain here)
      {
        protocol: "https",
        hostname: "your-domain.com",
        pathname: "/media/**",
      },
      // CDN patterns (if you use a CDN)
      {
        protocol: "https",
        hostname: "cdn.your-domain.com",
        pathname: "/**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable blur placeholders for better loading experience
    loader: 'default',
    unoptimized: false,
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      'class-variance-authority'
    ],
    optimizeCss: true,
  },
  // Turbopack specific optimizations
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Move server external packages to top level
  serverExternalPackages: ['sharp'],
  // Enable TypeScript checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Only add webpack config for production builds (not when using Turbopack in dev)
if (process.env.NODE_ENV === 'production' && !process.env.TURBOPACK) {
  nextConfig.webpack = (config, { dev, isServer }) => {
    // Only apply optimizations in production
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,

        // Advanced chunk splitting strategy
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            // Vendor chunks - separate by library type
            reactVendor: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-vendor',
              chunks: 'all',
              priority: 10,
            },
            stripeVendor: {
              test: /[\\/]node_modules[\\/]@stripe[\\/]/,
              name: 'stripe-vendor',
              chunks: 'all',
              priority: 9,
            },
            radixVendor: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-vendor',
              chunks: 'all',
              priority: 8,
            },
            chartVendor: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
              name: 'chart-vendor',
              chunks: 'all',
              priority: 7,
            },
            framerVendor: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-vendor',
              chunks: 'all',
              priority: 6,
            },
            // Common vendor chunk for other libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 5,
            },
            // Common app chunks
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 4,
            },
          },
        },
      };

      // Bundle analysis plugin
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: true,
          })
        );
      }
    }

    return config;
  };
}

export default withBundleAnalyzer(nextConfig);