'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getErrorMessage, isExpectedAuthError } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

function createVerifyCodeSchema(tv: ReturnType<typeof useTranslations>) {
  return z.object({
    code: z.string().min(1, tv('required')),
  })
}

type VerifyCodeFormValues = z.infer<ReturnType<typeof createVerifyCodeSchema>>

export default function VerifyEmailPage() {
  const t = useTranslations('auth')
  const tv = useTranslations('validation')
  const { user, firebaseUser, resendVerification, verifyEmailCode } = useAuth()
  const [resending, setResending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(createVerifyCodeSchema(tv)),
    defaultValues: { code: '' },
  })

  const handleResend = async () => {
    setResending(true)
    try {
      await resendVerification()
      setSent(true)
      toast.success(t('verificationSent'))
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setResending(false)
    }
  }

  const onSubmit = async (data: VerifyCodeFormValues) => {
    setVerifying(true)
    try {
      await verifyEmailCode(data.code.trim())
      toast.success(t('emailVerified'))
    } catch (error: unknown) {
      if (!isExpectedAuthError(error)) {
        console.error('Verify email code error:', error)
      }
      toast.error(t('invalidVerificationCode'))
    } finally {
      setVerifying(false)
    }
  }

  const isVerified = user?.verified || firebaseUser?.emailVerified

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {isVerified ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <Mail className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isVerified ? t('emailVerified') : t('verifyEmail')}
            </CardTitle>
            <CardDescription>
              {isVerified
                ? t('emailVerifiedDescription')
                : t('verificationLinkSentTo', { email: user?.email || t('email') })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerified ? (
              <Link href="/" className="block">
                <Button className="w-full">{t('goToHome')}</Button>
              </Link>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  {t('checkVerificationInstructions')}
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('verificationCode')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('verificationCodePlaceholder')}
                              autoComplete="one-time-code"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={verifying}>
                      {verifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('sending')}
                        </>
                      ) : (
                        t('verify')
                      )}
                    </Button>
                  </form>
                </Form>

                {sent ? (
                  <div className="text-center text-sm text-green-600 dark:text-green-400">
                    {t('verificationEmailSentCheckInbox')}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={resending}
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('sending')}
                      </>
                    ) : (
                      t('resendVerification')
                    )}
                  </Button>
                )}

                <div className="text-center">
                  <Link href="/login" className="text-sm text-primary hover:underline">
                    {t('backToLogin')}
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
