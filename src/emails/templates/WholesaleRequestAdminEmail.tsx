import {
  Column,
  Hr,
  Heading,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase, EmailButton } from '../components'

interface WholesaleRequestAdminEmailProps {
  companyName: string
  contactName: string
  email: string
  phone: string
  message: string
  appUrl?: string
}

export const WholesaleRequestAdminEmail = ({
  companyName,
  contactName,
  email,
  phone,
  message,
  appUrl = "https://salkayyo.com",
}: WholesaleRequestAdminEmailProps) => {
  return (
    <EmailBase preview={`New wholesale request from ${companyName}`}>
      <Section style={badgeContainer}>
        <Text style={badge}>🏢 Wholesale Request</Text>
      </Section>

      <Heading style={heading}>New wholesale quote request</Heading>

      <Section style={infoBox}>
        <Row>
          <Column>
            <Text style={infoLabel}>Company</Text>
            <Text style={infoValue}>{companyName}</Text>
          </Column>
          <Column>
            <Text style={infoLabel}>Contact</Text>
            <Text style={infoValue}>{contactName}</Text>
          </Column>
        </Row>
        <Hr style={infoDivider} />
        <Row>
          <Column>
            <Text style={infoLabel}>Email</Text>
            <Text style={infoValue}>{email}</Text>
          </Column>
          <Column>
            <Text style={infoLabel}>Phone</Text>
            <Text style={infoValue}>{phone}</Text>
          </Column>
        </Row>
      </Section>

      <Text style={sectionTitle}>Message</Text>
      <Section style={messageBox}>
        <Text style={messageText}>{message}</Text>
      </Section>

      <Section style={ctaSection}>
        <EmailButton href={`${appUrl}/admin`}>View in Admin Panel</EmailButton>
      </Section>

      <Text style={smallText}>
        This is an automated notification from Salkayyo Store.
      </Text>
    </EmailBase>
  );
};

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
  fontSize: '26px',
  fontWeight: '700',
  lineHeight: '34px',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const infoBox = {
  backgroundColor: '#1a1a1a',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #262626',
}

const infoLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
}

const infoValue = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
}

const infoDivider = {
  borderColor: '#262626',
  margin: '16px 0',
}

const sectionTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 16px 0',
}

const messageBox = {
  backgroundColor: '#1a1a1a',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #262626',
}

const messageText = {
  color: '#d4d4d4',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
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

export default WholesaleRequestAdminEmail
