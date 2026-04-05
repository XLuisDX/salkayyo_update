import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { LoginForm } from '@/components/auth/LoginForm'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'Login',
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <LoginForm />
    </div>
  )
}
