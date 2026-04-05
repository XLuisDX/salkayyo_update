'use client'

import { motion } from 'framer-motion'

interface LoadingProps {
  text?: string
  fullScreen?: boolean
}

export function Loading({ text, fullScreen = false }: LoadingProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-6"
    >
      {/* Animated Logo/Spinner */}
      <div className="relative">
        <motion.div
          className="h-16 w-16 rounded-2xl bg-accent/20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-2 rounded-xl bg-accent"
          animate={{
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50"
      >
        {content}
      </motion.div>
    )
  }

  return (
    <div className="flex items-center justify-center py-20">
      {content}
    </div>
  )
}
