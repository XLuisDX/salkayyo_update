'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { Product, Category, ProductFilters as Filters } from '@/types'
import { ProductsService } from '@/services/products.service'
import { CategoriesService } from '@/services/categories.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { PageHeader } from '@/components/common/PageHeader'
import { LogoWatermarks } from '@/components/common/LogoWatermarks'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { debounce } from '@/lib/utils'

export default function ProductsPage() {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'newest',
    limit: 12,
  })

  // Cursor for the next page — not component state, since it's an opaque
  // Firestore snapshot that only needs to survive until the next fetch.
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoriesService.getAll()
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [])

  const loadProducts = useCallback(async (currentFilters: Filters) => {
    setLoading(true)
    cursorRef.current = null

    try {
      if (currentFilters.search) {
        setIsSearchMode(true)
        const results = await ProductsService.search(currentFilters.search)
        setProducts(results)
        setHasMore(false)
      } else {
        setIsSearchMode(false)
        const response = await ProductsService.getAll(currentFilters)
        setProducts(response.items)
        setHasMore(response.hasMore)
        cursorRef.current = response.nextCursor
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMore) return

    setLoadingMore(true)
    try {
      const response = await ProductsService.getAll(filters, cursorRef.current)
      setProducts((prev) => [...prev, ...response.items])
      setHasMore(response.hasMore)
      cursorRef.current = response.nextCursor
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [filters, loadingMore])

  const debouncedLoadProducts = useMemo(
    () => debounce((filters: Filters) => {
      loadProducts(filters)
    }, 300),
    [loadProducts]
  )

  useEffect(() => {
    if (filters.search) {
      debouncedLoadProducts(filters)
    } else {
      loadProducts(filters)
    }
  }, [filters, loadProducts, debouncedLoadProducts])

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="relative overflow-hidden">
      <LogoWatermarks />
      <div className="container relative z-10 py-8">
        <PageHeader
          title={t('all')}
          description={t('allSubtitle')}
        />

        <div className="mb-8">
          <ProductFilters
            filters={filters}
            categories={categories}
            onFilterChange={handleFilterChange}
          />
        </div>

        <ProductGrid products={products} loading={loading} />

        {!loading && !isSearchMode && hasMore && (
          <div className="flex justify-center mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon('loading')}
                </>
              ) : (
                tCommon('loadMore')
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
