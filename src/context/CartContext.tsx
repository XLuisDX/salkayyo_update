'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
  startTransition,
} from 'react'
import { Product, CartItem, Cart } from '@/types'
import { calculateTax, calculateTotal } from '@/lib/utils'
import { ProductsService } from '@/services/products.service'

const CART_STORAGE_KEY = 'salkayyo_cart'

interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  isInCart: (productId: string) => boolean
  /** True once the saved cart has been restored from localStorage. */
  isReady: boolean
  /**
   * Re-reads every cart product from the catalog: refreshes price/title/stock,
   * drops unavailable products and caps quantities at the available stock.
   * Resolves to true if anything in the cart changed.
   */
  syncWithCatalog: () => Promise<boolean>
}

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function calculateCartTotals(items: CartItem[]): Cart {
  const subtotal = items.reduce(
    (cents, item) => cents + Math.round(item.product.price * 100) * item.quantity,
    0
  ) / 100
  return { items, subtotal, tax: calculateTax(subtotal), total: calculateTotal(subtotal) }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart)
  const [isInitialized, setIsInitialized] = useState(false)
  const cartRef = useRef(cart)
  useEffect(() => {
    cartRef.current = cart
  }, [cart])

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        startTransition(() => {
          setCart(calculateCartTotals(parsedCart.items))
        })
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
      }
    }
    startTransition(() => {
      setIsInitialized(true)
    })
  }, [])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, isInitialized])

  const addToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.items.findIndex(
          (item) => item.product.id === product.id
        )

        let newItems: CartItem[]

        if (existingItemIndex >= 0) {
          newItems = prevCart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          newItems = [...prevCart.items, { product, quantity }]
        }

        return calculateCartTotals(newItems)
      })
    },
    []
  )

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prevCart) => {
        const newItems = prevCart.items.filter(
          (item) => item.product.id !== productId
        )
        return calculateCartTotals(newItems)
      })
    },
    []
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId)
        return
      }

      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
        return calculateCartTotals(newItems)
      })
    },
    [removeFromCart]
  )

  const clearCart = useCallback(() => {
    setCart(initialCart)
  }, [])

  const syncWithCatalog = useCallback(async () => {
    const ids = cartRef.current.items.map((item) => item.product.id)
    if (ids.length === 0) return false
    const fresh = new Map<string, Product | null>()
    await Promise.all(ids.map(async (id) => {
      fresh.set(id, await ProductsService.getById(id))
    }))

    const reconcile = (current: CartItem[]) => {
      let changed = false
      const items: CartItem[] = []
      for (const item of current) {
        if (!fresh.has(item.product.id)) {
          items.push(item) // added while we were fetching
          continue
        }
        const product = fresh.get(item.product.id)
        if (!product || product.isActive === false || product.stock <= 0) {
          changed = true
          continue
        }
        const quantity = Math.min(item.quantity, product.stock)
        if (quantity !== item.quantity || product.price !== item.product.price) changed = true
        items.push({ product, quantity })
      }
      return { items, changed }
    }

    // State updaters may run later, so compute the answer from the latest cart
    // and apply the same reconciliation inside the updater.
    const { changed } = reconcile(cartRef.current.items)
    setCart((prevCart) => calculateCartTotals(reconcile(prevCart.items).items))
    return changed
  }, [])

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart.items])

  const isInCart = useCallback(
    (productId: string) => {
      return cart.items.some((item) => item.product.id === productId)
    },
    [cart.items]
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        isInCart,
        isReady: isInitialized,
        syncWithCatalog,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
