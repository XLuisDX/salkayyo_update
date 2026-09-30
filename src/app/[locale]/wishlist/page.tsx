'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Heart, Trash2 } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Product } from '@/types'
import { ProductsService } from '@/services/products.service'
import { useWishlist } from '@/context/WishlistContext'
import { ProductGrid } from '@/components/products/ProductGrid'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'

export default function WishlistPage() {
  const t = useTranslations('wishlist')
  const { wishlist, clearWishlist } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWishlistProducts = async () => {
      setLoading(true)
      try {
        const results = await Promise.all(
          wishlist.map((id) => ProductsService.getById(id))
        )
        setProducts(results.filter((p): p is Product => p !== null))
      } catch (error) {
        console.error('Error loading wishlist products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWishlistProducts()
  }, [wishlist])

  if (!loading && wishlist.length === 0) {
    return (
      <div className="container py-8">
        <PageHeader title={t('title')} />
        <EmptyState
          icon={Heart}
          title={t('empty')}
          description={t('emptyDescription')}
          action={
            <Link href="/products">
              <Button>{t('continueShopping')}</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <PageHeader
        title={t('title')}
        action={
          products.length > 0 ? (
            <Button variant="outline" onClick={clearWishlist} className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t('clearWishlist')}
            </Button>
          ) : undefined
        }
      />

      <ProductGrid products={products} loading={loading} />
    </div>
  )
}
