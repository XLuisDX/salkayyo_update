'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, MapPin, User, Phone, Home, ArrowRight } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { useAuth } from '@/context/AuthContext'
import { Recipient, RecipientCreateData } from '@/types'
import { RecipientsService } from '@/services/recipients.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

const recipientSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(3, 'ZIP code must be at least 3 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  phone: z.string().min(7, 'Phone must be at least 7 characters'),
  isDefault: z.boolean(),
})

type RecipientFormValues = z.input<typeof recipientSchema>

interface RecipientFormProps {
  recipient?: Recipient
  onSuccess?: () => void
}

export function RecipientForm({ recipient, onSuccess }: RecipientFormProps) {
  const t = useTranslations('recipients')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const isEditing = !!recipient

  const form = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientSchema),
    defaultValues: {
      fullName: recipient?.fullName || '',
      address: recipient?.address || '',
      city: recipient?.city || '',
      state: recipient?.state || '',
      zipCode: recipient?.zipCode || '',
      country: recipient?.country || '',
      phone: recipient?.phone || '',
      isDefault: recipient?.isDefault || false,
    },
  })

  const onSubmit = async (data: RecipientFormValues) => {
    if (!user) return

    setLoading(true)

    try {
      if (isEditing && recipient) {
        await RecipientsService.update(recipient.id, data)
        toast.success(t('updateSuccess'))
      } else {
        await RecipientsService.create(user.id, data)
        toast.success(t('addSuccess'))
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/recipients')
      }
    } catch (error: any) {
      console.error('Recipient error:', error)
      toast.error(error.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
          <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{isEditing ? t('edit') : t('add')}</h2>
            <p className="text-sm text-muted-foreground">
              {isEditing ? 'Update shipping address details' : 'Add a new shipping address'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('fullName')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="John Doe"
                        className="h-12 pl-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('address')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="123 Main Street, Apt 4B"
                        className="h-12 pl-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City & State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('city')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="New York"
                        className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('state')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="NY"
                        className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ZIP & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('zipCode')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10001"
                        className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('country')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="United States"
                        className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('phone')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="+1 234 567 8900"
                        className="h-12 pl-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Set as Default */}
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl bg-muted/30 p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="font-medium cursor-pointer">
                      {t('setDefault')}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Use this address as your default shipping destination
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl font-semibold bg-accent text-accent-foreground hover:bg-accent/90 btn-shine"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {tCommon('save')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl font-medium"
                onClick={() => router.back()}
              >
                {tCommon('cancel')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  )
}
