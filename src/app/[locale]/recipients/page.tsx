'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { MapPin, Plus, Trash2, Edit, Star } from 'lucide-react'
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Recipient } from '@/types'
import { RecipientsService } from '@/services/recipients.service'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Loading } from '@/components/common/Loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export default function RecipientsPage() {
  const t = useTranslations('recipients')
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/recipients')
      return
    }

    const loadRecipients = async () => {
      if (!user) return
      try {
        const data = await RecipientsService.getByUserId(user.id)
        setRecipients(data)
      } catch (error) {
        console.error('Error loading recipients:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadRecipients()
    }
  }, [user, authLoading, router])

  const handleDelete = async (id: string) => {
    try {
      await RecipientsService.delete(id)
      setRecipients((prev) => prev.filter((r) => r.id !== id))
      toast.success(t('deleteSuccess'))
    } catch (error) {
      console.error('Error deleting recipient:', error)
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await RecipientsService.setAsDefault(id)
      setRecipients((prev) =>
        prev.map((r) => ({
          ...r,
          isDefault: r.id === id,
        }))
      )
      toast.success('Default address updated')
    } catch (error) {
      console.error('Error setting default:', error)
      toast.error('Failed to update default address')
    }
  }

  if (authLoading || loading) {
    return <Loading />
  }

  if (!user) {
    return <Loading />
  }

  return (
    <div className="container py-8 max-w-3xl">
      <PageHeader
        title={t('title')}
        action={
          <Link href="/recipients/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('add')}
            </Button>
          </Link>
        }
      />

      {recipients.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={t('noRecipients')}
          description="Add a shipping address to speed up checkout"
          action={
            <Link href="/recipients/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('add')}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <motion.div
              key={recipient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{recipient.fullName}</h3>
                        {recipient.isDefault && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {t('default')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{recipient.address}</p>
                      <p className="text-muted-foreground">
                        {recipient.city}, {recipient.state} {recipient.zipCode}
                      </p>
                      <p className="text-muted-foreground">{recipient.country}</p>
                      <p className="text-muted-foreground mt-2">{recipient.phone}</p>
                    </div>

                    <div className="flex gap-2">
                      {!recipient.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(recipient.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Link href={`/recipients/${recipient.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('delete')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('confirmDelete')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(recipient.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
