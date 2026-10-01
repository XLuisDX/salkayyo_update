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
import { toast } from 'sonner'

export default function CheckoutPage() {
  const t = useTranslations('checkout')
  const tCart = useTranslations('cart')
  const tAuth = useTranslations('auth')
  const router = useRouter()
  const { user, firebaseUser, loading: authLoading } = useAuth()
  const { getItemCount } = useCart()

  const itemCount = getItemCount()
  const isVerified = user?.verified || firebaseUser?.emailVerified

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login?redirect=/checkout')
      return
    }

    if (!isVerified) {
      toast.error(tAuth('emailNotVerified'))
      router.push('/verify-email')
    }
  }, [user, isVerified, authLoading, router, tAuth])

  if (authLoading || !user || !isVerified) {
    return <Loading />
  }

  if (itemCount === 0) {
    return (
      <div className="container py-8">
        <PageHeader title={t('title')} />
        <EmptyState
          icon={ShoppingCart}
          title={tCart('empty')}
          description={t('emptyCartDescription')}
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
