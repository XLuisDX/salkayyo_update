import { Button } from '@react-email/components'
import * as React from 'react'

interface EmailButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
}

export const EmailButton = ({
  href,
  children,
  variant = 'primary',
}: EmailButtonProps) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return primaryButton
      case 'secondary':
        return secondaryButton
      case 'outline':
        return outlineButton
      default:
        return primaryButton
    }
  }

  return (
    <Button href={href} style={getStyles()}>
      {children}
    </Button>
  )
}

// Lime accent color: #99FF00
const primaryButton = {
  backgroundColor: '#99FF00',
  color: '#000000',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '14px',
  letterSpacing: '0.5px',
}

const secondaryButton = {
  backgroundColor: '#262626',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '14px',
  letterSpacing: '0.5px',
}

const outlineButton = {
  backgroundColor: 'transparent',
  color: '#99FF00',
  padding: '12px 30px',
  borderRadius: '8px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '14px',
  letterSpacing: '0.5px',
  border: '2px solid #99FF00',
}

export default EmailButton
