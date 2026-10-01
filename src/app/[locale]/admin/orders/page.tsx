'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { Search, Loader2, ShoppingCart, Clock, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { OrdersService } from '@/services/orders.service'
import { Order, OrderStatus } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

const statusConfig: Record<OrderStatus, { color: string; bg: string }> = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  paid: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
  shipped: { color: 'text-violet-500', bg: 'bg-violet-500/10' },
  delivered: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  cancelled: { color: 'text-red-500', bg: 'bg-red-500/10' },
}

export default function AdminOrdersPage() {
  const t = useTranslations('admin')
  const tOrders = useTranslations('orders')
  const tCommon = useTranslations('common')

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)

  const fetchOrders = useCallback(
    async (status: OrderStatus | 'all') => {
      setLoading(true)
      cursorRef.current = null
      try {
        const page = status === 'all'
          ? await OrdersService.getAll()
          : await OrdersService.getByStatus(status)
        setOrders(page.items)
        setHasMore(page.hasMore)
        setTotalCount(page.total)
        cursorRef.current = page.nextCursor
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error(tCommon('error'))
      } finally {
        setLoading(false)
      }
    },
    [tCommon]
  )

  const loadMoreOrders = useCallback(async () => {
    if (!cursorRef.current || loadingMore) return

    setLoadingMore(true)
    try {
      const page = statusFilter === 'all'
        ? await OrdersService.getAll(cursorRef.current)
        : await OrdersService.getByStatus(statusFilter, cursorRef.current)
      setOrders((prev) => [...prev, ...page.items])
      setHasMore(page.hasMore)
      cursorRef.current = page.nextCursor
    } catch (error) {
      console.error('Error loading more orders:', error)
      toast.error(tCommon('error'))
    } finally {
      setLoadingMore(false)
    }
  }, [statusFilter, loadingMore, tCommon])

  useEffect(() => {
    fetchOrders(statusFilter)
  }, [fetchOrders, statusFilter])

  const openOrder = (order: Order) => {
    setSelectedOrder(order)
    setPendingStatus(order.status)
  }

  const handleSaveStatus = async () => {
    if (!selectedOrder || !pendingStatus || pendingStatus === selectedOrder.status) {
      setSelectedOrder(null)
      return
    }

    setIsSaving(true)
    try {
      await OrdersService.updateStatus(selectedOrder.id, pendingStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: pendingStatus } : o))
      )
      toast.success(t('statusUpdated'))
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(tCommon('error'))
    } finally {
      setIsSaving(false)
    }
  }

  // Status filtering now happens server-side (see fetchOrders/loadMoreOrders).
  // Search is substring matching over whatever's currently loaded — Firestore
  // has no native text search, so "Load more" first if the order isn't found.
  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.trim().toLowerCase()
    return (
      !search ||
      order.id.toLowerCase().includes(search) ||
      order.recipientData?.fullName?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl lg:text-3xl font-semibold tracking-tight"
        >
          {t('manageOrders')}
        </motion.h1>
        <p className="text-muted-foreground text-sm mt-1">
          {orders.length < totalCount
            ? `${orders.length} / ${totalCount}`
            : totalCount} {t('orders').toLowerCase()}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchOrders')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {tOrders(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-card border border-dashed">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mb-4" />
          <h3 className="font-medium">{tOrders('noOrders')}</h3>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    {t('orderId')}
                  </th>
                  <th className="p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    {t('customer')}
                  </th>
                  <th className="p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    {tOrders('date')}
                  </th>
                  <th className="p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    {tOrders('total')}
                  </th>
                  <th className="p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="p-4 text-right font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <span className="text-sm font-medium">#{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{order.recipientData?.fullName || '—'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {order.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={cn(
                          'text-xs capitalize border-0',
                          statusConfig[order.status].bg,
                          statusConfig[order.status].color
                        )}
                      >
                        {tOrders(order.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openOrder(order)}>
                        {t('viewOrder')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasMore && !searchTerm.trim() && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMoreOrders} disabled={loadingMore}>
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('loading')}
              </>
            ) : (
              tCommon('loadMore')
            )}
          </Button>
        </div>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>#{selectedOrder.id.slice(0, 8)}</DialogTitle>
                <DialogDescription>{t('orderDetailsDescription')}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('status')}</span>
                  <Select
                    value={pendingStatus ?? selectedOrder.status}
                    onValueChange={(v) => setPendingStatus(v as OrderStatus)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {tOrders(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm font-medium">{tOrders('shippingAddress')}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.recipientData?.fullName}
                    <br />
                    {selectedOrder.recipientData?.address}, {selectedOrder.recipientData?.city}
                    <br />
                    {selectedOrder.recipientData?.state} {selectedOrder.recipientData?.zipCode},{' '}
                    {selectedOrder.recipientData?.country}
                    <br />
                    {selectedOrder.recipientData?.phone}
                  </p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm font-medium">{tOrders('paymentInformation')}</p>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{tOrders('method')}</span>
                    <span className="capitalize">{selectedOrder.paymentMethod || '—'}</span>
                  </div>
                  {selectedOrder.paymentId && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{tOrders('paymentId')}</span>
                      <span className="truncate max-w-[180px]">{selectedOrder.paymentId}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {tOrders('items')}
                  </p>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="text-muted-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between text-sm font-semibold">
                  <span>{tOrders('total')}</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  {tCommon('cancel')}
                </Button>
                <Button onClick={handleSaveStatus} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {tCommon('save')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
