import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase, EmailButton } from '../components'

interface WelcomeEmailProps {
  name: string
  appUrl?: string
}

export const WelcomeEmail = ({
  name,
  appUrl = 'https://saklayyo.com',
}: WelcomeEmailProps) => {
  return (
    <EmailBase preview={`Welcome to Saklayyo Store, ${name}!`}>
      {/* Welcome Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>✨ Welcome</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        Welcome to <span style={accentText}>Saklayyo</span>, {name}!
      </Heading>

      <Text style={paragraph}>
        We&apos;re thrilled to have you join our community of savvy shoppers. Your
        account has been successfully created and you&apos;re ready to explore our
        curated collection.
      </Text>

      <Hr style={divider} />

      {/* Features */}
      <Section style={featuresSection}>
        <Text style={featureTitle}>What you can do now:</Text>

        <Section style={feature}>
          <Text style={featureIcon}>🛍️</Text>
          <Text style={featureText}>
            <strong>Shop Exclusive Products</strong>
            <br />
            Browse our premium collection with competitive prices
          </Text>
        </Section>

        <Section style={feature}>
          <Text style={featureIcon}>📦</Text>
          <Text style={featureText}>
            <strong>Track Your Orders</strong>
            <br />
            Real-time updates on your purchases
          </Text>
        </Section>

        <Section style={feature}>
          <Text style={featureIcon}>💰</Text>
          <Text style={featureText}>
            <strong>Secure Payments</strong>
            <br />
            Pay with Stripe or PayPal
          </Text>
        </Section>
      </Section>

      <Hr style={divider} />

      {/* CTA */}
      <Section style={ctaSection}>
        <EmailButton href={`${appUrl}/products`}>
          Start Shopping
        </EmailButton>
      </Section>

      <Text style={smallText}>
        Questions? Simply reply to this email — we&apos;re here to help!
      </Text>
    </EmailBase>
  )
}

// Styles
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

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const featuresSection = {
  padding: '0',
}

const featureTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 24px 0',
}

const feature = {
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'flex-start',
}

const featureIcon = {
  fontSize: '24px',
  margin: '0 16px 0 0',
  lineHeight: '1',
}

const featureText = {
  color: '#d4d4d4',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const smallText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
}

export default WelcomeEmail
