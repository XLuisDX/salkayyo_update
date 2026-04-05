import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Order, OrderCreateData, OrderStatus } from '@/types'

const COLLECTION_NAME = 'orders'

export class OrdersService {
  static async getAll(): Promise<Order[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => this.mapDocToOrder(doc))
  }

  static async getByUserId(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => this.mapDocToOrder(doc))
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
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => this.mapDocToOrder(doc))
  }

  static async getRecentOrders(limitCount: number = 10): Promise<Order[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.slice(0, limitCount).map((doc) => this.mapDocToOrder(doc))
  }

  private static mapDocToOrder(doc: any): Order {
    const data = doc.data()
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
