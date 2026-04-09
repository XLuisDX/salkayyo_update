'use client'

import { useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  onUpload: (file: File) => Promise<string>
  multiple?: boolean
  maxImages?: number
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  multiple = false,
  maxImages = 5,
  className,
}: ImageUploadProps) {
  const t = useTranslations('admin')
  const [isUploading, setIsUploading] = useState(false)

  const images = useMemo(
    () => Array.isArray(value) ? value : value ? [value] : [],
    [value]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const filesToUpload = multiple
        ? acceptedFiles.slice(0, maxImages - images.length)
        : [acceptedFiles[0]]

      if (filesToUpload.length === 0) {
        toast.error(t('maxImages', { max: maxImages }))
        return
      }

      setIsUploading(true)

      try {
        const uploadedUrls: string[] = []

        for (const file of filesToUpload) {
          const url = await onUpload(file)
          uploadedUrls.push(url)
        }

        if (multiple) {
          onChange([...images, ...uploadedUrls])
        } else {
          onChange(uploadedUrls[0])
        }

        toast.success(t('imageUploadSuccess'))
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(t('imageUploadError'))
      } finally {
        setIsUploading(false)
      }
    },
    [images, maxImages, multiple, onChange, onUpload, t]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: multiple ? maxImages - images.length : 1,
    disabled: isUploading || (multiple && images.length >= maxImages),
  })

  const removeImage = (indexOrUrl: number | string) => {
    if (multiple) {
      const newImages = images.filter((_, i) =>
        typeof indexOrUrl === 'number' ? i !== indexOrUrl : true
      )
      onChange(newImages)
    } else {
      onChange('')
    }
  }

  const canUploadMore = multiple ? images.length < maxImages : images.length === 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-accent bg-accent/5'
              : 'border-muted-foreground/25 hover:border-accent/50 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">{t('imageUploading')}</p>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {multiple ? t('dragDropImages') : t('dragDropImage')}
                  </p>
                  {multiple && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('maxImages', { max: maxImages })} ({images.length}/{maxImages})
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Preview */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'grid gap-4',
              multiple ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'
            )}
          >
            {images.map((url, index) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden border bg-muted group"
              >
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {multiple && (
                  <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{index + 1}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
