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
  limit,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Product, ProductCreateData, ProductFilters, PaginatedResponse } from '@/types'

const COLLECTION_NAME = 'products'
const PAGE_SIZE = 12

// Firestore stores images as an ordered array of objects, not plain URL strings.
interface FirestoreProductImage {
  url: string
  order?: number
  isPrimary?: boolean
}

function extractImageUrls(images: unknown): string[] {
  if (!Array.isArray(images)) return []

  // Legacy/simple shape: already an array of URL strings.
  if (images.length > 0 && typeof images[0] === 'string') {
    return images as string[]
  }

  return (images as FirestoreProductImage[])
    .filter((img) => !!img?.url)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((img) => img.url)
}

function mapDocToProduct(id: string, data: DocumentData): Product {
  return {
    id,
    title: data.name ?? data.title ?? '',
    description: data.description ?? '',
    price: Number(data.pricePerUnit ?? data.price ?? 0),
    images: extractImageUrls(data.images),
    categoryId: data.categoryId,
    stock: Number(data.stockQuantity ?? data.stock ?? 0),
    reference: data.code ?? data.reference,
    tags: data.tags || [],
    isActive: data.active ?? data.isActive ?? true,
    featured: data.featured || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate(),
  }
}

function mapProductToFirestoreData(data: Partial<ProductCreateData>) {
  const firestoreData: DocumentData = {}

  if (data.title !== undefined) firestoreData.name = data.title
  if (data.description !== undefined) firestoreData.description = data.description
  if (data.price !== undefined) firestoreData.pricePerUnit = data.price
  if (data.categoryId !== undefined) firestoreData.categoryId = data.categoryId
  if (data.stock !== undefined) firestoreData.stockQuantity = data.stock
  if (data.reference !== undefined) firestoreData.code = data.reference
  if (data.tags !== undefined) firestoreData.tags = data.tags
  if (data.isActive !== undefined) firestoreData.active = data.isActive
  if (data.featured !== undefined) firestoreData.featured = data.featured

  if (data.images !== undefined) {
    firestoreData.images = data.images.map((url, index) => ({
      id: `img-${Date.now()}-${index}`,
      url,
      alt: data.title ?? '',
      isPrimary: index === 0,
      order: index,
    }))
  }

  return firestoreData
}

export class ProductsService {
  static async getAll(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    // Only equality/range `where` constraints are applied server-side. Sorting and
    // pagination happen client-side to avoid requiring Firestore composite indexes
    // for every filter + sort combination (see getByCategory/getFeatured).
    const constraints: QueryConstraint[] = []

    if (filters?.categoryId) {
      constraints.push(where('categoryId', '==', filters.categoryId))
    }

    if (filters?.minPrice !== undefined) {
      constraints.push(where('pricePerUnit', '>=', filters.minPrice))
    }

    if (filters?.maxPrice !== undefined) {
      constraints.push(where('pricePerUnit', '<=', filters.maxPrice))
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints)
    const snapshot = await getDocs(q)

    const allProducts = snapshot.docs.map((docSnap) =>
      mapDocToProduct(docSnap.id, docSnap.data())
    )

    switch (filters?.sortBy) {
      case 'price-asc':
        allProducts.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        allProducts.sort((a, b) => b.price - a.price)
        break
      case 'oldest':
        allProducts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'newest':
      default:
        allProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
    }

    const pageSize = filters?.limit || PAGE_SIZE
    const page = filters?.page || 1
    const total = allProducts.length
    const products = allProducts.slice((page - 1) * pageSize, page * pageSize)

    return {
      items: products,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  static async getById(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    return mapDocToProduct(docSnap.id, docSnap.data())
  }

  static async getByCategory(categoryId: string): Promise<Product[]> {
    // Query without orderBy to avoid requiring composite index
    const q = query(
      collection(db, COLLECTION_NAME),
      where('categoryId', '==', categoryId)
    )
    const snapshot = await getDocs(q)

    const products = snapshot.docs.map((docSnap) =>
      mapDocToProduct(docSnap.id, docSnap.data())
    )

    // Sort by createdAt desc in client
    return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static async getFeatured(limitCount: number = 8): Promise<Product[]> {
    // Query without orderBy to avoid requiring composite index
    const q = query(
      collection(db, COLLECTION_NAME),
      where('featured', '==', true)
    )
    const snapshot = await getDocs(q)

    const products = snapshot.docs.map((docSnap) =>
      mapDocToProduct(docSnap.id, docSnap.data())
    )

    // Sort by createdAt desc in client and limit
    return products
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limitCount)
  }

  static async search(searchTerm: string): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      limit(200)
    )
    const snapshot = await getDocs(q)

    const searchLower = searchTerm.toLowerCase()
    return snapshot.docs
      .map((docSnap) => mapDocToProduct(docSnap.id, docSnap.data()))
      .filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      )
  }

  static async create(data: ProductCreateData): Promise<Product> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...mapProductToFirestoreData(data),
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
      ...mapProductToFirestoreData(data),
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
      stockQuantity: newStock,
      updatedAt: serverTimestamp(),
    })
  }
}
