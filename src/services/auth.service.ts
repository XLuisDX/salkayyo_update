import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import { User, UserCreateData } from '@/types'

function toDate(value: unknown): Date {
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) return parsed
  }
  return new Date()
}

export class AuthService {
  static async register(data: UserCreateData): Promise<User> {
    const { email, password, name, newsletterSubscribed = false, preferredLanguage } = data

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    await updateProfile(firebaseUser, { displayName: name })

    const userData: Omit<User, 'id'> = {
      name,
      email,
      verified: false,
      createdAt: new Date(),
      role: 'user',
      newsletterSubscribed,
      preferredLanguage,
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    })

    await AuthService.sendVerificationEmail(email)

    return {
      id: firebaseUser.uid,
      ...userData,
    }
  }

  static async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))

    if (!userDoc.exists()) {
      throw new Error('User data not found')
    }

    const userData = userDoc.data()

    if (firebaseUser.emailVerified && !userData.verified) {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        verified: true,
        emailVerifiedAt: serverTimestamp(),
      })
      userData.verified = true
    }

    return {
      id: firebaseUser.uid,
      name: userData.name,
      email: userData.email,
      verified: userData.verified,
      createdAt: toDate(userData.createdAt),
      role: userData.role || 'user',
      newsletterSubscribed: userData.newsletterSubscribed,
      preferredLanguage: userData.preferredLanguage,
      emailVerifiedAt: userData.emailVerifiedAt ? toDate(userData.emailVerifiedAt) : null,
    }
  }

  static async logout(): Promise<void> {
    await signOut(auth)
  }

  static async resetPassword(email: string): Promise<void> {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const { error } = await response.json()
      const err = new Error(error?.message || 'Failed to send reset email') as Error & {
        code?: string
      }
      err.code = error?.code
      throw err
    }
  }

  static async resendVerificationEmail(): Promise<void> {
    const user = auth.currentUser
    if (!user?.email) {
      throw new Error('No user logged in')
    }
    await AuthService.sendVerificationEmail(user.email)
  }

  static async sendVerificationEmail(email: string): Promise<void> {
    const response = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const { error } = await response.json()
      throw new Error(error?.message || 'Failed to send verification email')
    }
  }

  // Call after the user clicks the verification link in their email (opened
  // in another tab) to pick up the new emailVerified status without forcing
  // a full logout/login cycle.
  static async refreshVerificationStatus(): Promise<boolean> {
    const user = auth.currentUser
    if (!user) return false

    await user.reload()
    if (user.emailVerified) {
      // Force a fresh ID token so the new email_verified claim is immediately
      // available to Firestore security rules (e.g. the checkout order-create rule).
      await user.getIdToken(true)
      await updateDoc(doc(db, 'users', user.uid), {
        verified: true,
        emailVerifiedAt: serverTimestamp(),
      })
    }

    return user.emailVerified
  }

  static async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
    if (!userDoc.exists()) return null

    const userData = userDoc.data()
    return {
      id: firebaseUser.uid,
      name: userData.name,
      email: userData.email,
      verified: userData.verified,
      createdAt: toDate(userData.createdAt),
      role: userData.role || 'user',
      newsletterSubscribed: userData.newsletterSubscribed,
      preferredLanguage: userData.preferredLanguage,
      emailVerifiedAt: userData.emailVerifiedAt ? toDate(userData.emailVerifiedAt) : null,
    }
  }

  static async updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp(),
    })

    const firebaseUser = auth.currentUser
    if (firebaseUser && data.name) {
      await updateProfile(firebaseUser, { displayName: data.name })
    }
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser
    if (!user || !user.email) {
      throw new Error('No user logged in')
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword)
  }

  static onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback)
  }

  static getFirebaseUser(): FirebaseUser | null {
    return auth.currentUser
  }
}
