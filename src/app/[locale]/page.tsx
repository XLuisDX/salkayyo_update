import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { HeroSection } from './components/HeroSection'
import { FeaturedProducts } from './components/FeaturedProducts'
import { CategoriesSection } from './components/CategoriesSection'
import { NewsletterSection } from './components/NewsletterSection'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })

  return {
    title: t('appName'),
    description: 'Your trusted e-commerce destination for quality products',
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="flex flex-col">
      <section className="pt-6 pb-8">
        <HeroSection />
      </section>
      <CategoriesSection />
      <FeaturedProducts />
      <NewsletterSection />
    </div>
  )
}
