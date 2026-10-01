'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
  startTransition,
} from 'react'
import { useAuth } from './AuthContext'
import { WishlistService } from '@/services/wishlist.service'

const WISHLIST_STORAGE_KEY = 'saklayyo_wishlist'

interface WishlistContextType {
  wishlist: string[]
  toggleWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
  getWishlistCount: () => number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

function readLocalWishlist(): string[] {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error parsing wishlist from localStorage:', error)
    return []
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  // Tracks the userId we've already synced/merged with Firestore, so we only
  // merge once per login rather than on every re-render.
  const syncedUserIdRef = useRef<string | null>(null)

  // Load the local (guest) wishlist immediately for instant UI, before auth resolves.
  useEffect(() => {
    startTransition(() => {
      setWishlist(readLocalWishlist())
      setIsInitialized(true)
    })
  }, [])

  // Mirror every change to localStorage, so logged-out visitors and the
  // next page load still have something to show instantly.
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    }
  }, [wishlist, isInitialized])

  // On login, merge whatever was in the guest (localStorage) wishlist into
  // the account's Firestore wishlist, then make Firestore the source of truth.
  useEffect(() => {
    if (!isInitialized) return

    if (!user) {
      syncedUserIdRef.current = null
      return
    }

    if (syncedUserIdRef.current === user.id) return
    syncedUserIdRef.current = user.id

    let cancelled = false

    WishlistService.getProductIds(user.id)
      .then(async (remoteIds) => {
        if (cancelled) return

        const localIds = readLocalWishlist()
        const merged = Array.from(new Set([...remoteIds, ...localIds]))

        if (merged.length !== remoteIds.length) {
          await WishlistService.setProductIds(user.id, merged)
        }

        if (!cancelled) {
          setWishlist(merged)
        }
      })
      .catch((error) => {
        console.error('Error syncing wishlist with Firestore:', error)
      })

    return () => {
      cancelled = true
    }
  }, [user, isInitialized])

  const writeRemote = useCallback(
    (next: string[]) => {
      if (user) {
        WishlistService.setProductIds(user.id, next).catch((error) => {
          console.error('Error saving wishlist to Firestore:', error)
        })
      }
    },
    [user]
  )

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
        writeRemote(next)
        return next
      })
    },
    [writeRemote]
  )

  const removeFromWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const next = prev.filter((id) => id !== productId)
        writeRemote(next)
        return next
      })
    },
    [writeRemote]
  )

  const clearWishlist = useCallback(() => {
    setWishlist([])
    writeRemote([])
  }, [writeRemote])

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  )

  const getWishlistCount = useCallback(() => wishlist.length, [wishlist])

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
