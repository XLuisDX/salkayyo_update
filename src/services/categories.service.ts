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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Category, CategoryCreateData } from '@/types'

const COLLECTION_NAME = 'categories'

export class CategoriesService {
  static async getAll(): Promise<Category[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        createdAt: data.createdAt?.toDate() || new Date(),
      }
    })
  }

  static async getById(id: string): Promise<Category | null> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    const data = docSnap.data()
    return {
      id: docSnap.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  }

  static async getBySlug(slug: string): Promise<Category | null> {
    const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      createdAt: data.createdAt?.toDate() || new Date(),
    }
  }

  static async create(data: CategoryCreateData): Promise<Category> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
    })

    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
    }
  }

  static async update(id: string, data: Partial<CategoryCreateData>): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  }
}
