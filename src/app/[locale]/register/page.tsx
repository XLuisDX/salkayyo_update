import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { RegisterForm } from '@/components/auth/RegisterForm'

interface RegisterPageProps {
  params: Promise<{ locale: string }>
}

export const metadata: Metadata = {
  title: 'Register',
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <RegisterForm />
    </div>
  )
}
