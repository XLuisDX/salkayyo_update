'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Package, ChevronRight } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Order } from '@/types'
import { OrdersService } from '@/services/orders.service'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function OrdersPage() {
  const t = useTranslations('orders')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders')
      return
    }

    const loadOrders = async () => {
      if (!user) return
      try {
        const data = await OrdersService.getByUserId(user.id)
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadOrders()
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return <Loading />
  }

  if (!user) {
    return <Loading />
  }

  return (
    <div className="container py-8">
      <PageHeader
        title={t('title')}
        description="View and track your orders"
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t('noOrders')}
          description="Start shopping to see your orders here"
          action={
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/orders/${order.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            {t('orderNumber', { id: order.id.slice(0, 8) })}
                          </h3>
                          <Badge className={statusColors[order.status]}>
                            {t(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('date')}: {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} {t('items')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{t('total')}</p>
                          <p className="text-xl font-bold">{formatPrice(order.total)}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
