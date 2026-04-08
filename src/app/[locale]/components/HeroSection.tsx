'use client'

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

const images = [
  "/mobile1.png",
  "/mobile2.png",
  "/mobile3.png",
  "/mobile4.png",
  "/mobile5.png",
];

export function HeroSection() {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="container px-4 md:px-6">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#101820] min-h-[700px] lg:min-h-[800px] flex items-center rounded-sm">
        {/* --- Background Effects (Optimized) --- */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1a2a3a_0%,#101820_100%)]" />

          {/* Animated Orbs */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#99FF00]/20 blur-[120px]"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.05] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>

        {/* --- Main Content Grid --- */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-8 md:px-16 lg:px-20 py-16">
          {/* Left Column: Text & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-8"
          >
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-[#99FF00]/10 border border-[#99FF00]/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#99FF00]" />
              <span className="text-sm font-medium text-[#99FF00] uppercase tracking-wider">
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              {t("hero.title1")}{" "}
              <span className="text-[#99FF00] italic">{t("hero.title2")}</span>
              <br />
              {t("hero.title3")}
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-[#99FF00] text-[#101820] hover:bg-[#b8ff4d] px-8 h-14 rounded-full font-bold group shadow-xl shadow-[#99FF00]/10"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t("nav.products")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  size="lg"
                  variant="ghost"
                  className="border border-white/20 text-white hover:text-white hover:bg-white/10 px-8 h-14 rounded-full backdrop-blur-sm"
                >
                  {t("nav.categories")}
                </Button>
              </Link>
            </div>

            {/* Micro-Stats */}
            <div className="flex items-center gap-8 pt-8 border-t border-white/5">
              {[
                { label: "500+", sub: t("hero.stats.products") },
                { label: "24h", sub: t("hero.stats.delivery") },
                {
                  label: "5K+",
                  sub: t("hero.stats.customers"),
                  highlight: true,
                },
              ].map((stat, i) => (
                <div key={i}>
                  <div
                    className={`text-2xl font-bold ${stat.highlight ? "text-[#99FF00]" : "text-white"}`}
                  >
                    {stat.label}
                  </div>
                  <div className="text-xs text-white/40 uppercase tracking-widest">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Dynamic Mobile Carousel */}
          <div className="relative flex justify-center items-center h-[500px] lg:h-[600px]">
            {/* Decorative Background for Mobile */}
            <div className="absolute inset-0 flex justify-center items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="w-full max-w-[450px] aspect-square rounded-full border border-dashed border-[#99FF00]/20"
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.8, y: 40, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -40, rotate: 5 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative z-20 w-full max-w-[280px] md:max-w-[320px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
              >
                <Image
                  src={images[currentIndex]}
                  alt="Product Showcase"
                  width={600}
                  height={1200}
                  className="w-full h-auto object-contain rounded-md"
                  priority
                />
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* Bottom Decorative Blur */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#101820] to-transparent z-10" />
      </div>
    </section>
  );
}