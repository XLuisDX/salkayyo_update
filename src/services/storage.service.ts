import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage'
import { storage } from '@/firebase/config'

export class StorageService {
  static async uploadImage(
    file: File,
    path: string,
    fileName?: string
  ): Promise<string> {
    const name = fileName || `${Date.now()}-${file.name}`
    const storageRef = ref(storage, `${path}/${name}`)

    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  }

  static async uploadProductImage(file: File, productId: string): Promise<string> {
    return this.uploadImage(file, `products/${productId}`)
  }

  static async uploadCategoryImage(file: File, categoryId: string): Promise<string> {
    return this.uploadImage(file, `categories/${categoryId}`)
  }

  static async uploadUserAvatar(file: File, userId: string): Promise<string> {
    return this.uploadImage(file, `users/${userId}`, 'avatar')
  }

  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      const storageRef = ref(storage, imageUrl)
      await deleteObject(storageRef)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  static async deleteCatalogImages(collection: 'products' | 'categories', id: string, urls: string[]): Promise<void> {
    const folder = ref(storage, collection + '/' + id)
    const { items } = await listAll(folder)
    const images = new Map(items.map(item => [item.fullPath, item]))
    for (const url of urls) {
      if (!url.startsWith('https://firebasestorage.googleapis.com/')) continue
      const image = ref(storage, url)
      const [root, parent, file, extra] = image.fullPath.split('/')
      if (image.bucket === folder.bucket && root === collection && file && !extra &&
          (parent === id || /^temp-\d+$/.test(parent))) images.set(image.fullPath, image)
    }
    await Promise.all(Array.from(images.values(), async image => {
      try {
        await deleteObject(image)
      } catch (error) {
        if ((error as { code?: string }).code !== 'storage/object-not-found') throw error
      }
    }))
  }

  static async getImageUrl(path: string): Promise<string> {
    const storageRef = ref(storage, path)
    return getDownloadURL(storageRef)
  }

  static generateImagePath(folder: string, fileName: string): string {
    return `${folder}/${Date.now()}-${fileName}`
  }
}
