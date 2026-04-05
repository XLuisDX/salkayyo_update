'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Grid3X3 } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Category } from '@/types'
import { CategoriesService } from '@/services/categories.service'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Mock data for visualization
const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and tech',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trending styles',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Decor and essentials',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complete your look',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Sports',
    slug: 'sports',
    description: 'Gear up for action',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
    createdAt: new Date(),
  },
  {
    id: '6',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Skincare and makeup',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    createdAt: new Date(),
  },
]

export function CategoriesSection() {
  const t = useTranslations('categories')
  const tCommon = useTranslations('common')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoriesService.getAll()
        // Use mock data if no categories returned
        setCategories(data.length > 0 ? data.slice(0, 6) : MOCK_CATEGORIES)
      } catch (error) {
        console.error('Error loading categories:', error)
        // Use mock data on error
        setCategories(MOCK_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

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
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 text-foreground text-sm font-medium">
                <Grid3X3 className="h-3.5 w-3.5" />
                {t('shopByCategory')}
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {t('title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-md">
              {t('subtitle')}
            </p>
          </div>
          <Link href="/categories">
            <Button
              variant="outline"
              className="group gap-2 h-12 px-6 rounded-full border-border hover:border-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              {tCommon('viewAll')}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/categories/${category.slug}`}>
                  <div className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-card border border-border hover:border-accent/50 transition-all duration-500 card-hover">
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
                          <span className="text-6xl font-bold text-accent/30">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {t('viewProducts')}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <ArrowUpRight className="h-4 w-4 text-white" />
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
