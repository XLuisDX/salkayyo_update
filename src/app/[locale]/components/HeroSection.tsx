'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const t = useTranslations()

  return (
    <section className="container">
      <div className="relative overflow-hidden rounded-3xl bg-[#101820] min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#101820] via-[#1a2a3a] to-[#101820]" />

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#99FF00]/30 via-[#99FF00]/10 to-transparent blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-[#99FF00]/20 via-[#99FF00]/5 to-transparent blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -20, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-[40%] left-[50%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-[#99FF00]/15 to-transparent blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Logo Watermarks */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-[10%] right-[5%] opacity-[0.03]"
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image src="/negativo.png" alt="" width={300} height={100} className="select-none" />
          </motion.div>
          {/* <motion.div
            className="absolute bottom-[15%] left-[5%] opacity-[0.02]"
            animate={{ rotate: [0, -3, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image src="/negativo.png" alt="" width={250} height={85} className="select-none" />
          </motion.div> */}
          <motion.div
            className="absolute top-[50%] right-[30%] opacity-[0.015]"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image src="/negativo.png" alt="" width={200} height={70} className="select-none" />
          </motion.div>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Ring 1 */}
          <motion.div
            className="absolute top-[15%] right-[15%] w-32 h-32 md:w-48 md:h-48 rounded-full border border-[#99FF00]/20"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          {/* Ring 2 */}
          <motion.div
            className="absolute top-[20%] right-[20%] w-24 h-24 md:w-36 md:h-36 rounded-full border border-[#99FF00]/30"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          {/* Dots pattern */}
          <motion.div
            className="absolute bottom-[20%] right-[10%] grid grid-cols-4 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#99FF00]/40"
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
          {/* Floating line */}
          <motion.div
            className="absolute top-[60%] right-[25%] w-32 h-[1px] bg-gradient-to-r from-transparent via-[#99FF00]/50 to-transparent"
            animate={{
              x: [0, 50, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Small floating squares */}
          <motion.div
            className="absolute top-[30%] right-[40%] w-4 h-4 border border-[#99FF00]/30 rotate-45"
            animate={{
              y: [0, -20, 0],
              rotate: [45, 90, 45],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-[35%] right-[30%] w-3 h-3 bg-[#99FF00]/20 rotate-45"
            animate={{
              y: [0, 15, 0],
              rotate: [45, 0, 45],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl px-8 md:px-16 lg:px-20"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center gap-2 mb-8"
              >
                <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-[#99FF00]/10 text-[#99FF00] border border-[#99FF00]/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  {t('hero.badge')}
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white leading-[1.1]"
              >
                {t('hero.title1')}
                <br />
                <span className="relative">
                  <span className="relative z-10 bg-gradient-to-r from-[#99FF00] via-[#b8ff4d] to-[#99FF00] bg-clip-text text-transparent">
                    {t('hero.title2')}
                  </span>
                </span>
                <br />
                {t('hero.title3')}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg md:text-xl text-white/60 mb-10 max-w-md leading-relaxed"
              >
                {t('hero.subtitle')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/products">
                  <Button
                    size="lg"
                    className="group gap-3 bg-[#99FF00] text-[#101820] hover:bg-[#b8ff4d] font-semibold px-8 h-14 text-base transition-all duration-300 hover:shadow-[0_0_30px_rgba(153,255,0,0.3)]"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {t('nav.products')}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-semibold px-8 h-14 text-base backdrop-blur-sm transition-all duration-300"
                  >
                    {t('nav.categories')}
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex gap-10 mt-14 pt-10 border-t border-white/10"
              >
                <div>
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-white/40 mt-1">{t('hero.stats.products')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">24h</div>
                  <div className="text-sm text-white/40 mt-1">{t('hero.stats.delivery')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#99FF00]">5K+</div>
                  <div className="text-sm text-white/40 mt-1">{t('hero.stats.customers')}</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#101820] to-transparent pointer-events-none" />
      </div>
    </section>
  )
}
