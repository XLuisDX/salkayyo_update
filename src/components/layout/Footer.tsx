'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ArrowUpRight, Send } from "lucide-react";

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { href: "/products", label: t("nav.products") },
      { href: "/categories", label: t("nav.categories") },
      { href: "/wholesale", label: t("nav.wholesale") },
    ],
    account: [
      { href: "/profile", label: t("nav.profile") },
      { href: "/orders", label: t("nav.orders") },
      { href: "/cart", label: t("nav.cart") },
    ],
    legal: [
      { href: "/privacy", label: t("footer.privacy") },
      { href: "/terms", label: t("footer.terms") },
      { href: "/contact", label: t("footer.contact") },
    ],
  };

  return (
    <footer className="relative mt-20 border-t border-border/40 bg-gradient-to-b from-transparent to-muted/30">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-block transition-opacity hover:opacity-80"
              >
                <Image
                  src="/favicon.png"
                  alt="Saklayyo"
                  width={100}
                  height={45}
                  className="dark:hidden"
                />
                <Image
                  src="/logo-email.png"
                  alt="Saklayyo"
                  width={100}
                  height={45}
                  className="hidden dark:block"
                />
              </Link>
              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                {t("footer.brandDescription")}
              </p>
            </div>

            {/* Newsletter Input Simplificado */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">
                {t("footer.subscribeTitle") || "Stay updated"}
              </h4>
              <div className="flex max-w-md gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 bg-background border border-border px-4 py-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button className="bg-foreground text-background p-2 rounded-full hover:scale-105 transition-transform">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Links Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { title: t("footer.shop"), links: footerLinks.shop },
                { title: t("footer.account"), links: footerLinks.account },
                { title: t("footer.legal"), links: footerLinks.legal },
              ].map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-5"
                >
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group relative inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                        >
                          <span>{link.label}</span>
                          <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                          <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/20">
        <div className="container px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">
                &copy; {currentYear} Saklayyo. {t("footer.rights")}
              </p>
            </div>

            {/* Status Pill */}
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-background border border-border/50 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">
                {t("footer.systemsOperational")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}