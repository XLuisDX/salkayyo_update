'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true)

    try {
      await login(data.email, data.password)
      toast.success(t('loginSuccess'))
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      const firebaseError = error as { code?: string; message?: string }
      if (firebaseError.code === 'auth/invalid-credential') {
        toast.error(t('invalidCredentials'))
      } else {
        toast.error(firebaseError.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[440px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Link href="/" className="inline-block mb-8">
            <Image
              src="/favicon.png"
              alt="Saklayyo"
              width={120}
              height={50}
              className="dark:hidden mx-auto"
            />
            <Image
              src="/logo-email.png"
              alt="Saklayyo"
              width={120}
              height={40}
              className="hidden dark:block mx-auto"
            />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t('login')}
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter your credentials to continue
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('email')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="h-13 pl-12 pr-4 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">{t('password')}</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-accent hover:text-accent/80 transition-colors"
                      >
                        {t('forgotPassword')}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="h-13 pl-12 pr-4 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-13 rounded-xl font-semibold bg-accent text-accent-foreground hover:bg-accent/90 btn-shine mt-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {t('signIn')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-accent font-medium hover:text-accent/80 transition-colors">
                {t('signUp')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
