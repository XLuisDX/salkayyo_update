import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Next.js 16 renamed middleware to proxy
export const proxy = createMiddleware(routing)

export const config = {
  matcher: ['/', '/(en|es)/:path*'],
}
