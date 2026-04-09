'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  FolderTree,
  ImageIcon,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { CategoryForm } from '@/components/admin/CategoryForm'
import { CategoriesService } from '@/services/categories.service'
import { Category, CategoryCreateData } from '@/types'
import { toast } from 'sonner'

export default function AdminCategoriesPage() {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const data = await CategoriesService.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error(tCommon('error'))
    } finally {
      setLoading(false)
    }
  }, [tCommon])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = async (data: CategoryCreateData) => {
    try {
      const newCategory = await CategoriesService.create(data)
      setCategories([...categories, newCategory])
      toast.success(t('categoryCreated'))
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error(tCommon('error'))
      throw error
    }
  }

  const handleUpdate = async (data: CategoryCreateData) => {
    if (!editingCategory) return

    try {
      await CategoriesService.update(editingCategory.id, data)
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? { ...c, ...data } : c
        )
      )
      setEditingCategory(null)
      toast.success(t('categoryUpdated'))
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error(tCommon('error'))
      throw error
    }
  }

  const handleDelete = async () => {
    if (!deleteCategory) return

    setIsDeleting(true)
    try {
      await CategoriesService.delete(deleteCategory.id)
      setCategories(categories.filter((c) => c.id !== deleteCategory.id))
      setDeleteCategory(null)
      toast.success(t('categoryDeleted'))
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(tCommon('error'))
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            {t('manageCategories')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            {categories.length} {t('categories').toLowerCase()}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('addCategory')}
          </Button>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-sm"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchCategories')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-card"
        />
      </motion.div>

      {/* Categories Table */}
      {filteredCategories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-card border"
        >
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderTree className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">{t('noCategories')}</h3>
          <p className="text-muted-foreground mt-1 text-sm max-w-xs">
            {searchTerm ? 'Try a different search term' : 'Create your first category to get started'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setFormOpen(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              {t('addCategory')}
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
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  {t('categoryImage')}
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                  {t('categoryName')}
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden md:table-cell">
                  {t('categorySlug')}
                </th>
                <th className="text-left p-4 font-medium text-sm text-muted-foreground hidden lg:table-cell">
                  {t('categoryDescription')}
                </th>
                <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCategories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {/* Image */}
                  <td className="p-4">
                    <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden relative">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
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

                  {/* Name */}
                  <td className="p-4">
                    <p className="font-medium">{category.name}</p>
                  </td>

                  {/* Slug */}
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                  </td>

                  {/* Description */}
                  <td className="p-4 hidden lg:table-cell">
                    <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                      {category.description || '-'}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditingCategory(category)
                          setFormOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Create/Edit Form */}
      <CategoryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingCategory(null)
        }}
        category={editingCategory}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCategory')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteCategory')}
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
