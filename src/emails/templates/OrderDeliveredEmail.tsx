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

interface OrderDeliveredEmailProps {
  orderId: string
  customerName: string
  deliveredAt: string
  appUrl?: string
}

export const OrderDeliveredEmail = ({
  orderId,
  customerName,
  deliveredAt,
  appUrl = 'https://saklayyo.com',
}: OrderDeliveredEmailProps) => {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  return (
    <EmailBase preview={`Your order #${orderNumber} has been delivered!`}>
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>✅ Delivered</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        Your order has arrived!
      </Heading>

      <Text style={paragraph}>
        Hi {customerName},
      </Text>

      <Text style={paragraph}>
        Great news! Your order #{orderNumber} has been delivered. We hope you
        love your purchase!
      </Text>

      {/* Delivery Info */}
      <Section style={deliveryBox}>
        <Text style={deliveryIcon}>🎉</Text>
        <Text style={deliveryTitle}>Successfully Delivered</Text>
        <Text style={deliveryDate}>Delivered on {deliveredAt}</Text>
      </Section>

      {/* Progress Indicator - Complete */}
      <Section style={progressSection}>
        <Row>
          <Column style={progressStep}>
            <Text style={stepDot}>✓</Text>
            <Text style={stepLabel}>Ordered</Text>
          </Column>
          <Column style={progressStep}>
            <Text style={stepDot}>✓</Text>
            <Text style={stepLabel}>Packed</Text>
          </Column>
          <Column style={progressStep}>
            <Text style={stepDot}>✓</Text>
            <Text style={stepLabel}>Shipped</Text>
          </Column>
          <Column style={progressStepComplete}>
            <Text style={stepDotComplete}>✓</Text>
            <Text style={stepLabelComplete}>Delivered</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {/* Review Request */}
      <Section style={reviewSection}>
        <Text style={reviewTitle}>How was your experience?</Text>
        <Text style={reviewText}>
          We&apos;d love to hear your feedback! Share your thoughts to help other
          shoppers and help us improve.
        </Text>

        <Section style={starsSection}>
          <Text style={stars}>⭐ ⭐ ⭐ ⭐ ⭐</Text>
        </Section>

        <EmailButton href={`${appUrl}/orders/${orderId}?review=true`}>
          Leave a Review
        </EmailButton>
      </Section>

      <Hr style={divider} />

      {/* Issue? */}
      <Section style={issueBox}>
        <Text style={issueTitle}>Any issues with your order?</Text>
        <Text style={issueText}>
          If something isn&apos;t right, we&apos;re here to help. Contact our support
          team and we&apos;ll make it right.
        </Text>
        <EmailButton href={`${appUrl}/support`} variant="outline">
          Contact Support
        </EmailButton>
      </Section>

      <Text style={smallText}>
        Thank you for shopping with Saklayyo!
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
  backgroundColor: '#052e1a',
  color: '#00FF88',
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

const deliveryBox = {
  backgroundColor: '#052e1a',
  padding: '32px',
  borderRadius: '12px',
  border: '1px solid #00FF88',
  textAlign: 'center' as const,
  marginTop: '24px',
}

const deliveryIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
}

const deliveryTitle = {
  color: '#00FF88',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px 0',
}

const deliveryDate = {
  color: '#88FFBB',
  fontSize: '14px',
  margin: '0',
}

const progressSection = {
  marginTop: '32px',
  padding: '0 20px',
}

const progressStep = {
  textAlign: 'center' as const,
}

const progressStepComplete = {
  textAlign: 'center' as const,
}

const stepDot = {
  color: '#00FF88',
  fontSize: '16px',
  margin: '0',
}

const stepDotComplete = {
  color: '#00FF88',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const stepLabel = {
  color: '#666666',
  fontSize: '11px',
  margin: '4px 0 0 0',
}

const stepLabelComplete = {
  color: '#00FF88',
  fontSize: '11px',
  fontWeight: '600',
  margin: '4px 0 0 0',
}

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const reviewSection = {
  textAlign: 'center' as const,
}

const reviewTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const reviewText = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 20px 0',
}

const starsSection = {
  marginBottom: '20px',
}

const stars = {
  fontSize: '32px',
  letterSpacing: '8px',
  margin: '0',
}

const issueBox = {
  backgroundColor: '#1a1a1a',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #262626',
  textAlign: 'center' as const,
}

const issueTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
}

const issueText = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px 0',
}

const smallText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
}

export default OrderDeliveredEmail
