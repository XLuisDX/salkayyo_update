'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Package,
  FolderTree,
  ShoppingCart,
  DollarSign,
  Plus,
  ArrowUpRight,
  Clock,
  Loader2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductsService } from '@/services/products.service'
import { CategoriesService } from '@/services/categories.service'
import { OrdersService } from '@/services/orders.service'
import { Order, OrderStatus, Product } from '@/types'
import { cn, formatPrice } from '@/lib/utils'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalRevenue: number
  recentOrders: Order[]
  lowStockProducts: Product[]
  salesByDay: { label: string; revenue: number }[]
}

const REVENUE_STATUSES: OrderStatus[] = ['paid', 'shipped', 'delivered']
const LOW_STOCK_THRESHOLD = 5
const SALES_CHART_DAYS = 14

const statusConfig: Record<OrderStatus, { color: string; bg: string }> = {
  pending: { color: "text-amber-500", bg: "bg-amber-500/10" },
  paid: { color: "text-blue-500", bg: "bg-blue-500/10" },
  shipped: { color: "text-violet-500", bg: "bg-violet-500/10" },
  delivered: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
  cancelled: { color: "text-red-500", bg: "bg-red-500/10" },
};

function buildSalesByDay(orders: Order[], locale: string) {
  const days: { key: string; label: string; revenue: number }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = SALES_CHART_DAYS - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    days.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
      revenue: 0,
    })
  }

  const byKey = new Map(days.map((d) => [d.key, d]))

  for (const order of orders) {
    if (!REVENUE_STATUSES.includes(order.status)) continue
    const key = order.createdAt.toISOString().slice(0, 10)
    const bucket = byKey.get(key)
    if (bucket) bucket.revenue += order.total
  }

  return days.map(({ label, revenue }) => ({ label, revenue }))
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin')
  const tOrders = useTranslations('orders')
  const locale = useLocale()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [products, categories, allOrders] = await Promise.all([
          ProductsService.getAll({ limit: 1000 }),
          CategoriesService.getAll(),
          OrdersService.getAll(),
        ])

        const totalRevenue = allOrders
          .filter((o) => REVENUE_STATUSES.includes(o.status))
          .reduce((sum, o) => sum + o.total, 0)

        const lowStockProducts = products.items
          .filter((p) => p.isActive !== false && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5)

        setStats({
          totalProducts: products.total,
          totalCategories: categories.length,
          totalOrders: allOrders.length,
          totalRevenue,
          recentOrders: allOrders.slice(0, 5),
          lowStockProducts,
          salesByDay: buildSalesByDay(allOrders, locale),
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [locale])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statCards = [
    {
      title: t("totalRevenue"),
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      href: "/admin/orders",
    },
    {
      title: t("totalOrders"),
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      href: "/admin/orders",
    },
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Sales chart + Low stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 rounded-2xl border bg-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-medium">{t("salesOverview")}</h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.salesByDay ?? []} margin={{ left: -20, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.ceil(SALES_CHART_DAYS / 7)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                  tickFormatter={(value: number) => formatPrice(value)}
                />
                <Tooltip
                  formatter={(value) => [formatPrice(Number(value)), t('totalRevenue')]}
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border bg-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-md bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <h2 className="text-sm font-medium">{t("lowStockProducts")}</h2>
          </div>

          {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground mb-3">
                {t('lowStockAlert', { count: stats.lowStockProducts.length })}
              </p>
              {stats.lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href="/admin/products"
                  className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition"
                >
                  <span className="text-sm truncate flex-1">{product.title}</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none rounded-full">
                    {product.stock}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('noLowStock')}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border bg-card"
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-medium">{t("recentOrders")}</h2>
          </div>
          <Link href="/admin/orders">
            <Button size="sm" variant="ghost" className="gap-1 text-xs">
              {t('viewAllOrders')}
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="divide-y">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order, index) => (
              <Link key={order.id} href="/admin/orders">
                <motion.div
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
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} {tOrders('items')}
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
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <ShoppingCart className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('noOrdersYet')}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
