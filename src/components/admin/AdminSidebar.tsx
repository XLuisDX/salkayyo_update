'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Menu,
  LogOut,
  Home,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { Link, usePathname } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/admin',
    labelKey: 'dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/products',
    labelKey: 'products',
    icon: Package,
  },
  {
    href: '/admin/categories',
    labelKey: 'categories',
    icon: FolderTree,
  },
] as const

interface NavContentProps {
  onClose?: () => void
  user: { name?: string; email?: string } | null
  pathname: string
  t: (key: string) => string
  logout: () => void
}

function NavContent({ onClose, user, pathname, t, logout }: NavContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Image
                src="/favicon.png"
                alt="Saklayyo"
                width={24}
                height={24}
                className="dark:hidden"
              />
              <Image
                src="/logo-email.png"
                alt="Saklayyo"
                width={24}
                height={24}
                className="hidden dark:block"
              />
            </div>
            <div className="hidden lg:block">
              <p className="font-bold text-sm">Saklayyo</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 lg:px-4">
        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Menu
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t mt-auto">
        <Link href="/" onClick={onClose}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
            <Home className="h-4 w-4" />
            <span>{t('backToHome')}</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = useTranslations('admin')
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:z-50 bg-card border-r">
        <NavContent user={user} pathname={pathname} t={t} logout={logout} />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-md border-b flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Image
              src="/favicon.png"
              alt="Saklayyo"
              width={20}
              height={20}
              className="dark:hidden"
            />
            <Image
              src="/logo-email.png"
              alt="Saklayyo"
              width={20}
              height={20}
              className="hidden dark:block"
            />
          </div>
          <span className="font-semibold text-sm">Admin</span>
        </Link>

        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-2xl animate-in slide-in-from-right duration-300">
            <NavContent
              onClose={() => setMobileOpen(false)}
              user={user}
              pathname={pathname}
              t={t}
              logout={logout}
            />
          </div>
        </div>
      )}
    </>
  )
}
