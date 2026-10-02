import { getAdminDb } from '@/firebase/admin'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://salkayyo.com"
).replace(/\/$/, "");

export interface SeoProduct {
  id: string
  title: string
  description: string
  price: number
  image?: string
  categoryId?: string
  updatedAt?: Date
}

export interface SeoCategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
}

// Firestore stores images as an ordered array of {url, order, isPrimary} objects,
// but legacy docs may store plain URL strings.
function extractPrimaryImage(images: unknown): string | undefined {
  if (!Array.isArray(images) || images.length === 0) return undefined
  if (typeof images[0] === 'string') return images[0] as string

  const sorted = [...(images as Array<{ url?: string; order?: number }>)].sort(
    (a, b) => (a?.order ?? 0) - (b?.order ?? 0)
  )
  return sorted.find((img) => !!img?.url)?.url
}

export async function getProductForSeo(id: string): Promise<SeoProduct | null> {
  try {
    const snap = await getAdminDb().collection('products').doc(id).get()
    if (!snap.exists) return null

    const data = snap.data()!
    if (data.active === false || data.isActive === false) return null

    return {
      id: snap.id,
      title: data.name ?? data.title ?? '',
      description: data.description ?? '',
      price: Number(data.pricePerUnit ?? data.price ?? 0),
      image: extractPrimaryImage(data.images),
      categoryId: data.categoryId,
      updatedAt: data.updatedAt?.toDate?.(),
    }
  } catch {
    return null
  }
}

export async function getCategoryForSeoBySlug(slug: string): Promise<SeoCategory | null> {
  try {
    const snap = await getAdminDb().collection('categories').where('slug', '==', slug).limit(1).get()
    if (snap.empty) return null

    const doc = snap.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
    }
  } catch {
    return null
  }
}

export async function getAllProductsForSitemap(): Promise<
  Array<{ id: string; updatedAt?: Date }>
> {
  try {
    const snap = await getAdminDb().collection('products').get()
    return snap.docs
      .filter((d) => d.data().active !== false && d.data().isActive !== false)
      .map((d) => ({ id: d.id, updatedAt: d.data().updatedAt?.toDate?.() }))
  } catch {
    return []
  }
}

export async function getAllCategoriesForSitemap(): Promise<Array<{ slug: string }>> {
  try {
    const snap = await getAdminDb().collection('categories').get()
    return snap.docs
      .map((d) => ({ slug: d.data().slug as string | undefined }))
      .filter((c): c is { slug: string } => !!c.slug)
  } catch {
    return []
  }
}
