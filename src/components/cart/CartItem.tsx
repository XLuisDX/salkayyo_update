'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { CartItem as CartItemType } from '@/types'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const t = useTranslations('cart')
  const { updateQuantity, removeFromCart } = useCart()

  const handleIncrement = () => {
    if (item.quantity < item.product.stock) {
      updateQuantity(item.product.id, item.quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1)
    }
  }

  const handleRemove = () => {
    removeFromCart(item.product.id)
    toast.success(t('removedFromCart'))
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-5 p-5 rounded-2xl bg-card border border-border hover:border-border/80 transition-colors"
    >
      {/* Product Image */}
      <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        {item.product.images && item.product.images.length > 0 ? (
          <Image
            src={item.product.images[0]}
            alt={item.product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-2xl font-bold text-muted-foreground/30">
              {item.product.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-1">{item.product.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatPrice(item.product.price)} each
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted/50 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-background"
              onClick={handleDecrement}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-background"
              onClick={handleIncrement}
              disabled={item.quantity >= item.product.stock}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Total Price */}
          <span className="text-lg font-bold">
            {formatPrice(item.product.price * item.quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
