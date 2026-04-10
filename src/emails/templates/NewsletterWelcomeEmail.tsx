import {
  Column,
  Heading,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase, EmailButton } from '../components'

interface NewsletterWelcomeEmailProps {
  email: string
  unsubscribeLink: string
  appUrl?: string
}

export const NewsletterWelcomeEmail = ({
  email,
  unsubscribeLink,
  appUrl = 'https://saklayyo.com',
}: NewsletterWelcomeEmailProps) => {
  return (
    <EmailBase preview="Welcome to Saklayyo Newsletter - Exclusive deals await!">
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>📬 Newsletter</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        You&apos;re now on the <span style={accentText}>VIP list</span>!
      </Heading>

      <Text style={paragraph}>
        Thanks for subscribing! You&apos;ve just unlocked access to exclusive deals,
        early access to new products, and insider updates from Saklayyo Store.
      </Text>

      {/* What to Expect */}
      <Section style={expectSection}>
        <Text style={expectTitle}>What to expect:</Text>

        <Row style={expectRow}>
          <Column style={expectIconCol}>
            <Text style={expectIcon}>🎁</Text>
          </Column>
          <Column>
            <Text style={expectItemTitle}>Exclusive Discounts</Text>
            <Text style={expectItemDesc}>
              Subscriber-only deals you won&apos;t find anywhere else
            </Text>
          </Column>
        </Row>

        <Row style={expectRow}>
          <Column style={expectIconCol}>
            <Text style={expectIcon}>🚀</Text>
          </Column>
          <Column>
            <Text style={expectItemTitle}>Early Access</Text>
            <Text style={expectItemDesc}>
              Be the first to know about new arrivals and launches
            </Text>
          </Column>
        </Row>

        <Row style={expectRow}>
          <Column style={expectIconCol}>
            <Text style={expectIcon}>💡</Text>
          </Column>
          <Column>
            <Text style={expectItemTitle}>Style Tips & Trends</Text>
            <Text style={expectItemDesc}>
              Curated content and shopping inspiration
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {/* First-time Offer */}
      <Section style={offerBox}>
        <Text style={offerBadge}>SUBSCRIBER EXCLUSIVE</Text>
        <Text style={offerTitle}>10% OFF</Text>
        <Text style={offerSubtitle}>Your First Order</Text>
        <Text style={offerCode}>Use code: WELCOME10</Text>
        <EmailButton href={`${appUrl}/products`}>
          Shop Now
        </EmailButton>
        <Text style={offerExpiry}>
          Valid for 30 days • One-time use
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Social Links */}
      <Section style={socialSection}>
        <Text style={socialTitle}>Stay Connected</Text>
        <Text style={socialText}>
          Follow us on social media for daily inspiration
        </Text>
        <Row style={socialIcons}>
          <Column style={socialIconCol}>
            <Text style={socialIcon}>📷</Text>
            <Text style={socialLabel}>Instagram</Text>
          </Column>
          <Column style={socialIconCol}>
            <Text style={socialIcon}>🐦</Text>
            <Text style={socialLabel}>Twitter</Text>
          </Column>
          <Column style={socialIconCol}>
            <Text style={socialIcon}>📘</Text>
            <Text style={socialLabel}>Facebook</Text>
          </Column>
        </Row>
      </Section>

      {/* Unsubscribe */}
      <Text style={unsubscribeText}>
        Subscribed with {email}. If you no longer wish to receive these emails,
        you can{' '}
        <a href={unsubscribeLink} style={unsubscribeLink_}>
          unsubscribe here
        </a>
        .
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

const expectSection = {
  backgroundColor: '#1a1a1a',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #262626',
}

const expectTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px 0',
}

const expectRow = {
  marginBottom: '16px',
}

const expectIconCol = {
  width: '48px',
  verticalAlign: 'top' as const,
}

const expectIcon = {
  fontSize: '24px',
  margin: '0',
}

const expectItemTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px 0',
}

const expectItemDesc = {
  color: '#888888',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const offerBox = {
  backgroundColor: '#0a0a0a',
  padding: '40px',
  borderRadius: '16px',
  border: '2px solid #99FF00',
  textAlign: 'center' as const,
}

const offerBadge = {
  color: '#99FF00',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0 0 16px 0',
}

const offerTitle = {
  color: '#99FF00',
  fontSize: '48px',
  fontWeight: '800',
  margin: '0',
  lineHeight: '1',
}

const offerSubtitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '600',
  margin: '8px 0 24px 0',
}

const offerCode = {
  backgroundColor: '#1a2e05',
  color: '#99FF00',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '700',
  letterSpacing: '3px',
  display: 'inline-block',
  margin: '0 0 24px 0',
}

const offerExpiry = {
  color: '#666666',
  fontSize: '12px',
  margin: '16px 0 0 0',
}

const socialSection = {
  textAlign: 'center' as const,
}

const socialTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const socialText = {
  color: '#888888',
  fontSize: '14px',
  margin: '0 0 24px 0',
}

const socialIcons = {
  padding: '0 40px',
}

const socialIconCol = {
  textAlign: 'center' as const,
}

const socialIcon = {
  fontSize: '28px',
  margin: '0 0 8px 0',
}

const socialLabel = {
  color: '#666666',
  fontSize: '12px',
  margin: '0',
}

const unsubscribeText = {
  color: '#444444',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '32px 0 0 0',
  textAlign: 'center' as const,
}

const unsubscribeLink_ = {
  color: '#666666',
  textDecoration: 'underline',
}

export default NewsletterWelcomeEmail
