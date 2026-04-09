'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  startTransition,
} from 'react'
import { Product, CartItem, Cart } from '@/types'
import { calculateTax, calculateTotal } from '@/lib/utils'

const CART_STORAGE_KEY = 'saklayyo_cart'
const TAX_RATE = 0.09

interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  isInCart: (productId: string) => boolean
}

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        startTransition(() => {
          setCart(parsedCart)
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

  const calculateCartTotals = useCallback((items: CartItem[]): Cart => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const tax = calculateTax(subtotal, TAX_RATE)
    const total = calculateTotal(subtotal, TAX_RATE)

    return {
      items,
      subtotal,
      tax,
      total,
    }
  }, [])

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
    [calculateCartTotals]
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
    [calculateCartTotals]
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
    [calculateCartTotals, removeFromCart]
  )

  const clearCart = useCallback(() => {
    setCart(initialCart)
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
