'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Loader2, ShieldX, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { motion } from 'framer-motion'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('admin')
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </motion.div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 text-center max-w-sm"
        >
          <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('accessDenied')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('accessDeniedMessage')}
            </p>
          </div>
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('backToHome')}
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="lg:ml-60 min-h-screen">
        {/* Mobile spacer for fixed header */}
        <div className="h-14 lg:hidden" />
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
