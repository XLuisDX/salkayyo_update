import { ReactNode } from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface ProductsLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ProductsLayoutProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'products' })

  return {
    title: t('title'),
    description: t('allSubtitle'),
    alternates: { canonical: `/${locale}/products` },
  }
}

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return children
}
