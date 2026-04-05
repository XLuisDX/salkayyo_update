'use client'

import { useTranslations } from 'next-intl'
import { MapPin, Plus, Check } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Recipient } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface RecipientSelectorProps {
  recipients: Recipient[]
  selectedRecipient: Recipient | null
  onSelect: (recipient: Recipient) => void
  loading?: boolean
}

export function RecipientSelector({
  recipients,
  selectedRecipient,
  onSelect,
  loading = false,
}: RecipientSelectorProps) {
  const t = useTranslations('checkout')
  const tRecipients = useTranslations('recipients')

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (recipients.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">{tRecipients('noRecipients')}</p>
        <Link href="/recipients/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('addNewRecipient')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recipients.map((recipient) => (
        <Card
          key={recipient.id}
          className={cn(
            'cursor-pointer transition-all hover:border-primary',
            selectedRecipient?.id === recipient.id && 'border-primary ring-1 ring-primary'
          )}
          onClick={() => onSelect(recipient)}
        >
          <CardContent className="p-4 flex items-start gap-4">
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                selectedRecipient?.id === recipient.id
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              )}
            >
              {selectedRecipient?.id === recipient.id && (
                <Check className="h-3 w-3 text-primary-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{recipient.fullName}</p>
                {recipient.isDefault && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {tRecipients('default')}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{recipient.address}</p>
              <p className="text-sm text-muted-foreground">
                {recipient.city}, {recipient.state} {recipient.zipCode}
              </p>
              <p className="text-sm text-muted-foreground">{recipient.country}</p>
              <p className="text-sm text-muted-foreground mt-1">{recipient.phone}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Link href="/recipients/new" className="block">
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t('addNewRecipient')}
        </Button>
      </Link>
    </div>
  )
}
