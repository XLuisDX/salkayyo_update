import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailBaseProps {
  preview: string
  children: React.ReactNode
  showFooter?: boolean
}

export const EmailBase = ({
  preview,
  children,
  showFooter = true,
}: EmailBaseProps) => {
  const currentYear = new Date().getFullYear()

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://saklayyo.com/logo.png"
              width="150"
              height="40"
              alt="Saklayyo"
              style={logo}
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          {showFooter && (
            <Section style={footer}>
              <Text style={footerText}>
                © {currentYear} Saklayyo Store. All rights reserved.
              </Text>
              <Text style={footerLinks}>
                Need help? Contact us at support@saklayyo.com
              </Text>
              <Text style={footerAddress}>
                Saklayyo Store • Your Premium Shopping Destination
              </Text>
            </Section>
          )}
        </Container>
      </Body>
    </Html>
  )
}

// Styles - Luxury Minimal Design
const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#141414',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '16px',
  overflow: 'hidden' as const,
  border: '1px solid #262626',
}

const header = {
  backgroundColor: '#0a0a0a',
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #262626',
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '40px',
}

const footer = {
  backgroundColor: '#0a0a0a',
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderTop: '1px solid #262626',
}

const footerText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
}

const footerLinks = {
  color: '#888888',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
}

const footerAddress = {
  color: '#444444',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '0',
}

export default EmailBase
