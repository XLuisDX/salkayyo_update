'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Clock, Loader2, Send } from 'lucide-react'
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

function createContactSchema(tv: ReturnType<typeof useTranslations>) {
  return z.object({
    name: z.string().min(2, tv('minLength', { min: 2 })),
    email: z.string().email(tv('email')),
    subject: z.string().min(3, tv('minLength', { min: 3 })),
    message: z.string().min(10, tv('minLength', { min: 10 })),
  })
}

type ContactFormValues = z.infer<ReturnType<typeof createContactSchema>>

export default function ContactPage() {
  const t = useTranslations('contact')
  const tFooter = useTranslations('footer')
  const tv = useTranslations('validation')
  const [loading, setLoading] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(createContactSchema(tv)),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      toast.success(t('success'))
      form.reset()
    } catch (error) {
      console.error('Error sending contact message:', error)
      toast.error(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <LogoWatermarks />
      <div className="container relative z-10 py-8">
        <PageHeader title={tFooter('contact')} description={t('subtitle')} />

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Info Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8">
              <h2 className="text-xl font-bold mb-2">{t('getInTouch')}</h2>
              <p className="text-muted-foreground text-sm mb-6">
                {t('getInTouchDescription')}
              </p>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t('emailUs')}</h3>
                    <p className="text-sm text-muted-foreground">{t('supportEmail')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t('responseTime')}</h3>
                    <p className="text-sm text-muted-foreground">{t('responseTimeValue')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('sendMessage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('name')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('namePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('subject')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('subjectPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('sending')}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t('send')}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
