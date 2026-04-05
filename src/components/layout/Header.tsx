'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  User,
  Menu,
  Search,
  Sun,
  Moon,
  LogOut,
  Package,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Link, usePathname } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { LocaleSwitcher } from './LocaleSwitcher'

export function Header() {
  const t = useTranslations()
  const { user, logout } = useAuth()
  const { getItemCount } = useCart()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/products', label: t('nav.products') },
    { href: '/categories', label: t('nav.categories') },
    { href: '/wholesale', label: t('nav.wholesale') },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const itemCount = getItemCount()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-500',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center group">
              <div className="relative overflow-hidden">
                <Image
                  src="/logo-email.png"
                  alt="Saklayyo"
                  width={45}
                  height={45}
                  className="hidden dark:block transition-transform duration-300 group-hover:scale-105"
                  priority
                />
                <Image
                  src="/favicon.png"
                  alt="Saklayyo"
                  width={45}
                  height={45}
                  className="dark:hidden transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    'relative px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-full',
                    pathname === link.href
                      ? 'text-accent-foreground bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-accent rounded-full -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence mode="wait">
              {isSearchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="hidden md:block overflow-hidden"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t('common.search')}
                      className="h-10 pl-10 pr-4 bg-muted/50 border-0 rounded-full focus-visible:ring-accent"
                      autoFocus
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden md:flex h-10 w-10 rounded-full hover:bg-muted/50"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>
            </motion.div>

            {/* Locale Switcher */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <LocaleSwitcher />
            </motion.div>

            {/* Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-10 w-10 rounded-full hover:bg-muted/50"
              >
                <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>

            {/* Cart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <Link href="/cart" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-muted/50"
                >
                  <ShoppingCart className="h-[18px] w-[18px]" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-accent text-accent-foreground"
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            </motion.div>

            {/* User Menu */}
            {user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-muted/50"
                    >
                      <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-accent">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-base font-semibold text-accent">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/profile" className="flex items-center gap-3 p-2.5">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{t('nav.profile')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/orders" className="flex items-center gap-3 p-2.5">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{t('nav.orders')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/recipients" className="flex items-center gap-3 p-2.5">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{t('nav.recipients')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-xl cursor-pointer text-destructive focus:text-destructive"
                    >
                      <div className="flex items-center gap-3 p-2.5">
                        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{t('nav.logout')}</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="hidden md:flex items-center gap-3"
              >
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="h-10 px-5 rounded-full font-medium hover:bg-muted/50"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="h-10 px-5 rounded-full font-medium bg-accent text-accent-foreground hover:bg-accent/90 btn-shine">
                    {t('nav.register')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-10 w-10 rounded-full hover:bg-muted/50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[400px] p-0 border-0"
              >
                <div className="flex flex-col h-full bg-background">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b">
                    <Image
                      src="/negativo.png"
                      alt="Saklayyo"
                      width={100}
                      height={35}
                      className="hidden dark:block"
                    />
                    <Image
                      src="/favicon.png"
                      alt="Saklayyo"
                      width={100}
                      height={35}
                      className="dark:hidden"
                    />
                  </div>

                  {/* Search */}
                  <div className="p-6 pb-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={t('common.search')}
                        className="h-12 pl-12 pr-4 bg-muted/50 border-0 rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* Navigation */}
                  <nav className="flex-1 px-6 py-2 space-y-1">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center justify-between px-4 py-4 rounded-2xl text-base font-medium transition-all',
                            pathname === link.href
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          )}
                        >
                          {link.label}
                          <ArrowRight className="h-4 w-4 opacity-50" />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>

                  {/* Footer Actions */}
                  {!user && (
                    <div className="p-6 pt-4 border-t space-y-3">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-2xl font-medium"
                        >
                          {t('nav.login')}
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full h-12 rounded-2xl font-medium bg-accent text-accent-foreground hover:bg-accent/90">
                          {t('nav.register')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
