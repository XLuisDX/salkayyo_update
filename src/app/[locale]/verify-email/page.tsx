'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Mail, Loader2, CheckCircle, RefreshCw } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'

export default function VerifyEmailPage() {
  const t = useTranslations('auth')
  const { user, firebaseUser, resendVerification, checkEmailVerified } = useAuth()
  const [resending, setResending] = useState(false)
  const [checking, setChecking] = useState(false)
  const [sent, setSent] = useState(false)

  const isVerified = user?.verified || firebaseUser?.emailVerified

  // If the user clicks the verification link in another tab, pick up the
  // new status as soon as they come back to this one.
  useEffect(() => {
    if (isVerified) return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkEmailVerified().catch(() => {})
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isVerified, checkEmailVerified])

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

  const handleCheck = async () => {
    setChecking(true)
    try {
      const verified = await checkEmailVerified()
      if (verified) {
        toast.success(t('emailVerified'))
      } else {
        toast.error(t('notVerifiedYet'))
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    } finally {
      setChecking(false)
    }
  }

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

                <Button className="w-full" onClick={handleCheck} disabled={checking}>
                  {checking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('sending')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t('iVerifiedCheckNow')}
                    </>
                  )}
                </Button>

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
