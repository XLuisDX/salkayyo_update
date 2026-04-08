'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { ProductSkeleton } from './ProductSkeleton'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
}

export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
}: ProductGridProps) {
  const t = useTranslations('common')

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductSkeleton />
          </motion.div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">{t('noResults')}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  )
}
