import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { locales } from '@/i18n/config'

export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    'admin',
    'cart',
    'checkout',
    'orders',
    'profile',
    'recipients',
    'wishlist',
    'login',
    'register',
    'forgot-password',
    'verify-email',
  ]

  const disallow = locales.flatMap((locale) =>
    privatePaths.map((path) => `/${locale}/${path}`)
  )
  disallow.push('/api/')

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
