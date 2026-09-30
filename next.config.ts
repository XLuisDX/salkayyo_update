import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const noindexPaths = [
  'admin/:path*',
  'cart',
  'checkout',
  'orders/:path*',
  'profile',
  'recipients/:path*',
  'wishlist',
  'login',
  'register',
  'forgot-password',
  'verify-email',
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31 days - product/category images rarely change
  },
  async headers() {
    return noindexPaths.map((path) => ({
      source: `/:locale/${path}`,
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex, nofollow',
        },
      ],
    }));
  },
};

export default withNextIntl(nextConfig);
