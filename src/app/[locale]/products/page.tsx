'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Product, Category, ProductFilters as Filters } from '@/types'
import { ProductsService } from '@/services/products.service'
import { CategoriesService } from '@/services/categories.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { PageHeader } from '@/components/common/PageHeader'
import { debounce } from '@/lib/utils'

export default function ProductsPage() {
  const t = useTranslations('products')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'newest',
    page: 1,
    limit: 12,
  })

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
    try {
      if (currentFilters.search) {
        const results = await ProductsService.search(currentFilters.search)
        setProducts(results)
      } else {
        const response = await ProductsService.getAll(currentFilters)
        setProducts(response.items)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedLoadProducts = useCallback(
    debounce((filters: Filters) => {
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
    <div className="container py-8">
      <PageHeader
        title={t('all')}
        description="Browse our complete collection of products"
      />

      <div className="mb-8">
        <ProductFilters
          filters={filters}
          categories={categories}
          onFilterChange={handleFilterChange}
        />
      </div>

      <ProductGrid products={products} loading={loading} />
    </div>
  )
}
