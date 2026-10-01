import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { Product, ProductCreateData, ProductFilters } from '@/types'

const COLLECTION_NAME = 'products'
const PAGE_SIZE = 12
const RELATED_PRODUCTS_LIMIT = 24

export interface ProductsPage {
  items: Product[]
  total: number
  nextCursor: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

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

// Firestore requires the first orderBy() to match the field used in an inequality
// (>=, <=) filter. A price range filter therefore forces sorting by price —
// sorting by date while range-filtering by a different field isn't supported.
function resolveSort(filters?: ProductFilters): { field: 'pricePerUnit' | 'createdAt'; direction: 'asc' | 'desc' } {
  const hasPriceFilter = filters?.minPrice !== undefined || filters?.maxPrice !== undefined

  if (hasPriceFilter) {
    return { field: 'pricePerUnit', direction: filters?.sortBy === 'price-desc' ? 'desc' : 'asc' }
  }

  switch (filters?.sortBy) {
    case 'price-asc':
      return { field: 'pricePerUnit', direction: 'asc' }
    case 'price-desc':
      return { field: 'pricePerUnit', direction: 'desc' }
    case 'oldest':
      return { field: 'createdAt', direction: 'asc' }
    case 'newest':
    default:
      return { field: 'createdAt', direction: 'desc' }
  }
}

function buildWhereConstraints(filters?: ProductFilters): QueryConstraint[] {
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

  return constraints
}

export class ProductsService {
  /**
   * Server-side paginated product listing. Only equality (categoryId) and price
   * range filters are applied in Firestore; sorting follows resolveSort() so the
   * query never mixes an inequality filter with an orderBy on a different field
   * (a hard Firestore constraint, not a choice).
   */
  static async getAll(
    filters?: ProductFilters,
    cursor?: QueryDocumentSnapshot<DocumentData> | null
  ): Promise<ProductsPage> {
    const whereConstraints = buildWhereConstraints(filters)
    const { field, direction } = resolveSort(filters)
    const pageSize = filters?.limit || PAGE_SIZE

    const pageConstraints: QueryConstraint[] = [
      ...whereConstraints,
      orderBy(field, direction),
    ]
    if (cursor) pageConstraints.push(startAfter(cursor))
    // Fetch one extra document to know whether another page exists.
    pageConstraints.push(limit(pageSize + 1))

    const [snapshot, countSnapshot] = await Promise.all([
      getDocs(query(collection(db, COLLECTION_NAME), ...pageConstraints)),
      getCountFromServer(query(collection(db, COLLECTION_NAME), ...whereConstraints)),
    ])

    const hasMore = snapshot.docs.length > pageSize
    const pageDocs = snapshot.docs.slice(0, pageSize)

    return {
      items: pageDocs.map((docSnap) => mapDocToProduct(docSnap.id, docSnap.data())),
      total: countSnapshot.data().count,
      nextCursor: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
      hasMore,
    }
  }

  static async getById(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    return mapDocToProduct(docSnap.id, docSnap.data())
  }

  /**
   * Bounded, server-sorted category listing (used by the category page and
   * "related products"). Not cursor-paginated: a limit comfortably above any
   * real category size keeps this a single cheap read without needing a
   * "Load more" control on every category page.
   */
  static async getByCategory(
    categoryId: string,
    limitCount: number = RELATED_PRODUCTS_LIMIT
  ): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((docSnap) => mapDocToProduct(docSnap.id, docSnap.data()))
  }

  static async getFeatured(limitCount: number = 8): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map((docSnap) => mapDocToProduct(docSnap.id, docSnap.data()))
  }

  /**
   * Substring search across title/description. Firestore has no native
   * full-text search, so this still reads a bounded batch and filters in
   * memory — a dedicated search index (e.g. Algolia/Typesense) is the real
   * fix if the catalog outgrows this cap, out of scope here.
   */
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

  /** Bounded low-stock lookup for the admin dashboard — never reads the full catalog. */
  static async getLowStock(threshold: number = 5, limitCount: number = 20): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('stockQuantity', '>', 0),
      where('stockQuantity', '<=', threshold),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs
      .map((docSnap) => mapDocToProduct(docSnap.id, docSnap.data()))
      .filter((product) => product.isActive !== false)
  }

  /** Cheap server-side count, no document reads — used for dashboard stat cards. */
  static async getTotalCount(): Promise<number> {
    const snapshot = await getCountFromServer(collection(db, COLLECTION_NAME))
    return snapshot.data().count
  }
}
