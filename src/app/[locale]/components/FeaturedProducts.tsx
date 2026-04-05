'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Product } from '@/types'
import { ProductsService } from '@/services/products.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Button } from '@/components/ui/button'

// Mock data for visualization
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound.',
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'],
    categoryId: 'electronics',
    stock: 50,
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Minimalist Watch',
    description: 'Elegant minimalist watch with leather strap and Swiss movement.',
    price: 189.00,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
    categoryId: 'accessories',
    stock: 30,
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Designer Sunglasses',
    description: 'Premium designer sunglasses with UV protection.',
    price: 245.00,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80'],
    categoryId: 'accessories',
    stock: 25,
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Leather Backpack',
    description: 'Handcrafted leather backpack with premium materials.',
    price: 349.00,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
    categoryId: 'bags',
    stock: 20,
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '5',
    title: 'Smart Speaker',
    description: 'Voice-controlled smart speaker with premium audio.',
    price: 129.99,
    images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&q=80'],
    categoryId: 'electronics',
    stock: 100,
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '6',
    title: 'Ceramic Vase Set',
    description: 'Modern ceramic vase set for home decoration.',
    price: 89.00,
    images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80'],
    categoryId: 'home',
    stock: 40,
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '7',
    title: 'Running Sneakers',
    description: 'Lightweight running sneakers with advanced cushioning.',
    price: 159.00,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    categoryId: 'footwear',
    stock: 60,
    featured: true,
    createdAt: new Date(),
  },
  {
    id: '8',
    title: 'Camera Lens',
    description: 'Professional camera lens for stunning photography.',
    price: 899.00,
    images: ['https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80'],
    categoryId: 'electronics',
    stock: 15,
    featured: true,
    createdAt: new Date(),
  },
]

export function FeaturedProducts() {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const featured = await ProductsService.getFeatured(8)
        // Use mock data if no products returned
        setProducts(featured.length > 0 ? featured : MOCK_PRODUCTS)
      } catch (error) {
        console.error('Error loading featured products:', error)
        // Use mock data on error
        setProducts(MOCK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [])

  return (
    <section className="py-20 md:py-28">
      <div className="container">
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
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                {t('curatedSelection')}
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              {t('featured')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-md">
              {t('featuredSubtitle')}
            </p>
          </div>
          <Link href="/products">
            <Button
              variant="outline"
              className="group gap-2 h-12 px-6 rounded-full border-border hover:border-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              {tCommon('viewAll')}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <ProductGrid products={products} loading={loading} skeletonCount={8} />
      </div>
    </section>
  )
}
