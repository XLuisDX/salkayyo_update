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

  static async deleteProductImages(productId: string): Promise<void> {
    try {
      const folderRef = ref(storage, `products/${productId}`)
      const list = await listAll(folderRef)

      await Promise.all(list.items.map((item) => deleteObject(item)))
    } catch (error) {
      console.error('Error deleting product images:', error)
      throw error
    }
  }

  static async getImageUrl(path: string): Promise<string> {
    const storageRef = ref(storage, path)
    return getDownloadURL(storageRef)
  }

  static generateImagePath(folder: string, fileName: string): string {
    return `${folder}/${Date.now()}-${fileName}`
  }
}
