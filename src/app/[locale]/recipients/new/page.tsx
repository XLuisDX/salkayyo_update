'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { RecipientForm } from '@/components/forms/RecipientForm'
import { PageHeader } from '@/components/common/PageHeader'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/ui/button'

export default function NewRecipientPage() {
  const t = useTranslations('recipients')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/recipients/new')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return <Loading />
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Link href="/recipients">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Addresses
        </Button>
      </Link>

      <PageHeader title={t('add')} />

      <RecipientForm />
    </div>
  )
}
