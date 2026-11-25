'use client'

import { useState, useEffect, useRef, useCallback, type ComponentProps } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Loader2, ShoppingCart } from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Recipient } from '@/types'
import { auth } from '@/firebase/config'
import { Link, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { RecipientsService } from '@/services/recipients.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { RecipientSelector } from './RecipientSelector'

type ApproveHandler = NonNullable<ComponentProps<typeof PayPalButtons>['onApprove']>

/** Server error codes that mean "the cart no longer matches the catalog". */
const CART_ERRORS = new Set(['CART_CHANGED', 'OUT_OF_STOCK'])

class CheckoutRequestError extends Error {
  constructor(readonly code?: string) {
    super(code ?? 'Checkout unavailable')
  }
}

export function CheckoutForm() {
  const t = useTranslations('checkout')
  const tCart = useTranslations('cart')
  const { cart, clearCart, isReady: cartReady, syncWithCatalog } = useCart()
  const { user } = useAuth()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const router = useRouter()
  const checkout = useRef<{ orderId: string; checkoutId: string } | null>(null)
  // Set when we already told the buyer what went wrong, so the PayPal
  // onError callback does not stack a generic "order failed" toast on top.
  const errorHandled = useRef(false)
  const [loading, setLoading] = useState(false)
  const [loadingRecipients, setLoadingRecipients] = useState(true)
  const [catalogSynced, setCatalogSynced] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(true)
  const [paymentUnconfirmed, setPaymentUnconfirmed] = useState(false)

  const checkPayment = useCallback(async (signal?: AbortSignal) => {
    if (!user || auth.currentUser?.uid !== user.id) return
    setCheckingPayment(true)
    try {
      const token = await auth.currentUser.getIdToken()
      const response = await fetch('/api/paypal/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ checkoutId: checkout.current?.checkoutId, resume: !signal }),
        signal,
      })
      const result = await response.json()
      if (signal?.aborted) return
      if (result.code === 'INSTRUMENT_DECLINED') {
        checkout.current = null
        setPaymentUnconfirmed(false)
        toast.error(t('paymentDeclined'))
        return
      }
      if (!response.ok) throw new Error('Could not verify PayPal status')
      setPaymentUnconfirmed(result.status === 'pending')
      if (result.status === 'paid') {
        if (checkout.current) clearCart()
        toast.success(t('orderPlaced'))
        router.push(`/orders/${result.orderId}`)
      } else if (result.status === 'failed') {
        toast.error(t('paymentDeclined'))
      }
      if (result.status !== 'pending') checkout.current = null
    } catch {
      if (!signal?.aborted) setPaymentUnconfirmed(true)
    } finally {
      if (!signal?.aborted) setCheckingPayment(false)
    }
  }, [user, clearCart, router, t])

  useEffect(() => {
    const controller = new AbortController()
    void checkPayment(controller.signal)
    return () => controller.abort()
  }, [checkPayment])

  useEffect(() => {
    const loadRecipients = async () => {
      if (!user) return
      try {
        const data = await RecipientsService.getByUserId(user.id)
        setRecipients(data)
        const defaultRecipient = data.find((r) => r.isDefault) || data[0]
        if (defaultRecipient) {
          setSelectedRecipient(defaultRecipient)
        }
      } catch (error) {
        console.error('Error loading recipients:', error)
      } finally {
        setLoadingRecipients(false)
      }
    }

    loadRecipients()
  }, [user])

  // Refresh prices/stock before showing the PayPal button, so the amount the
  // buyer approves matches what the server will charge.
  useEffect(() => {
    if (!cartReady) return
    let cancelled = false
    syncWithCatalog()
      .then((changed) => {
        if (changed && !cancelled) toast.info(t('cartUpdated'))
      })
      .catch((error) => console.error('Error refreshing cart:', error))
      .finally(() => {
        if (!cancelled) setCatalogSynced(true)
      })
    return () => {
      cancelled = true
    }
  }, [cartReady, syncWithCatalog, t])

  const resyncCart = async () => {
    errorHandled.current = true
    await syncWithCatalog().catch((error) => console.error('Error refreshing cart:', error))
    toast.warning(t('cartUpdated'))
  }

  const createPayPalOrder = async () => {
    errorHandled.current = false
    if (!selectedRecipient || !auth.currentUser) throw new CheckoutRequestError()
    const token = await auth.currentUser.getIdToken()
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        recipientId: selectedRecipient.id,
        items: cart.items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        expectedTotalCents: Math.round(cart.total * 100),
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.orderId || !data.checkoutId) {
      if (data.code === 'PAYMENT_PENDING') {
        checkout.current = null
        errorHandled.current = true
        setPaymentUnconfirmed(true)
      }
      if (CART_ERRORS.has(data.code)) await resyncCart()
      throw new CheckoutRequestError(data.code)
    }
    checkout.current = { orderId: data.orderId, checkoutId: data.checkoutId }
    return data.orderId as string
  }

  const handlePayPalApprove: ApproveHandler = async ({ orderID }, actions) => {
    const payment = checkout.current
    if (!auth.currentUser || !payment || payment.orderId !== orderID) return
    setLoading(true)
    try {
      const token = await auth.currentUser.getIdToken()
      const response = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payment),
      })
      const result = await response.json().catch(() => ({}))

      if (response.ok && result.status === 'paid') {
        clearCart()
        toast.success(t('orderPlaced'))
        router.push(`/orders/${result.orderId}`)
        return
      }
      if (response.ok && result.status === 'pending') {
        setPaymentUnconfirmed(true)
        return
      }
      if (result.code === 'INSTRUMENT_DECLINED') {
        // Let the buyer pick another card/funding source in the same PayPal window.
        return actions.restart()
      }
      if (CART_ERRORS.has(result.code)) {
        await resyncCart()
        return
      }
      if (response.status === 401 || response.status === 403 || response.status === 404 ||
          result.code === 'PAYMENT_DECLINED' || result.code === 'NOT_APPROVED' || response.status === 422) {
        // Nothing was charged.
        const reference = [result.code, result.debugId].filter(Boolean).join(' · ')
        toast.error(t('paymentDeclined'), { description: reference || undefined })
        return
      }
      // Unknown outcome (network error, needs review): money may have been taken.
      setPaymentUnconfirmed(true)
    } catch {
      setPaymentUnconfirmed(true)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t('loginRequired')}</p>
        </CardContent>
      </Card>
    )
  }

  if (checkingPayment || paymentUnconfirmed) {
    return (
      <Card>
        <CardContent className="space-y-4 py-6">
          <p role="status">{t(checkingPayment ? 'checkingPayment' : 'paymentPending')}</p>
          <Button disabled={checkingPayment} onClick={() => void checkPayment()}>{t('checkPayment')}</Button>
        </CardContent>
      </Card>
    )
  }

  if (cartReady && cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title={tCart('empty')}
        description={t('emptyCartDescription')}
        action={<Link href="/products"><Button>{tCart('continueShopping')}</Button></Link>}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('shippingInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecipientSelector
            recipients={recipients}
            selectedRecipient={selectedRecipient}
            onSelect={setSelectedRecipient}
            loading={loadingRecipients}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('orderSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>
                {item.product.title} x {item.quantity}
              </span>
              <span>{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span>{tCart('subtotal')}</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{tCart('tax')}</span>
            <span>{formatPrice(cart.tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>{tCart('total')}</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('paymentMethod')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
            <p role="status">{t('orderFailed')}</p>
          ) : !catalogSynced ? (
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {t('checkingCart')}
            </p>
          ) : (
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: 'USD' }}>
              <PayPalButtons
                disabled={loading || !selectedRecipient || cart.items.length === 0}
                createOrder={createPayPalOrder}
                onApprove={handlePayPalApprove}
                onError={(error) => {
                  if (errorHandled.current) {
                    errorHandled.current = false
                    return
                  }
                  console.error('PayPal checkout error:', error)
                  toast.error(t('orderFailed'))
                }}
              />
              {loading && <p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" />{t('processing')}</p>}
            </PayPalScriptProvider>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
