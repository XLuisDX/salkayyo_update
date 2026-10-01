import { Heading, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailBase, EmailButton } from '../components'

interface WholesaleRequestConfirmationEmailProps {
  contactName: string
  appUrl?: string
}

export const WholesaleRequestConfirmationEmail = ({
  contactName,
  appUrl = 'https://saklayyo.com',
}: WholesaleRequestConfirmationEmailProps) => {
  return (
    <EmailBase preview="We received your wholesale request - Saklayyo Store">
      <Section style={badgeContainer}>
        <Text style={badge}>🏢 Wholesale</Text>
      </Section>

      <Heading style={heading}>
        Thanks, <span style={accentText}>{contactName}</span>!
      </Heading>

      <Text style={paragraph}>
        We&apos;ve received your wholesale quote request and our team is already
        reviewing it. A member of our business team will reach out within
        24-48 hours with a custom quote tailored to your needs.
      </Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          In the meantime, feel free to browse our full catalog to get a
          sense of what we offer.
        </Text>
      </Section>

      <Section style={ctaSection}>
        <EmailButton href={`${appUrl}/products`}>Browse Products</EmailButton>
      </Section>

      <Text style={smallText}>
        Questions in the meantime? Reply to this email or reach us at
        support@saklayyo.com.
      </Text>
    </EmailBase>
  )
}

const badgeContainer = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const badge = {
  backgroundColor: '#1a2e05',
  color: '#99FF00',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  display: 'inline-block',
  margin: '0',
}

const heading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const accentText = {
  color: '#99FF00',
}

const paragraph = {
  color: '#a3a3a3',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const infoBox = {
  backgroundColor: '#1a1a1a',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #262626',
  marginBottom: '32px',
}

const infoText = {
  color: '#d4d4d4',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const smallText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
}

export default WholesaleRequestConfirmationEmail
