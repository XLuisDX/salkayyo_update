'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { CartProvider } from './CartContext'
import { ThemeProvider } from './ThemeContext'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          {children}
          <Toaster position="top-right" richColors />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
