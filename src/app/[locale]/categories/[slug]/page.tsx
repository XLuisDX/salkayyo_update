'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Category, Product } from '@/types'
import { CategoriesService } from '@/services/categories.service'
import { ProductsService } from '@/services/products.service'
import { ProductGrid } from '@/components/products/ProductGrid'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/common/Loading'
import { ArrowLeft } from 'lucide-react'

export default function CategoryPage() {
  const params = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categoryData = await CategoriesService.getBySlug(params.slug as string)
        setCategory(categoryData)

        if (categoryData) {
          const productsData = await ProductsService.getByCategory(categoryData.id)
          setProducts(productsData)
        }
      } catch (error) {
        console.error('Error loading category:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      loadCategory()
    }
  }, [params.slug])

  if (loading) {
    return <Loading />
  }

  if (!category) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Link href="/categories">
          <Button>Back to Categories</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Link href="/categories">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </Button>
      </Link>

      <PageHeader
        title={category.name}
        description={category.description || `Browse all products in ${category.name}`}
      />

      <ProductGrid products={products} />
    </div>
  )
}
