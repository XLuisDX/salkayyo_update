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
  pending: { color: "text-amber-500", bg: "bg-amber-500/10" },
  paid: { color: "text-blue-500", bg: "bg-blue-500/10" },
  shipped: { color: "text-violet-500", bg: "bg-violet-500/10" },
  delivered: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  cancelled: { color: "text-red-500", bg: "bg-red-500/10" },
};

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
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statCards = [
    {
      title: t("totalProducts"),
      value: stats?.totalProducts ?? 0,
      icon: Package,
      href: "/admin/products",
    },
    {
      title: t("totalCategories"),
      value: stats?.totalCategories ?? 0,
      icon: FolderTree,
      href: "/admin/categories",
    },
    {
      title: t("totalOrders"),
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      href: "/admin",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-semibold tracking-tight"
          >
            {t("welcome")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm mt-1"
          >
            {t("overview")}
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
              {t("addProduct")}
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addCategory")}
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={card.href}>
                <div className="group rounded-2xl border bg-card p-5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-2xl font-semibold mt-1">
                        {card.value}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <span>View</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border bg-card"
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-medium">{t("recentOrders")}</h2>
          </div>
        </div>

        <div className="divide-y">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-xs font-medium">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      #{order.id.slice(0, 8)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {order.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} items
                    </p>
                  </div>

                  <Badge
                    className={cn(
                      "text-xs capitalize border-0",
                      statusConfig[order.status].bg,
                      statusConfig[order.status].color,
                    )}
                  >
                    {tOrders(order.status)}
                  </Badge>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <ShoppingCart className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
