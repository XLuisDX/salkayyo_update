import {
  Column,
  Heading,
  Hr,
  Img,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailBase, EmailButton } from '../components'

interface OrderItem {
  title: string
  quantity: number
  price: number
  image?: string
}

interface OrderCancelledEmailProps {
  orderId: string
  customerName: string
  items: OrderItem[]
  total: number
  reason?: string
  refundStatus?: 'pending' | 'processed' | 'completed'
  appUrl?: string
}

export const OrderCancelledEmail = ({
  orderId,
  customerName,
  items,
  total,
  reason,
  refundStatus = 'pending',
  appUrl = 'https://saklayyo.com',
}: OrderCancelledEmailProps) => {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  const getRefundStatusText = () => {
    switch (refundStatus) {
      case 'completed':
        return 'Your refund has been processed and should appear in your account within 5-10 business days.'
      case 'processed':
        return 'Your refund is being processed. It should appear in your account within 5-10 business days.'
      default:
        return 'If you made a payment, a refund will be processed automatically within 3-5 business days.'
    }
  }

  return (
    <EmailBase preview={`Order #${orderNumber} has been cancelled`}>
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>❌ Order Cancelled</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        Your order has been cancelled
      </Heading>

      <Text style={paragraph}>
        Hi {customerName},
      </Text>

      <Text style={paragraph}>
        Your order #{orderNumber} has been cancelled.
        {reason && ` Reason: ${reason}`}
      </Text>

      {/* Order Info */}
      <Section style={orderBox}>
        <Text style={orderLabel}>Cancelled Order</Text>
        <Text style={orderNumber_}>{orderNumber}</Text>
        <Text style={orderTotal}>Total: ${total.toFixed(2)}</Text>
      </Section>

      {/* Items */}
      <Hr style={divider} />
      <Text style={sectionTitle}>Items in this order</Text>

      {items.map((item, index) => (
        <Section key={index} style={itemRow}>
          <Row>
            <Column style={itemImageCol}>
              {item.image ? (
                <Img
                  src={item.image}
                  width="50"
                  height="50"
                  alt={item.title}
                  style={itemImage}
                />
              ) : (
                <Section style={itemPlaceholder}>
                  <Text style={itemPlaceholderText}>📦</Text>
                </Section>
              )}
            </Column>
            <Column style={itemDetailsCol}>
              <Text style={itemTitle}>{item.title}</Text>
              <Text style={itemQuantity}>
                Qty: {item.quantity} × ${item.price.toFixed(2)}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}

      <Hr style={divider} />

      {/* Refund Info */}
      <Section style={refundBox}>
        <Text style={refundIcon}>💰</Text>
        <Text style={refundTitle}>Refund Information</Text>
        <Text style={refundText}>{getRefundStatusText()}</Text>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <Text style={ctaText}>
          Want to shop again? Browse our latest products:
        </Text>
        <EmailButton href={`${appUrl}/products`}>
          Continue Shopping
        </EmailButton>
      </Section>

      {/* Support */}
      <Section style={supportBox}>
        <Text style={supportText}>
          If you have any questions about this cancellation or your refund,
          please don&apos;t hesitate to contact our support team.
        </Text>
        <EmailButton href={`${appUrl}/support`} variant="outline">
          Contact Support
        </EmailButton>
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
  backgroundColor: '#2e0505',
  color: '#FF4444',
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

const orderBox = {
  backgroundColor: '#1a1a1a',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #262626',
  textAlign: 'center' as const,
  marginTop: '24px',
}

const orderLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px 0',
}

const orderNumber_ = {
  color: '#FF4444',
  fontSize: '28px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0 0 8px 0',
  textDecoration: 'line-through',
}

const orderTotal = {
  color: '#888888',
  fontSize: '16px',
  margin: '0',
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

const itemRow = {
  marginBottom: '12px',
  opacity: '0.6',
}

const itemImageCol = {
  width: '60px',
}

const itemImage = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
  filter: 'grayscale(100%)',
}

const itemPlaceholder = {
  width: '50px',
  height: '50px',
  backgroundColor: '#262626',
  borderRadius: '8px',
  textAlign: 'center' as const,
  lineHeight: '50px',
}

const itemPlaceholderText = {
  fontSize: '20px',
  margin: '0',
  lineHeight: '50px',
}

const itemDetailsCol = {
  paddingLeft: '12px',
  verticalAlign: 'middle' as const,
}

const itemTitle = {
  color: '#888888',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px 0',
}

const itemQuantity = {
  color: '#555555',
  fontSize: '13px',
  margin: '0',
}

const refundBox = {
  backgroundColor: '#1a2e05',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #99FF00',
  textAlign: 'center' as const,
}

const refundIcon = {
  fontSize: '32px',
  margin: '0 0 12px 0',
}

const refundTitle = {
  color: '#99FF00',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const refundText = {
  color: '#BBFF66',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaText = {
  color: '#888888',
  fontSize: '14px',
  margin: '0 0 16px 0',
}

const supportBox = {
  backgroundColor: '#1a1a1a',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #262626',
  textAlign: 'center' as const,
}

const supportText = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px 0',
}

export default OrderCancelledEmail
