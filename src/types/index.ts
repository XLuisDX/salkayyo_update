// User Types
export interface User {
  id: string
  name: string
  email: string
  verified: boolean
  createdAt: Date
  role?: 'user' | 'admin'
}

export interface UserCreateData {
  name: string
  email: string
  password: string
}

export interface UserLoginData {
  email: string
  password: string
}

// Product Types
export interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  categoryId: string
  stock: number
  reference?: string
  tags?: string[]
  isActive?: boolean
  featured?: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface ProductCreateData {
  title: string
  description: string
  price: number
  images: string[]
  categoryId: string
  stock: number
  reference?: string
  tags?: string[]
  isActive?: boolean
  featured?: boolean
}

export interface ProductFilters {
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'oldest'
  limit?: number
  page?: number
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  createdAt: Date
}

export interface CategoryCreateData {
  name: string
  slug: string
  description?: string
  image?: string
}

// Order Types
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  title: string
  price: number
  quantity: number
  image: string
}

export interface RecipientData {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: OrderStatus
  paymentId?: string
  paymentMethod?: 'stripe' | 'paypal'
  recipientData: RecipientData
  createdAt: Date
  updatedAt?: Date
}

export interface OrderCreateData {
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'stripe' | 'paypal'
  recipientData: RecipientData
}

// Recipient Types
export interface Recipient {
  id: string
  userId: string
  fullName: string
  reference?: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault?: boolean
  createdAt: Date
}

export interface RecipientCreateData {
  fullName: string
  reference?: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault?: boolean
}

// Cart Types
export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Email Types
export interface EmailData {
  to: string
  subject: string
  template: 'order-confirmation' | 'verify-email' | 'reset-password' | 'admin-notification'
  data: Record<string, unknown>
}

// Payment Types
export interface StripeCheckoutData {
  items: CartItem[]
  recipientData: RecipientData
  userId: string
  successUrl: string
  cancelUrl: string
}

export interface PayPalOrderData {
  items: CartItem[]
  recipientData: RecipientData
  userId: string
  total: number
}
