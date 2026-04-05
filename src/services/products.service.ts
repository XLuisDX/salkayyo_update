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
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Product, ProductCreateData, ProductFilters, PaginatedResponse } from '@/types'

const COLLECTION_NAME = 'products'
const PAGE_SIZE = 12

export class ProductsService {
  static async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const constraints: QueryConstraint[] = []

    if (filters?.categoryId) {
      constraints.push(where('categoryId', '==', filters.categoryId))
    }

    if (filters?.minPrice !== undefined) {
      constraints.push(where('price', '>=', filters.minPrice))
    }

    if (filters?.maxPrice !== undefined) {
      constraints.push(where('price', '<=', filters.maxPrice))
    }

    switch (filters?.sortBy) {
      case 'price-asc':
        constraints.push(orderBy('price', 'asc'))
        break
      case 'price-desc':
        constraints.push(orderBy('price', 'desc'))
        break
      case 'oldest':
        constraints.push(orderBy('createdAt', 'asc'))
        break
      case 'newest':
      default:
        constraints.push(orderBy('createdAt', 'desc'))
        break
    }

    const pageSize = filters?.limit || PAGE_SIZE
    constraints.push(limit(pageSize + 1))

    const q = query(collection(db, COLLECTION_NAME), ...constraints)
    const snapshot = await getDocs(q)

    const products: Product[] = []
    snapshot.docs.slice(0, pageSize).forEach((doc) => {
      const data = doc.data()
      products.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images || [],
        categoryId: data.categoryId,
        stock: data.stock,
        featured: data.featured || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      })
    })

    const hasMore = snapshot.docs.length > pageSize

    return {
      items: products,
      total: products.length,
      page: filters?.page || 1,
      pageSize,
      totalPages: hasMore ? (filters?.page || 1) + 1 : filters?.page || 1,
    }
  }

  static async getById(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    const data = docSnap.data()
    return {
      id: docSnap.id,
      title: data.title,
      description: data.description,
      price: data.price,
      images: data.images || [],
      categoryId: data.categoryId,
      stock: data.stock,
      featured: data.featured || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
    }
  }

  static async getByCategory(categoryId: string): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images || [],
        categoryId: data.categoryId,
        stock: data.stock,
        featured: data.featured || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      }
    })
  }

  static async getFeatured(limitCount: number = 8): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        images: data.images || [],
        categoryId: data.categoryId,
        stock: data.stock,
        featured: data.featured || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      }
    })
  }

  static async search(searchTerm: string): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('title'),
      limit(50)
    )
    const snapshot = await getDocs(q)

    const searchLower = searchTerm.toLowerCase()
    return snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          price: data.price,
          images: data.images || [],
          categoryId: data.categoryId,
          stock: data.stock,
          featured: data.featured || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        }
      })
      .filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      )
  }

  static async create(data: ProductCreateData): Promise<Product> {
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

  static async update(id: string, data: Partial<ProductCreateData>): Promise<void> {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }

  static async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  }

  static async updateStock(id: string, quantity: number): Promise<void> {
    const product = await this.getById(id)
    if (!product) throw new Error('Product not found')

    const newStock = product.stock - quantity
    if (newStock < 0) throw new Error('Insufficient stock')

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      stock: newStock,
      updatedAt: serverTimestamp(),
    })
  }
}
