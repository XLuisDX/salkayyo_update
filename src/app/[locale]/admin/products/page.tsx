'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Package,
  ImageIcon,
  Star,
  Filter,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ProductForm } from '@/components/admin/ProductForm'
import { ProductsService } from '@/services/products.service'
import { CategoriesService } from '@/services/categories.service'
import { StorageService } from '@/services/storage.service'
import { Product, ProductCreateData, Category } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminProductsPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const tProducts = useTranslations('products')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        ProductsService.getAll({ limit: 100 }),
        CategoriesService.getAll(),
      ])
      setProducts(productsData.items)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(tCommon('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: ProductCreateData) => {
    try {
      const newProduct = await ProductsService.create(data)
      setProducts([newProduct, ...products])
      toast.success(t('productCreated'))
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(tCommon('error'))
      throw error
    }
  }

  const handleUpdate = async (data: ProductCreateData) => {
    if (!editingProduct) return

    try {
      await ProductsService.update(editingProduct.id, data)
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...p, ...data } : p
        )
      )
      setEditingProduct(null)
      toast.success(t('productUpdated'))
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(tCommon('error'))
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deleteProduct) return

    setIsDeleting(true)
    try {
      await StorageService.deleteProductImages(deleteProduct.id)
      await ProductsService.delete(deleteProduct.id)
      setProducts(products.filter((p) => p.id !== deleteProduct.id))
      setDeleteProduct(null)
      toast.success(t('productDeleted'))
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error(tCommon('error'))
    } finally {
      setIsDeleting(false)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || product.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold"
          >
            {t('manageProducts')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            {products.length} {t('products').toLowerCase()}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addProduct')}
          </Button>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchProducts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t('allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-card border"
        >
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">{t('noProducts')}</h3>
          <p className="text-muted-foreground mt-1 text-sm max-w-xs">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try a different search or filter'
              : 'Create your first product to get started'}
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <Button onClick={() => setFormOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              {t('addProduct')}
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                    {t('productImages')}
                  </th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                    {t('productTitle')}
                  </th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden md:table-cell">
                    {t('productCategory')}
                  </th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden lg:table-cell">
                    {t('productPrice')}
                  </th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden sm:table-cell">
                    {t('productStock')}
                  </th>
                  <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden xl:table-cell">
                    {t('productFeatured')}
                  </th>
                  <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    {/* Image */}
                    <td className="p-4">
                      <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden relative">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="p-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[200px]">{product.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                          {product.description}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm text-muted-foreground">
                        {getCategoryName(product.categoryId)}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="p-4 hidden lg:table-cell">
                      <p className="font-semibold">${product.price.toFixed(2)}</p>
                    </td>

                    {/* Stock */}
                    <td className="p-4 hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          product.stock > 10
                            ? 'text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800'
                            : product.stock > 0
                            ? 'text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800'
                            : 'text-red-600 border-red-200 dark:text-red-400 dark:border-red-800'
                        )}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </Badge>
                    </td>

                    {/* Featured */}
                    <td className="p-4 hidden xl:table-cell">
                      {product.featured ? (
                        <Badge className="bg-amber-500 text-white text-xs px-2 py-0.5 gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingProduct(product)
                            setFormOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Create/Edit Form */}
      <ProductForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteProduct')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteProduct')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
