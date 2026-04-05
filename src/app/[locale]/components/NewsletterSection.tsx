'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function NewsletterSection() {
  const t = useTranslations('newsletter')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success(t('success'))
    setEmail('')
    setLoading(false)
  }

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-[#0a0f14] noise"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-[#99FF00]/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-[#99FF00]/5 rounded-full blur-[100px]" />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />
          </div>

          {/* Content */}
          <div className="relative px-6 py-20 md:px-16 md:py-28">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#99FF00]/10 mb-8"
              >
                <Mail className="h-9 w-9 text-[#99FF00]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-white/70 text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-[#99FF00]" />
                  {t('badge')}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight"
              >
                {t('title')}{' '}
                <span className="gradient-text">{t('titleHighlight')}</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white/50 mb-10 text-lg max-w-md mx-auto"
              >
                {t('subtitle')}
              </motion.p>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input
                    type="email"
                    placeholder={t('placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 pr-4 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-[#99FF00] focus-visible:border-[#99FF00]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="h-14 px-8 rounded-2xl bg-[#99FF00] text-[#0a0f14] hover:bg-[#b8ff4d] font-semibold btn-shine"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {t('subscribe')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.form>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-white/30 text-sm"
              >
                {t('disclaimer')}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
