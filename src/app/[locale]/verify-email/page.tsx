'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function VerifyEmailPage() {
  const t = useTranslations('auth')
  const { user, firebaseUser, resendVerification } = useAuth()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    try {
      await resendVerification()
      setSent(true)
      toast.success(t('verificationSent'))
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  const isVerified = firebaseUser?.emailVerified

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
              {isVerified ? 'Email Verified!' : t('verifyEmail')}
            </CardTitle>
            <CardDescription>
              {isVerified
                ? 'Your email has been verified successfully.'
                : `We've sent a verification link to ${user?.email || 'your email'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerified ? (
              <Link href="/" className="block">
                <Button className="w-full">Go to Home</Button>
              </Link>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Click the link in your email to verify your account.
                  If you don&apos;t see it, check your spam folder.
                </p>

                {sent ? (
                  <div className="text-center text-sm text-green-600 dark:text-green-400">
                    Verification email sent! Check your inbox.
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
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
