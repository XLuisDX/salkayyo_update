import { ReactNode } from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface CategoriesLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: CategoriesLayoutProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'categories' })

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: { canonical: `/${locale}/categories` },
  }
}

export default function CategoriesLayout({ children }: CategoriesLayoutProps) {
  return children
}
