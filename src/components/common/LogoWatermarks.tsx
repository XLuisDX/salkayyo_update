'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface LogoWatermarksProps {
  className?: string
}

export function LogoWatermarks({ className = '' }: LogoWatermarksProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        className="absolute top-[5%] right-[10%] opacity-[0.03] dark:opacity-[0.02]"
        animate={{ rotate: [0, 3, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src="/favicon.png" alt="" width={200} height={200} className="select-none dark:hidden" />
        <Image src="/negativo.png" alt="" width={200} height={200} className="select-none hidden dark:block" />
      </motion.div>
      <motion.div
        className="absolute bottom-[10%] left-[5%] opacity-[0.02] dark:opacity-[0.015]"
        animate={{ rotate: [0, -2, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src="/favicon.png" alt="" width={150} height={150} className="select-none dark:hidden" />
        <Image src="/negativo.png" alt="" width={150} height={150} className="select-none hidden dark:block" />
      </motion.div>
    </div>
  )
}
