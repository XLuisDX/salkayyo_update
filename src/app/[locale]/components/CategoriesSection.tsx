'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, Grid3X3 } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Category } from '@/types'
import { CategoriesService } from '@/services/categories.service'
import { Skeleton } from '@/components/ui/skeleton'

export function CategoriesSection() {
  const t = useTranslations('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const loadCategories = useCallback(async () => {
    try {
      const data = await CategoriesService.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return (
    <section className="relative py-20 md:py-28 bg-muted/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Logo Watermarks */}
        <motion.div
          className="absolute top-[5%] right-[10%] opacity-[0.03] dark:opacity-[0.02]"
          animate={{ rotate: [0, 3, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/favicon.png" alt="" width={200} height={70} className="select-none dark:hidden" />
          <Image src="/negativo.png" alt="" width={200} height={70} className="select-none hidden dark:block" />
        </motion.div>
        <motion.div
          className="absolute bottom-[10%] left-[5%] opacity-[0.02] dark:opacity-[0.015]"
          animate={{ rotate: [0, -2, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/favicon.png" alt="" width={150} height={50} className="select-none dark:hidden" />
          <Image src="/negativo.png" alt="" width={150} height={50} className="select-none hidden dark:block" />
        </motion.div>

        {/* Floating Circles */}
        <motion.div
          className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full bg-accent/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] w-48 h-48 rounded-full bg-accent/5 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Animated Rings */}
        <motion.div
          className="absolute top-[30%] right-[20%] w-20 h-20 rounded-full border border-accent/10"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        <motion.div
          className="absolute bottom-[40%] left-[10%] w-16 h-16 rounded-full border border-accent/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating Dots */}
        <motion.div
          className="absolute top-[15%] left-[30%] w-2 h-2 rounded-full bg-accent/20"
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[60%] right-[25%] w-3 h-3 rounded-full bg-accent/15"
          animate={{ y: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[40%] w-2 h-2 rounded-full bg-accent/25"
          animate={{ x: [0, 10, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Squares */}
        <motion.div
          className="absolute top-[45%] right-[15%] w-4 h-4 border border-accent/10 rotate-45"
          animate={{ rotate: [45, 90, 45], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[25%] left-[25%] w-3 h-3 bg-accent/10 rotate-45"
          animate={{ rotate: [45, 0, 45], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid Pattern Dots */}
        <div className="absolute top-[10%] right-[35%] grid grid-cols-3 gap-2 opacity-30">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-accent/30"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 text-foreground text-sm font-medium">
              <Grid3X3 className="h-3.5 w-3.5" />
              {t('shopByCategory')}
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noCategories')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
              >
                <Link href={`/categories/${category.slug}`}>
                  <div className="group relative aspect-square rounded-2xl overflow-hidden bg-card border border-border hover:border-accent/50 transition-all duration-500 card-hover">
                    {/* Background */}
                    <div className="absolute inset-0">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent/20 via-accent/10 to-transparent flex items-center justify-center">
                          <span className="text-5xl md:text-6xl font-bold text-accent/30">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-4 md:p-5">
                      <div className="flex items-end justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm md:text-base lg:text-lg mb-0.5 truncate group-hover:text-accent transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-white/60 text-xs md:text-sm hidden sm:block">
                            {t('viewProducts')}
                          </p>
                        </div>
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <ArrowUpRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
