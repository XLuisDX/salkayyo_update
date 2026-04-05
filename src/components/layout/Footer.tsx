'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
// import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react'

export function Footer() {
  const t = useTranslations()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { href: '/products', label: t('nav.products') },
      { href: '/categories', label: t('nav.categories') },
      { href: '/wholesale', label: t('nav.wholesale') },
    ],
    account: [
      { href: '/profile', label: t('nav.profile') },
      { href: '/orders', label: t('nav.orders') },
      { href: '/cart', label: t('nav.cart') },
    ],
    legal: [
      { href: '/privacy', label: t('footer.privacy') },
      { href: '/terms', label: t('footer.terms') },
      { href: '/contact', label: t('footer.contact') },
    ],
  }

  // const socialLinks = [
  //   { icon: Instagram, href: '#', label: 'Instagram' },
  //   { icon: Twitter, href: '#', label: 'Twitter' },
  //   { icon: Facebook, href: '#', label: 'Facebook' },
  //   { icon: Youtube, href: '#', label: 'Youtube' },
  // ]

  return (
    <footer className="relative bg-card border-t border-border">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4"
          >
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/favicon.png"
                alt="Saklayyo"
                width={140}
                height={50}
                className="dark:hidden"
              />
              <Image
                src="/negativo.png"
                alt="Saklayyo"
                width={140}
                height={50}
                className="hidden dark:block"
              />
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              {t('footer.brandDescription')}
            </p>

            {/* Social Links
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div> */}
          </motion.div>

          {/* Links Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h4 className="font-semibold mb-5">{t('footer.shop')}</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <h4 className="font-semibold mb-5">{t('footer.account')}</h4>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h4 className="font-semibold mb-5">{t('footer.legal')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Column
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-2"
          >
            <h4 className="font-semibold mb-5">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:hello@saklayyo.com"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">hello@saklayyo.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">+1 (234) 567-890</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">123 Commerce St.<br />New York, NY 10001</span>
                </div>
              </li>
            </ul>
          </motion.div> */}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Saklayyo. {t('footer.rights')}.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {t('footer.systemsOperational')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
