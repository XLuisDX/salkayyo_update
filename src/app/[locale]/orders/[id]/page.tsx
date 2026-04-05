'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Package, MapPin, CreditCard, ArrowLeft, Check } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Order } from '@/types'
import { OrdersService } from '@/services/orders.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Loading } from '@/components/common/Loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice, formatDate } from '@/lib/utils'

const statusSteps = ['pending', 'paid', 'shipped', 'delivered']

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function OrderDetailPage() {
  const params = useParams()
  const t = useTranslations('orders')
  const tCart = useTranslations('cart')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    const loadOrder = async () => {
      try {
        const data = await OrdersService.getById(params.id as string)
        setOrder(data)
      } catch (error) {
        console.error('Error loading order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && params.id) {
      loadOrder()
    }
  }, [user, authLoading, params.id, router])

  if (authLoading || loading) {
    return <Loading />
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Link href="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    )
  }

  const currentStepIndex = statusSteps.indexOf(order.status)

  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/orders">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </Link>

      <PageHeader
        title={t('orderNumber', { id: order.id.slice(0, 8) })}
        action={
          <Badge className={statusColors[order.status]}>
            {t(order.status)}
          </Badge>
        }
      />

      <div className="space-y-6">
        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('trackOrder')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index <= currentStepIndex
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index < currentStepIndex ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className="text-sm mt-2 text-center">{t(step)}</span>
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`h-1 w-16 md:w-24 mx-2 ${
                          index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('items')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </motion.div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{tCart('subtotal')}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{tCart('tax')}</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{tCart('total')}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.recipientData.fullName}</p>
                <p className="text-muted-foreground">{order.recipientData.address}</p>
                <p className="text-muted-foreground">
                  {order.recipientData.city}, {order.recipientData.state}{' '}
                  {order.recipientData.zipCode}
                </p>
                <p className="text-muted-foreground">{order.recipientData.country}</p>
                <p className="text-muted-foreground mt-2">{order.recipientData.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-medium text-sm">{order.paymentId?.slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('date')}</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
