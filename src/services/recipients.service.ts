import {
  collection, doc, getDoc, getDocs, query, where, serverTimestamp, runTransaction, writeBatch,
  type DocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Recipient, RecipientCreateData } from '@/types'

const collectionName = 'recipients'

function mapRecipient(snapshot: DocumentSnapshot, isDefault: boolean): Recipient {
  const data = snapshot.data()!
  return {
    id: snapshot.id,
    userId: data.userId,
    fullName: data.fullName,
    reference: data.reference || '',
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    country: data.country,
    phone: data.phone,
    isDefault,
    createdAt: data.createdAt?.toDate() || new Date(),
  }
}

export class RecipientsService {
  static async getByUserId(userId: string): Promise<Recipient[]> {
    const [snapshot, user] = await Promise.all([
      getDocs(query(collection(db, collectionName), where('userId', '==', userId))),
      getDoc(doc(db, 'users', userId)),
    ])
    const recipients = snapshot.docs.map(item => mapRecipient(item, item.get('isDefault') === true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    const pointer = user.get('defaultRecipientId')
    const defaultId = pointer === undefined ? recipients.find(item => item.isDefault)?.id : pointer
    return recipients.map(item => ({ ...item, isDefault: item.id === defaultId }))
  }

  static async getById(id: string): Promise<Recipient | null> {
    const snapshot = await getDoc(doc(db, collectionName, id))
    if (!snapshot.exists()) return null
    const userId = snapshot.get('userId')
    const user = await getDoc(doc(db, 'users', userId))
    const pointer = user.get('defaultRecipientId')
    if (pointer === undefined && snapshot.get('isDefault') === true) {
      return (await this.getByUserId(userId)).find(item => item.id === id) ?? null
    }
    return mapRecipient(snapshot, pointer === id)
  }

  static async getDefault(userId: string): Promise<Recipient | null> {
    return (await this.getByUserId(userId)).find(item => item.isDefault) ?? null
  }

  static async create(userId: string, data: RecipientCreateData): Promise<Recipient> {
    const ref = doc(collection(db, collectionName))
    const { isDefault, ...fields } = data
    const batch = writeBatch(db)
    batch.set(ref, { ...fields, userId, createdAt: serverTimestamp() })
    if (isDefault) batch.update(doc(db, 'users', userId), { defaultRecipientId: ref.id })
    await batch.commit()
    return { ...data, id: ref.id, userId, createdAt: new Date() }
  }

  static async update(id: string, data: Partial<RecipientCreateData>): Promise<void> {
    const ref = doc(db, collectionName, id)
    const wasDefault = data.isDefault === false && (await this.getById(id))?.isDefault
    await runTransaction(db, async transaction => {
      const recipient = await transaction.get(ref)
      if (!recipient.exists()) throw new Error('Recipient not found')
      const userRef = doc(db, 'users', recipient.get('userId'))
      const user = await transaction.get(userRef)
      const pointer = user.get('defaultRecipientId')
      const { isDefault, ...fields } = data
      if (isDefault) transaction.update(userRef, { defaultRecipientId: id })
      if (isDefault === false && (pointer === id || (pointer === undefined && wasDefault))) {
        transaction.update(userRef, { defaultRecipientId: null })
      }
      transaction.update(ref, { ...fields, updatedAt: serverTimestamp() })
    })
  }

  static async delete(id: string): Promise<void> {
    const ref = doc(db, collectionName, id)
    await runTransaction(db, async transaction => {
      const recipient = await transaction.get(ref)
      if (!recipient.exists()) return
      const userRef = doc(db, 'users', recipient.get('userId'))
      const user = await transaction.get(userRef)
      if (user.get('defaultRecipientId') === id) transaction.update(userRef, { defaultRecipientId: null })
      transaction.delete(ref)
    })
  }

  static async setAsDefault(id: string): Promise<void> {
    await this.update(id, { isDefault: true })
  }
}
