import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
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

export class AuthService {
  static async register(data: UserCreateData): Promise<User> {
    const { email, password, name } = data

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    await updateProfile(firebaseUser, { displayName: name })

    const userData: Omit<User, 'id'> = {
      name,
      email,
      verified: false,
      createdAt: new Date(),
      role: 'user',
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    })

    await sendEmailVerification(firebaseUser)

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
      })
      userData.verified = true
    }

    return {
      id: firebaseUser.uid,
      name: userData.name,
      email: userData.email,
      verified: userData.verified,
      createdAt: userData.createdAt?.toDate() || new Date(),
      role: userData.role || 'user',
    }
  }

  static async logout(): Promise<void> {
    await signOut(auth)
  }

  static async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email)
  }

  static async resendVerificationEmail(): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('No user logged in')
    }
    await sendEmailVerification(user)
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
      createdAt: userData.createdAt?.toDate() || new Date(),
      role: userData.role || 'user',
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
