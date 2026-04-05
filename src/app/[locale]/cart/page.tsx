'use client'

import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useCart } from '@/context/CartContext'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const t = useTranslations('cart')
  const { cart, clearCart, getItemCount } = useCart()

  const itemCount = getItemCount()

  if (itemCount === 0) {
    return (
      <div className="container py-8">
        <PageHeader title={t('title')} />
        <EmptyState
          icon={ShoppingCart}
          title={t('empty')}
          description="Add some products to your cart to see them here"
          action={
            <Link href="/products">
              <Button>{t('continueShopping')}</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <PageHeader
        title={t('title')}
        action={
          <Button variant="outline" onClick={clearCart} className="gap-2">
            <Trash2 className="h-4 w-4" />
            {t('clearCart')}
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="popLayout">
            <motion.div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
