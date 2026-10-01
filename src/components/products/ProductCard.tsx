'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Check, Eye } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const t = useTranslations('products')
  const tWishlist = useTranslations('wishlist')
  const { addToCart, isInCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const isLiked = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    toast.success(t('addedToCart') || 'Added to cart')
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
    toast.success(isLiked ? tWishlist('removed') : tWishlist('added'))
  }

  const inCart = isInCart(product.id)
  const isOutOfStock = product.stock <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <div
        className="group relative h-full flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-500 card-hover"
      >
        {/* Image Container - Clickable */}
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-4xl font-bold text-muted-foreground/20">
                  {product.title.charAt(0)}
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isOutOfStock && (
                <Badge className="bg-destructive/90 text-destructive-foreground backdrop-blur-sm px-3 py-1 text-xs font-medium">
                  {t("outOfStock")}
                </Badge>
              )}
              {product.featured && !isOutOfStock && (
                <Badge className="bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
                  {t("featured")}
                </Badge>
              )}
            </div>
          </div>
        </Link>

        {/* Like Button */}
        <motion.button
          onClick={handleLike}
          className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white dark:hover:bg-black/70 z-10"
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isLiked ? "fill-red-500 text-red-500" : "text-foreground/70"
            }`}
          />
        </motion.button>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-accent transition-colors duration-300 mb-2">
              {product.title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed min-h-[2.875rem]">
            {product.description}
          </p>

          <div className="flex items-center justify-between mb-4 mt-auto">
            <span className="text-xl font-bold">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-lg text-sm font-medium gap-2 px-2 sm:px-4"
              asChild
            >
              <Link href={`/products/${product.id}`}>
                <Eye className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t("viewDetails")}</span>
              </Link>
            </Button>
            <Button
              onClick={handleAddToCart}
              className="flex-1 h-10 rounded-lg text-sm font-medium gap-2 px-2 sm:px-4"
              disabled={inCart || isOutOfStock}
            >
              {inCart ? (
                <>
                  <Check className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{t("inCart")}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{t("addToCart")}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
