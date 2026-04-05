'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Package, Mail, Phone, Building, Loader2, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
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

const wholesaleSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Valid phone is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type WholesaleFormValues = z.infer<typeof wholesaleSchema>

export default function WholesalePage() {
  const t = useTranslations('wholesale')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<WholesaleFormValues>({
    resolver: zodResolver(wholesaleSchema),
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success('Quote request submitted successfully!')
    setSubmitted(true)
    setLoading(false)
  }

  const benefits = [
    {
      icon: Package,
      title: 'Bulk Discounts',
      description: 'Get significant discounts on large orders',
    },
    {
      icon: Building,
      title: 'Business Support',
      description: 'Dedicated account manager for your business',
    },
    {
      icon: Mail,
      title: 'Custom Quotes',
      description: 'Tailored pricing based on your needs',
    },
    {
      icon: Phone,
      title: 'Priority Support',
      description: '24/7 customer support for wholesale partners',
    },
  ]

  return (
    <div className="container py-8">
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
            <h2 className="text-2xl font-bold mb-4">Why Partner With Us?</h2>
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
                  <span>Standard Products</span>
                  <span className="font-semibold">50+ units</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Custom Products</span>
                  <span className="font-semibold">100+ units</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Mixed Orders</span>
                  <span className="font-semibold">$1,000+ value</span>
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
                  <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
                  <p className="text-muted-foreground">
                    We&apos;ll get back to you within 24-48 hours with a custom quote.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSubmitted(false)
                      form.reset()
                    }}
                  >
                    Submit Another Request
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
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Company Inc." {...field} />
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
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@company.com" {...field} />
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
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 234 567 8900" {...field} />
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
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your needs, quantity requirements, and any specific products you're interested in..."
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
                          Submitting...
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
  )
}
