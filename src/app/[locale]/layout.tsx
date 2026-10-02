import { ReactNode } from 'react'
import { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, Locale } from '@/i18n/config'
import { SITE_URL } from '@/lib/seo'
import { Providers } from '@/context/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BackToHomeButton } from '@/components/layout/BackToHomeButton'

const ogLocales: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
}

interface LocaleLayoutProps {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })

  const languages: Record<string, string> = {}
  for (const l of locales) {
    languages[l] = `/${l}`
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Salkayyo Store",
      template: "%s | Salkayyo Store",
    },
    description: t("siteDescription"),
    keywords: t("keywords")
      .split(",")
      .map((k) => k.trim()),
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Salkayyo Store",
      title: {
        default: "Salkayyo Store",
        template: "%s | Salkayyo Store",
      },
      description: t("siteDescription"),
      locale: ogLocales[locale as Locale] ?? "en_US",
      images: ["/logo-email.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Salkayyo Store",
      description: t("siteDescription"),
      images: ["/logo-email.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "Salkayyo Store",
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/logo-email.png`,
  };

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToHomeButton />
        </div>
      </Providers>
    </NextIntlClientProvider>
  )
}
