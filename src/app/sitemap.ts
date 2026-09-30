import type { MetadataRoute } from 'next'
import { locales } from '@/i18n/config'
import { SITE_URL, getAllProductsForSitemap, getAllCategoriesForSitemap } from '@/lib/seo'

function localizedEntry(
  path: string,
  options: { lastModified?: Date; changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']; priority?: number }
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = `${SITE_URL}/${locale}${path}`
  }

  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    ...localizedEntry('', { lastModified: now, changeFrequency: 'daily', priority: 1 }),
    ...localizedEntry('/products', { lastModified: now, changeFrequency: 'daily', priority: 0.9 }),
    ...localizedEntry('/categories', { lastModified: now, changeFrequency: 'weekly', priority: 0.8 }),
    ...localizedEntry('/wholesale', { lastModified: now, changeFrequency: 'monthly', priority: 0.5 }),
  ]

  const [products, categories] = await Promise.all([
    getAllProductsForSitemap(),
    getAllCategoriesForSitemap(),
  ])

  const productEntries: MetadataRoute.Sitemap = products.flatMap((product) =>
    localizedEntry(`/products/${product.id}`, {
      lastModified: product.updatedAt ?? now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  )

  const categoryEntries: MetadataRoute.Sitemap = categories.flatMap((category) =>
    localizedEntry(`/categories/${category.slug}`, {
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  )

  return [...staticEntries, ...productEntries, ...categoryEntries]
}
