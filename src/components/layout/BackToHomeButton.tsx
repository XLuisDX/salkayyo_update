'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export function BackToHomeButton() {
  const pathname = usePathname()
  const t = useTranslations()
  const isHome = pathname === '/'

  return (
    <AnimatePresence>
      {!isHome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Link
            href="/"
            aria-label={t('common.backToHome')}
            title={t('common.backToHome')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform hover:scale-110 active:scale-95"
          >
            <Home className="h-5 w-5" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
