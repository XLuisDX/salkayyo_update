'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
  const requestVersion = useRef(0)
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

  const loadProducts = useCallback(async (currentFilters: Filters, version: number) => {
    setLoading(true)
    cursorRef.current = null

    try {
      if (currentFilters.search) {
        setIsSearchMode(true)
        const results = await ProductsService.search(currentFilters.search)
        if (version !== requestVersion.current) return
        setProducts(results)
        setHasMore(false)
      } else {
        setIsSearchMode(false)
        const response = await ProductsService.getAll(currentFilters)
        if (version !== requestVersion.current) return
        setProducts(response.items)
        setHasMore(response.hasMore)
        cursorRef.current = response.nextCursor
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMore || loading) return
    const version = requestVersion.current

    setLoadingMore(true)
    try {
      const response = await ProductsService.getAll(filters, cursorRef.current)
      if (version !== requestVersion.current) return
      setProducts((prev) => [...prev, ...response.items])
      setHasMore(response.hasMore)
      cursorRef.current = response.nextCursor
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      if (version === requestVersion.current) setLoadingMore(false)
    }
  }, [filters, loading, loadingMore])

  useEffect(() => {
    const version = ++requestVersion.current
    const timer = setTimeout(() => loadProducts(filters, version), filters.search ? 300 : 0)
    return () => {
      clearTimeout(timer)
      if (requestVersion.current === version) requestVersion.current = version + 1
    }
  }, [filters, loadProducts])

  const handleFilterChange = (newFilters: Filters) => {
    requestVersion.current++
    cursorRef.current = null
    setLoadingMore(false)
    setLoading(true)
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
