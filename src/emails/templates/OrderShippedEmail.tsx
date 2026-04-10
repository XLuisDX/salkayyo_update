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

interface RecipientData {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

interface OrderShippedEmailProps {
  orderId: string
  customerName: string
  trackingNumber?: string
  carrier?: string
  estimatedDelivery?: string
  recipientData: RecipientData
  appUrl?: string
}

export const OrderShippedEmail = ({
  orderId,
  customerName,
  trackingNumber,
  carrier,
  estimatedDelivery,
  recipientData,
  appUrl = 'https://saklayyo.com',
}: OrderShippedEmailProps) => {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  return (
    <EmailBase preview={`Your order #${orderNumber} has shipped!`}>
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>📦 Shipped</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        Your order is on its way!
      </Heading>

      <Text style={paragraph}>
        Hi {customerName},
      </Text>

      <Text style={paragraph}>
        Great news! Your order #{orderNumber} has been shipped and is on its way
        to you. Here are the shipping details:
      </Text>

      {/* Tracking Info */}
      <Section style={trackingBox}>
        <Row>
          <Column>
            <Text style={trackingLabel}>Order Number</Text>
            <Text style={trackingValue}>{orderNumber}</Text>
          </Column>
          {carrier && (
            <Column>
              <Text style={trackingLabel}>Carrier</Text>
              <Text style={trackingValue}>{carrier}</Text>
            </Column>
          )}
        </Row>

        {trackingNumber && (
          <>
            <Hr style={trackingDivider} />
            <Text style={trackingLabel}>Tracking Number</Text>
            <Text style={trackingNumber_}>{trackingNumber}</Text>
          </>
        )}

        {estimatedDelivery && (
          <>
            <Hr style={trackingDivider} />
            <Text style={trackingLabel}>Estimated Delivery</Text>
            <Text style={estimatedDate}>{estimatedDelivery}</Text>
          </>
        )}
      </Section>

      {/* Progress Indicator */}
      <Section style={progressSection}>
        <Text style={progressTitle}>Order Progress</Text>
        <Section style={progressBar}>
          <Row>
            <Column style={progressStep}>
              <Text style={stepDot}>✓</Text>
              <Text style={stepLabel}>Ordered</Text>
            </Column>
            <Column style={progressStep}>
              <Text style={stepDot}>✓</Text>
              <Text style={stepLabel}>Packed</Text>
            </Column>
            <Column style={progressStepActive}>
              <Text style={stepDotActive}>◉</Text>
              <Text style={stepLabelActive}>Shipped</Text>
            </Column>
            <Column style={progressStep}>
              <Text style={stepDotPending}>○</Text>
              <Text style={stepLabel}>Delivered</Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Hr style={divider} />

      {/* Shipping Address */}
      <Text style={sectionTitle}>Shipping To</Text>
      <Section style={addressBox}>
        <Text style={addressText}>
          {recipientData.fullName}
          <br />
          {recipientData.address}
          <br />
          {recipientData.city}, {recipientData.state} {recipientData.zipCode}
          <br />
          {recipientData.country}
        </Text>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <EmailButton href={`${appUrl}/orders/${orderId}`}>
          Track Your Order
        </EmailButton>
      </Section>

      <Text style={smallText}>
        You&apos;ll receive another email when your order is delivered.
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

const trackingBox = {
  backgroundColor: '#1a1a1a',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #262626',
  marginTop: '24px',
}

const trackingLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
}

const trackingValue = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}

const trackingDivider = {
  borderColor: '#262626',
  margin: '16px 0',
}

const trackingNumber_ = {
  color: '#99FF00',
  fontSize: '20px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0',
}

const estimatedDate = {
  color: '#00AAFF',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
}

const progressSection = {
  marginTop: '32px',
}

const progressTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
}

const progressBar = {
  padding: '0 20px',
}

const progressStep = {
  textAlign: 'center' as const,
}

const progressStepActive = {
  textAlign: 'center' as const,
}

const stepDot = {
  color: '#00FF88',
  fontSize: '16px',
  margin: '0',
}

const stepDotActive = {
  color: '#00AAFF',
  fontSize: '18px',
  margin: '0',
}

const stepDotPending = {
  color: '#444444',
  fontSize: '16px',
  margin: '0',
}

const stepLabel = {
  color: '#666666',
  fontSize: '11px',
  margin: '4px 0 0 0',
}

const stepLabelActive = {
  color: '#00AAFF',
  fontSize: '11px',
  fontWeight: '600',
  margin: '4px 0 0 0',
}

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const sectionTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const addressBox = {
  backgroundColor: '#1a1a1a',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #262626',
}

const addressText = {
  color: '#d4d4d4',
  fontSize: '14px',
  lineHeight: '24px',
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
  margin: '0',
  textAlign: 'center' as const,
}

export default OrderShippedEmail
