import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase, EmailButton } from '../components'

interface PasswordChangedEmailProps {
  name: string
  changedAt: string
  ipAddress?: string
  appUrl?: string
}

export const PasswordChangedEmail = ({
  name,
  changedAt,
  ipAddress,
  appUrl = 'https://saklayyo.com',
}: PasswordChangedEmailProps) => {
  return (
    <EmailBase preview="Your password has been changed">
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>🔒 Security Alert</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        Password changed successfully
      </Heading>

      <Text style={paragraph}>
        Hi {name || 'there'},
      </Text>

      <Text style={paragraph}>
        Your Saklayyo Store account password was successfully changed. If you
        made this change, no further action is needed.
      </Text>

      {/* Change Details */}
      <Section style={detailsBox}>
        <Text style={detailsTitle}>Change Details</Text>
        <Text style={detailsItem}>
          <strong>Date & Time:</strong> {changedAt}
        </Text>
        {ipAddress && (
          <Text style={detailsItem}>
            <strong>IP Address:</strong> {ipAddress}
          </Text>
        )}
      </Section>

      <Hr style={divider} />

      {/* Warning */}
      <Section style={warningBox}>
        <Text style={warningText}>
          ⚠️ <strong>Wasn&apos;t you?</strong> If you didn&apos;t make this change,
          your account may be compromised. Please reset your password immediately
          and contact our support team.
        </Text>
      </Section>

      <Section style={ctaSection}>
        <EmailButton href={`${appUrl}/auth/reset-password`} variant="secondary">
          Reset Password
        </EmailButton>
      </Section>

      <Text style={smallText}>
        For your security, we recommend using a unique password that you don&apos;t
        use on other websites.
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
  backgroundColor: '#051a2e',
  color: '#00AAFF',
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

const detailsBox = {
  backgroundColor: '#1a1a1a',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #262626',
  marginTop: '24px',
}

const detailsTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const detailsItem = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
}

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const warningBox = {
  backgroundColor: '#2e0505',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #FF4444',
}

const warningText = {
  color: '#FF6666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const smallText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
}

export default PasswordChangedEmail
