'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Package,
  FolderTree,
  ShoppingCart,
  Plus,
  ArrowUpRight,
  Clock,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductsService } from '@/services/products.service'
import { CategoriesService } from '@/services/categories.service'
import { OrdersService } from '@/services/orders.service'
import { Order, OrderStatus } from '@/types'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  recentOrders: Order[]
}

const statusConfig: Record<OrderStatus, { color: string; bg: string }> = {
  pending: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  paid: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  shipped: { color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
  delivered: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  cancelled: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin')
  const tOrders = useTranslations('orders')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, categories, orders] = await Promise.all([
          ProductsService.getAll(),
          CategoriesService.getAll(),
          OrdersService.getRecentOrders(5),
        ])

        const allOrders = await OrdersService.getAll()

        setStats({
          totalProducts: products.total,
          totalCategories: categories.length,
          totalOrders: allOrders.length,
          recentOrders: orders,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statCards = [
    {
      title: t('totalProducts'),
      value: stats?.totalProducts ?? 0,
      icon: Package,
      href: '/admin/products',
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
    },
    {
      title: t('totalCategories'),
      value: stats?.totalCategories ?? 0,
      icon: FolderTree,
      href: '/admin/categories',
      gradient: 'from-violet-500/20 to-violet-600/5',
      iconColor: 'text-violet-500',
      iconBg: 'bg-violet-500/10',
    },
    {
      title: t('totalOrders'),
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      href: '/admin',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-bold"
          >
            {t('welcome')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            {t('overview')}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <Link href="/admin/products">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('addProduct')}</span>
              <span className="sm:hidden">Product</span>
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('addCategory')}</span>
              <span className="sm:hidden">Category</span>
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={card.href}>
                <div className={cn(
                  'relative overflow-hidden rounded-2xl bg-card border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group'
                )}>
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', card.gradient)} />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                        <p className="text-3xl font-bold mt-2">{card.value}</p>
                      </div>
                      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', card.iconBg)}>
                        <Icon className={cn('h-5 w-5', card.iconColor)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="group-hover:underline">View all</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="rounded-2xl bg-card border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">{t('recentOrders')}</h2>
                <p className="text-xs text-muted-foreground">Latest 5 orders</p>
              </div>
            </div>
          </div>

          <div className="divide-y">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        {order.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-sm">${order.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <Badge className={cn(
                      'capitalize text-xs',
                      statusConfig[order.status].bg,
                      statusConfig[order.status].color
                    )}>
                      {tOrders(order.status)}
                    </Badge>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
