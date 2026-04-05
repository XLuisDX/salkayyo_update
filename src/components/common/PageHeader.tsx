'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  badge?: string
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
    >
      <div>
        {badge && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-block px-3 py-1.5 mb-4 rounded-full bg-accent/10 text-accent text-sm font-medium"
          >
            {badge}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg mt-3 max-w-xl"
          >
            {description}
          </motion.p>
        )}
      </div>
      {action && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
