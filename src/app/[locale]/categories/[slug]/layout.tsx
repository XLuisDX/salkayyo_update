import { ReactNode } from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getCategoryForSeoBySlug } from '@/lib/seo'

interface CategoryLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: CategoryLayoutProps): Promise<Metadata> {
  const { locale, slug } = await params
  const category = await getCategoryForSeoBySlug(slug)
  const t = await getTranslations({ locale, namespace: 'categories' })

  if (!category) {
    return { title: t('notFound') }
  }

  const description = category.description || t('browseAllInCategory', { name: category.name })

  return {
    title: category.name,
    description,
    alternates: { canonical: `/${locale}/categories/${slug}` },
    openGraph: category.image
      ? {
          title: category.name,
          description,
          url: `/${locale}/categories/${slug}`,
          images: [{ url: category.image, alt: category.name }],
        }
      : undefined,
  }
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return children
}
