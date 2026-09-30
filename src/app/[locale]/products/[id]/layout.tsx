import { ReactNode } from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getProductForSeo } from '@/lib/seo'
import { formatPrice } from '@/lib/utils'

interface ProductLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const { locale, id } = await params
  const product = await getProductForSeo(id)

  if (!product) {
    const t = await getTranslations({ locale, namespace: 'products' })
    return { title: t('notFound') }
  }

  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.title} - ${formatPrice(product.price)}`

  return {
    title: product.title,
    description,
    alternates: { canonical: `/${locale}/products/${id}` },
    openGraph: product.image
      ? {
          title: product.title,
          description,
          url: `/${locale}/products/${id}`,
          images: [{ url: product.image, alt: product.title }],
        }
      : undefined,
    twitter: product.image
      ? {
          card: 'summary_large_image',
          title: product.title,
          description,
          images: [product.image],
        }
      : undefined,
  }
}

export default async function ProductLayout({ children, params }: ProductLayoutProps) {
  const { id } = await params
  const product = await getProductForSeo(id)

  if (!product) {
    return children
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    ...(product.image ? { image: [product.image] } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {children}
    </>
  )
}
