'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, Shield, Truck } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export function CartSummary() {
  const t = useTranslations('cart')
  const { cart, getItemCount } = useCart()

  const itemCount = getItemCount()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-card rounded-2xl border border-border p-6 sticky top-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{t('title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('itemCount', { count: itemCount })}
            </p>
          </div>
        </div>

        {/* Pricing Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('subtotal')}</span>
            <span className="font-medium">{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('tax')}</span>
            <span className="font-medium">{formatPrice(cart.tax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-accent font-medium">Free</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-4 mb-6 border-t border-b border-border">
          <span className="text-lg font-semibold">{t('total')}</span>
          <span className="text-2xl font-bold">{formatPrice(cart.total)}</span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/checkout" className="block">
            <Button
              className="w-full h-14 rounded-xl font-semibold bg-accent text-accent-foreground hover:bg-accent/90 btn-shine"
              size="lg"
              disabled={itemCount === 0}
            >
              {t('checkout')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/products" className="block">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl font-medium"
            >
              {t('continueShopping')}
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Fast shipping</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
