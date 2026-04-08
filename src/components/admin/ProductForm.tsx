'use client'

import { useEffect, useState, KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Product, ProductCreateData, Category } from '@/types'
import { StorageService } from '@/services/storage.service'
import { CategoriesService } from '@/services/categories.service'

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  reference: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSubmit: (data: ProductCreateData) => Promise<void>
}

export function ProductForm({
  open,
  onOpenChange,
  product,
  onSubmit,
}: ProductFormProps) {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      images: [],
      reference: '',
      tags: [],
      isActive: true,
      featured: false,
    },
  })

  const imagesValue = watch('images')
  const featuredValue = watch('featured')
  const isActiveValue = watch('isActive')
  const categoryIdValue = watch('categoryId')
  const tagsValue = watch('tags') || []

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await CategoriesService.getAll()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        images: product.images,
        reference: product.reference || '',
        tags: product.tags || [],
        isActive: product.isActive ?? true,
        featured: product.featured || false,
      })
    } else {
      reset({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: '',
        images: [],
        reference: '',
        tags: [],
        isActive: true,
        featured: false,
      })
    }
    setTagInput('')
  }, [product, reset])

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data)
    onOpenChange(false)
    reset()
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const tempId = product?.id || `temp-${Date.now()}`
    return StorageService.uploadProductImage(file, tempId)
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tagsValue.includes(tag)) {
      setValue('tags', [...tagsValue, tag])
      setTagInput('')
    }
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tagsValue.filter(tag => tag !== tagToRemove))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-6xl !p-0 overflow-hidden"
        style={{
          width: '95vw',
          height: '95vh',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DialogHeader className="px-6 py-4 border-b" style={{ flexShrink: 0 }}>
          <DialogTitle>
            {product ? t('editProduct') : t('newProduct')}
          </DialogTitle>
        </DialogHeader>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <form id="product-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Active Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <Label htmlFor="isActive" className="text-base font-medium">
                {t('productActive')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('productActiveDescription')}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActiveValue}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>{t('productImages')}</Label>
            <ImageUpload
              value={imagesValue}
              onChange={(value) => setValue('images', value as string[])}
              onUpload={handleImageUpload}
              multiple
              maxImages={5}
            />
            {errors.images && (
              <p className="text-sm text-destructive">{errors.images.message}</p>
            )}
          </div>

          {/* Title and Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('productTitle')}</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">{t('productReference')}</Label>
              <Input
                id="reference"
                {...register('reference')}
                placeholder="SKU-001"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('productDescription')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter product description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('productPrice')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">{t('productStock')}</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-sm text-destructive">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('productCategory')}</Label>
            <Select
              value={categoryIdValue}
              onValueChange={(value) => setValue('categoryId', value)}
              disabled={loadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>{t('productTags')}</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={t('addTag')}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tagsValue.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tagsValue.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Featured */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={featuredValue}
                onCheckedChange={(checked) => setValue('featured', !!checked)}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                {t('productFeatured')}
              </Label>
            </div>
          </form>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background" style={{ flexShrink: 0 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {product ? tCommon('update') : tCommon('create')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
