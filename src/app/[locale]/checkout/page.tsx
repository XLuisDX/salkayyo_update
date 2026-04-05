'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const tCart = useTranslations('cart')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { getItemCount } = useCart()

  const itemCount = getItemCount()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <Loading />
  }

  if (!user) {
    return <Loading />
  }

  if (itemCount === 0) {
    return (
      <div className="container py-8">
        <PageHeader title={t('title')} />
        <EmptyState
          icon={ShoppingCart}
          title={tCart('empty')}
          description="Add some products to your cart to checkout"
          action={
            <Link href="/products">
              <Button>{tCart('continueShopping')}</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <PageHeader title={t('title')} />
      <CheckoutForm />
    </div>
  )
}
