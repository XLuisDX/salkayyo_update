'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Category, CategoryCreateData } from '@/types'
import { StorageService } from '@/services/storage.service'

function createCategorySchema(tv: ReturnType<typeof useTranslations>) {
  return z.object({
    name: z.string().min(1, tv('required')),
    slug: z.string().min(1, tv('required')),
    description: z.string().optional(),
    image: z.string().optional(),
  })
}

type CategoryFormData = z.infer<ReturnType<typeof createCategorySchema>>

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSubmit: (data: CategoryCreateData) => Promise<void>
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CategoryForm({
  open,
  onOpenChange,
  category,
  onSubmit,
}: CategoryFormProps) {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const tv = useTranslations('validation')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(createCategorySchema(tv)),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image: '',
    },
  })

  const nameValue = watch('name')
  const imageValue = watch('image')

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
      })
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        image: '',
      })
    }
  }, [category, reset])

  useEffect(() => {
    if (!category && nameValue) {
      setValue('slug', generateSlug(nameValue))
    }
  }, [nameValue, category, setValue])

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data)
    onOpenChange(false)
    reset()
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const tempId = category?.id || `temp-${Date.now()}`
    return StorageService.uploadCategoryImage(file, tempId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {category ? t('editCategory') : t('newCategory')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Image */}
          <div className="space-y-2">
            <Label>{t('categoryImage')}</Label>
            <ImageUpload
              value={imageValue || ''}
              onChange={(value) => setValue('image', value as string)}
              onUpload={handleImageUpload}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('categoryName')}</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('enterCategoryNamePlaceholder')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">{t('categorySlug')}</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="category-slug"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('categoryDescription')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('enterCategoryDescriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {category ? tCommon('update') : tCommon('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
