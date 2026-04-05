'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { CreditCard, Loader2 } from 'lucide-react'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Recipient, RecipientData } from '@/types'
import { RecipientsService } from '@/services/recipients.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import { RecipientSelector } from './RecipientSelector'


export function CheckoutForm() {
  const t = useTranslations('checkout')
  const tCart = useTranslations('cart')
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [loading, setLoading] = useState(false)
  const [loadingRecipients, setLoadingRecipients] = useState(true)

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

  const getRecipientData = (): RecipientData | null => {
    if (!selectedRecipient) return null
    return {
      fullName: selectedRecipient.fullName,
      address: selectedRecipient.address,
      city: selectedRecipient.city,
      state: selectedRecipient.state,
      zipCode: selectedRecipient.zipCode,
      country: selectedRecipient.country,
      phone: selectedRecipient.phone,
    }
  }

  const handleStripeCheckout = async () => {
    if (!user || !selectedRecipient) {
      toast.error('Please select a shipping address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          recipientData: getRecipientData(),
          userId: user.id,
        }),
      })

      const { checkoutUrl, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(t('orderFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handlePayPalApprove = async (data: any) => {
    if (!user || !selectedRecipient) return

    setLoading(true)

    try {
      const response = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderID,
          items: cart.items,
          recipientData: getRecipientData(),
          userId: user.id,
          total: cart.total,
        }),
      })

      const result = await response.json()

      if (result.success) {
        clearCart()
        toast.success(t('orderPlaced'))
        window.location.href = `/orders/${result.orderId}`
      } else {
        toast.error(t('orderFailed'))
      }
    } catch (error) {
      console.error('PayPal capture error:', error)
      toast.error(t('orderFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Please login to checkout</p>
        </CardContent>
      </Card>
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
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'paypal')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="stripe" id="stripe" />
              <Label htmlFor="stripe" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t('payWithStripe')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal">{t('payWithPayPal')}</Label>
            </div>
          </RadioGroup>

          <Separator />

          {paymentMethod === 'stripe' ? (
            <Button
              onClick={handleStripeCheckout}
              disabled={loading || !selectedRecipient || cart.items.length === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('placeOrder')
              )}
            </Button>
          ) : (
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                currency: 'USD',
              }}
            >
              <PayPalButtons
                disabled={!selectedRecipient || cart.items.length === 0}
                createOrder={async () => {
                  const response = await fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      total: cart.total,
                    }),
                  })
                  const data = await response.json()
                  return data.orderId
                }}
                onApprove={handlePayPalApprove}
                onError={(err) => {
                  console.error('PayPal error:', err)
                  toast.error(t('orderFailed'))
                }}
              />
            </PayPalScriptProvider>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
