import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase, EmailButton } from '../components'

interface VerifyEmailProps {
  name: string
  verificationLink: string
}

export const VerifyEmail = ({
  name,
  verificationLink,
}: VerifyEmailProps) => {
  return (
    <EmailBase preview="Verify your email address for Saklayyo Store">
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>📧 Email Verification</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        Verify your email
      </Heading>

      <Text style={paragraph}>
        Hi {name || 'there'},
      </Text>

      <Text style={paragraph}>
        Thanks for signing up for Saklayyo Store! Please verify your email
        address to complete your registration and unlock all features.
      </Text>

      {/* CTA */}
      <Section style={ctaSection}>
        <EmailButton href={verificationLink}>
          Verify Email Address
        </EmailButton>
      </Section>

      <Hr style={divider} />

      {/* Alternative Link */}
      <Text style={smallText}>
        If the button doesn&apos;t work, copy and paste this link into your browser:
      </Text>
      <Text style={linkText}>
        {verificationLink}
      </Text>

      <Hr style={divider} />

      {/* Security Notice */}
      <Section style={noticeBox}>
        <Text style={noticeText}>
          🔒 This link will expire in 24 hours. If you didn&apos;t create an account
          with Saklayyo Store, you can safely ignore this email.
        </Text>
      </Section>
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

const paragraph = {
  color: '#a3a3a3',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const smallText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
}

const linkText = {
  color: '#99FF00',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
  wordBreak: 'break-all' as const,
}

const noticeBox = {
  backgroundColor: '#1a1a1a',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #262626',
}

const noticeText = {
  color: '#888888',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

export default VerifyEmail
