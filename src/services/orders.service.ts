import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  getAggregateFromServer,
  sum,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Order, OrderCreateData, OrderStatus } from '@/types'

const COLLECTION_NAME = 'orders'
const PAGE_SIZE = 20
const REVENUE_STATUSES: OrderStatus[] = ['paid', 'shipped', 'delivered']

export interface OrdersPage {
  items: Order[]
  total: number
  nextCursor: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

export interface RevenueStats {
  totalOrders: number
  totalRevenue: number
}

export class OrdersService {
  /** Cursor-paginated order list, newest first. */
  static async getAll(
    cursor?: QueryDocumentSnapshot<DocumentData> | null,
    pageSize: number = PAGE_SIZE
  ): Promise<OrdersPage> {
    return this.getPage([], cursor, pageSize)
  }

  /** Cursor-paginated order list filtered by status, newest first. */
  static async getByStatus(
    status: OrderStatus,
    cursor?: QueryDocumentSnapshot<DocumentData> | null,
    pageSize: number = PAGE_SIZE
  ): Promise<OrdersPage> {
    return this.getPage([where('status', '==', status)], cursor, pageSize)
  }

  private static async getPage(
    whereConstraints: QueryConstraint[],
    cursor: QueryDocumentSnapshot<DocumentData> | null | undefined,
    pageSize: number
  ): Promise<OrdersPage> {
    const pageConstraints: QueryConstraint[] = [
      ...whereConstraints,
      orderBy('createdAt', 'desc'),
    ]
    if (cursor) pageConstraints.push(startAfter(cursor))
    pageConstraints.push(limit(pageSize + 1))

    const [snapshot, countSnapshot] = await Promise.all([
      getDocs(query(collection(db, COLLECTION_NAME), ...pageConstraints)),
      getCountFromServer(query(collection(db, COLLECTION_NAME), ...whereConstraints)),
    ])

    const hasMore = snapshot.docs.length > pageSize
    const pageDocs = snapshot.docs.slice(0, pageSize)

    return {
      items: pageDocs.map((docSnap) => this.mapDocToOrder(docSnap)),
      total: countSnapshot.data().count,
      nextCursor: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
      hasMore,
    }
  }

  static async getByUserId(userId: string): Promise<Order[]> {
    // Query without orderBy to avoid requiring composite index
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map((doc) => this.mapDocToOrder(doc))

    // Sort by createdAt desc in client
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static async getById(id: string): Promise<Order | null> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    return this.mapDocToOrder(docSnap)
  }

  static async getByPaymentId(paymentId: string): Promise<Order | null> {
    const q = query(collection(db, COLLECTION_NAME), where('paymentId', '==', paymentId))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    return this.mapDocToOrder(snapshot.docs[0])
  }

  static async create(data: OrderCreateData): Promise<Order> {
    const orderData = {
      ...data,
      status: 'pending' as OrderStatus,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), orderData)

    return {
      id: docRef.id,
      ...data,
      status: 'pending',
      createdAt: new Date(),
    }
  }

  static async updateStatus(id: string, status: OrderStatus): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      status,
      updatedAt: serverTimestamp(),
    })
  }

  static async updatePaymentId(id: string, paymentId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      paymentId,
      updatedAt: serverTimestamp(),
    })
  }

  static async markAsPaid(id: string, paymentId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      status: 'paid' as OrderStatus,
      paymentId,
      updatedAt: serverTimestamp(),
    })
  }

  static async getRecentOrders(limitCount: number = 10): Promise<Order[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => this.mapDocToOrder(doc))
  }

  /** All-time order count + revenue via server-side aggregation — no document reads. */
  static async getRevenueStats(): Promise<RevenueStats> {
    const revenueQuery = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', REVENUE_STATUSES)
    )

    const [totalOrdersSnapshot, revenueSnapshot] = await Promise.all([
      getCountFromServer(collection(db, COLLECTION_NAME)),
      getAggregateFromServer(revenueQuery, { totalRevenue: sum('total') }),
    ])

    return {
      totalOrders: totalOrdersSnapshot.data().count,
      totalRevenue: revenueSnapshot.data().totalRevenue || 0,
    }
  }

  /** Orders from the last `days` days, for the dashboard's daily sales chart. */
  static async getOrdersSince(days: number): Promise<Order[]> {
    const cutoff = new Date()
    cutoff.setHours(0, 0, 0, 0)
    cutoff.setDate(cutoff.getDate() - (days - 1))

    const q = query(
      collection(db, COLLECTION_NAME),
      where('createdAt', '>=', Timestamp.fromDate(cutoff)),
      orderBy('createdAt', 'asc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => this.mapDocToOrder(doc))
  }

  private static mapDocToOrder(doc: DocumentSnapshot | QueryDocumentSnapshot): Order {
    const data = doc.data()!
    return {
      id: doc.id,
      userId: data.userId,
      items: data.items || [],
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: data.status,
      paymentId: data.paymentId,
      paymentMethod: data.paymentMethod,
      recipientData: data.recipientData,
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : data.updatedAt ? new Date(data.updatedAt) : undefined,
    }
  }
}
