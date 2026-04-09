import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Recipient, RecipientCreateData } from '@/types'

const COLLECTION_NAME = 'recipients'

export class RecipientsService {
  static async getByUserId(userId: string): Promise<Recipient[]> {
    // Query without orderBy to avoid requiring composite index
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)

    const recipients = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data.userId,
        fullName: data.fullName,
        reference: data.reference || '',
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault || false,
        createdAt: data.createdAt?.toDate() || new Date(),
      }
    })

    // Sort by createdAt desc in client
    return recipients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static async getById(id: string): Promise<Recipient | null> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    const data = docSnap.data()
    return {
      id: docSnap.id,
      userId: data.userId,
      fullName: data.fullName,
      reference: data.reference || '',
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      isDefault: data.isDefault || false,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  }

  static async getDefault(userId: string): Promise<Recipient | null> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('isDefault', '==', true)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const docSnap = snapshot.docs[0]
    const data = docSnap.data()
    return {
      id: docSnap.id,
      userId: data.userId,
      fullName: data.fullName,
      reference: data.reference || '',
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      isDefault: data.isDefault || false,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  }

  static async create(userId: string, data: RecipientCreateData): Promise<Recipient> {
    if (data.isDefault) {
      await this.clearDefaultForUser(userId)
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
    })

    return {
      id: docRef.id,
      userId,
      ...data,
      createdAt: new Date(),
    }
  }

  static async update(id: string, data: Partial<RecipientCreateData>): Promise<void> {
    const recipient = await this.getById(id)
    if (!recipient) throw new Error('Recipient not found')

    if (data.isDefault) {
      await this.clearDefaultForUser(recipient.userId)
    }

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  }

  static async setAsDefault(id: string): Promise<void> {
    const recipient = await this.getById(id)
    if (!recipient) throw new Error('Recipient not found')

    await this.clearDefaultForUser(recipient.userId)

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      isDefault: true,
      updatedAt: serverTimestamp(),
    })
  }

  private static async clearDefaultForUser(userId: string): Promise<void> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('isDefault', '==', true)
    )
    const snapshot = await getDocs(q)

    const batch = writeBatch(db)
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isDefault: false })
    })

    await batch.commit()
  }
}
