import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Order, OrderCreateData, OrderStatus } from '@/types'

const COLLECTION_NAME = 'orders'

export class OrdersService {
  static async getAll(): Promise<Order[]> {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    const orders = snapshot.docs.map((doc) => this.mapDocToOrder(doc))

    // Sort by createdAt desc in client
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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

  static async getByStatus(status: OrderStatus): Promise<Order[]> {
    // Query without orderBy to avoid requiring composite index
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status)
    )
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map((doc) => this.mapDocToOrder(doc))

    // Sort by createdAt desc in client
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static async getRecentOrders(limitCount: number = 10): Promise<Order[]> {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    const orders = snapshot.docs.map((doc) => this.mapDocToOrder(doc))

    // Sort by createdAt desc and limit in client
    return orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limitCount)
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
