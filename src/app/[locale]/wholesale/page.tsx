'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Package, Mail, Phone, Building, Loader2, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { LogoWatermarks } from '@/components/common/LogoWatermarks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

function createWholesaleSchema(tv: ReturnType<typeof useTranslations>) {
  return z.object({
    companyName: z.string().min(2, tv('required')),
    contactName: z.string().min(2, tv('required')),
    email: z.string().email(tv('email')),
    phone: z.string().min(7, tv('phone')),
    message: z.string().min(10, tv('minLength', { min: 10 })),
  })
}

type WholesaleFormValues = z.infer<ReturnType<typeof createWholesaleSchema>>

export default function WholesalePage() {
  const t = useTranslations('wholesale')
  const tv = useTranslations('validation')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<WholesaleFormValues>({
    resolver: zodResolver(createWholesaleSchema(tv)),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      message: '',
    },
  })

  const onSubmit = async (data: WholesaleFormValues) => {
    setLoading(true)

    try {
      const response = await fetch('/api/email/wholesale-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit wholesale request')
      }

      toast.success(t('quoteSubmitted'))
      setSubmitted(true)
    } catch (error) {
      console.error('Wholesale request error:', error)
      toast.error(t('requestError'))
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: Package,
      title: t('benefitBulkTitle'),
      description: t('benefitBulkDescription'),
    },
    {
      icon: Building,
      title: t('benefitSupportTitle'),
      description: t('benefitSupportDescription'),
    },
    {
      icon: Mail,
      title: t('benefitQuotesTitle'),
      description: t('benefitQuotesDescription'),
    },
    {
      icon: Phone,
      title: t('benefitPriorityTitle'),
      description: t('benefitPriorityDescription'),
    },
  ]

  return (
    <div className="relative overflow-hidden">
      <LogoWatermarks />
      <div className="container relative z-10 py-8">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      />

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8">
            <h2 className="text-2xl font-bold mb-4">{t('whyPartner')}</h2>
            <p className="text-muted-foreground mb-8">{t('description')}</p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('minOrder')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>{t('standardProducts')}</span>
                  <span className="font-semibold">{t('standardUnits')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>{t('customProducts')}</span>
                  <span className="font-semibold">{t('customUnits')}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>{t('mixedOrders')}</span>
                  <span className="font-semibold">{t('mixedValue')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('requestQuote')}</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('requestSubmitted')}</h3>
                  <p className="text-muted-foreground">
                    {t('requestSubmittedDescription')}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSubmitted(false)
                      form.reset()
                    }}
                  >
                    {t('submitAnother')}
                  </Button>
                </motion.div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('companyName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('companyNamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contactName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('contactNamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={t('emailPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('phone')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('phonePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('message')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('messagePlaceholder')}
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('submitting')}
                        </>
                      ) : (
                        t('requestQuote')
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  )
}
