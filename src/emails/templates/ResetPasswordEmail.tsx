import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase, EmailButton } from '../components'

interface ResetPasswordEmailProps {
  name: string
  resetLink: string
}

export const ResetPasswordEmail = ({
  name,
  resetLink,
}: ResetPasswordEmailProps) => {
  return (
    <EmailBase preview="Reset your password for Saklayyo Store">
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>🔐 Password Reset</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        Reset your password
      </Heading>

      <Text style={paragraph}>
        Hi {name || 'there'},
      </Text>

      <Text style={paragraph}>
        We received a request to reset your password for your Saklayyo Store
        account. Click the button below to create a new password:
      </Text>

      {/* CTA */}
      <Section style={ctaSection}>
        <EmailButton href={resetLink}>
          Reset Password
        </EmailButton>
      </Section>

      <Hr style={divider} />

      {/* Alternative Link */}
      <Text style={smallText}>
        If the button doesn&apos;t work, copy and paste this link into your browser:
      </Text>
      <Text style={linkText}>
        {resetLink}
      </Text>

      <Hr style={divider} />

      {/* Security Notice */}
      <Section style={warningBox}>
        <Text style={warningText}>
          ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour.
          If you didn&apos;t request a password reset, please ignore this email or
          contact support if you have concerns about your account security.
        </Text>
      </Section>

      <Text style={tipsTitle}>Password Tips:</Text>
      <Text style={tipsList}>
        • Use at least 8 characters
        <br />
        • Include uppercase and lowercase letters
        <br />
        • Add numbers and special characters
        <br />• Don&apos;t reuse passwords from other sites
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
  backgroundColor: '#2e1a05',
  color: '#FF9900',
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

const warningBox = {
  backgroundColor: '#2e1a05',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #FF9900',
}

const warningText = {
  color: '#FFB84D',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const tipsTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '24px 0 12px 0',
}

const tipsList = {
  color: '#888888',
  fontSize: '13px',
  lineHeight: '24px',
  margin: '0',
}

export default ResetPasswordEmail
