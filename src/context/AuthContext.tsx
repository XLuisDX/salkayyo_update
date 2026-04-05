'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { AuthService } from '@/services/auth.service'
import { User, UserCreateData } from '@/types'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: UserCreateData) => Promise<User>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerification: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        try {
          const userData = await AuthService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    const userData = await AuthService.login(email, password)
    setUser(userData)
    return userData
  }

  const register = async (data: UserCreateData): Promise<User> => {
    const userData = await AuthService.register(data)
    setUser(userData)
    return userData
  }

  const logout = async (): Promise<void> => {
    await AuthService.logout()
    setUser(null)
    setFirebaseUser(null)
  }

  const resetPassword = async (email: string): Promise<void> => {
    await AuthService.resetPassword(email)
  }

  const resendVerification = async (): Promise<void> => {
    await AuthService.resendVerificationEmail()
  }

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in')
    await AuthService.updateUserProfile(user.id, data)
    setUser({ ...user, ...data })
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await AuthService.changePassword(currentPassword, newPassword)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        register,
        logout,
        resetPassword,
        resendVerification,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
