import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'

const COLLECTION_NAME = 'wishlists'

export class WishlistService {
  static async getProductIds(userId: string): Promise<string[]> {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, userId))
    if (!docSnap.exists()) return []

    const data = docSnap.data()
    return Array.isArray(data.productIds) ? data.productIds : []
  }

  static async setProductIds(userId: string, productIds: string[]): Promise<void> {
    await setDoc(
      doc(db, COLLECTION_NAME, userId),
      {
        userId,
        productIds,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  }
}
