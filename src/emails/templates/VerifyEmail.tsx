import {
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase } from '../components'

interface VerifyEmailProps {
  name: string
  code: string
}

export const VerifyEmail = ({
  name,
  code,
}: VerifyEmailProps) => {
  return (
    <EmailBase preview={`Your Saklayyo verification code: ${code}`}>
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
        Thanks for signing up for Saklayyo Store! Enter this code on the
        verification page to complete your registration and unlock all features.
      </Text>

      {/* Code */}
      <Section style={codeBox}>
        <Text style={codeLabel}>YOUR VERIFICATION CODE</Text>
        <Text style={codeText}>{code}</Text>
      </Section>

      <Hr style={divider} />

      {/* Security Notice */}
      <Section style={noticeBox}>
        <Text style={noticeText}>
          🔒 This code is only valid for a short time. If it doesn&apos;t work,
          request a new one from the verification page. If you didn&apos;t create
          an account with Saklayyo Store, you can safely ignore this email.
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

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const codeBox = {
  backgroundColor: '#0a0a0a',
  padding: '32px',
  borderRadius: '16px',
  border: '2px solid #99FF00',
  textAlign: 'center' as const,
  margin: '32px 0',
}

const codeLabel = {
  color: '#99FF00',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0 0 12px 0',
}

const codeText = {
  color: '#ffffff',
  fontSize: '18px',
  fontFamily: 'monospace',
  fontWeight: '700',
  letterSpacing: '0.5px',
  margin: '0',
  wordBreak: 'break-all' as const,
  lineHeight: '26px',
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
