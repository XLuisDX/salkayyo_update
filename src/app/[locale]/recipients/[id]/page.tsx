'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Recipient } from '@/types'
import { RecipientsService } from '@/services/recipients.service'
import { RecipientForm } from '@/components/forms/RecipientForm'
import { PageHeader } from '@/components/common/PageHeader'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/ui/button'

export default function EditRecipientPage() {
  const params = useParams()
  const t = useTranslations('recipients')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [recipient, setRecipient] = useState<Recipient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    const loadRecipient = async () => {
      try {
        const data = await RecipientsService.getById(params.id as string)
        setRecipient(data)
      } catch (error) {
        console.error('Error loading recipient:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && params.id) {
      loadRecipient()
    }
  }, [user, authLoading, params.id, router])

  if (authLoading || loading) {
    return <Loading />
  }

  if (!recipient) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Address not found</h1>
        <Link href="/recipients">
          <Button>Back to Addresses</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Link href="/recipients">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Addresses
        </Button>
      </Link>

      <PageHeader title={t('edit')} />

      <RecipientForm recipient={recipient} />
    </div>
  )
}
