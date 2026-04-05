import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

interface ForgotPasswordPageProps {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'Reset Password',
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <ForgotPasswordForm />
    </div>
  )
}
