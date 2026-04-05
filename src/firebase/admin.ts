import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'

let adminApp: App
let adminAuth: Auth
let adminDb: Firestore
let adminStorage: Storage

const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  } else {
    adminApp = getApps()[0]
  }

  adminAuth = getAuth(adminApp)
  adminDb = getFirestore(adminApp)
  adminStorage = getStorage(adminApp)

  return { adminApp, adminAuth, adminDb, adminStorage }
}

export const getAdminApp = () => {
  if (!adminApp) {
    initializeFirebaseAdmin()
  }
  return adminApp
}

export const getAdminAuth = () => {
  if (!adminAuth) {
    initializeFirebaseAdmin()
  }
  return adminAuth
}

export const getAdminDb = () => {
  if (!adminDb) {
    initializeFirebaseAdmin()
  }
  return adminDb
}

export const getAdminStorage = () => {
  if (!adminStorage) {
    initializeFirebaseAdmin()
  }
  return adminStorage
}

export { adminApp, adminAuth, adminDb, adminStorage }
