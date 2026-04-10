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

interface RecipientData {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

interface OrderConfirmationEmailProps {
  orderId: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  recipientData: RecipientData
  paymentMethod: string
  appUrl?: string
}

export const OrderConfirmationEmail = ({
  orderId,
  customerName,
  items,
  subtotal,
  tax,
  total,
  recipientData,
  paymentMethod,
  appUrl = 'https://saklayyo.com',
}: OrderConfirmationEmailProps) => {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  return (
    <EmailBase preview={`Order confirmed #${orderNumber} - Thank you for your purchase!`}>
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>✅ Order Confirmed</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        Thank you for your order!
      </Heading>

      <Text style={paragraph}>
        Hi {customerName},
      </Text>

      <Text style={paragraph}>
        We&apos;ve received your order and are getting it ready. We&apos;ll notify you
        when it ships.
      </Text>

      {/* Order Number */}
      <Section style={orderBox}>
        <Text style={orderLabel}>Order Number</Text>
        <Text style={orderNumber_}>{orderNumber}</Text>
        <Text style={paymentBadge}>
          Paid with {paymentMethod === 'stripe' ? 'Card' : 'PayPal'}
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Order Items */}
      <Text style={sectionTitle}>Order Summary</Text>

      {items.map((item, index) => (
        <Section key={index} style={itemRow}>
          <Row>
            <Column style={itemImageCol}>
              {item.image ? (
                <Img
                  src={item.image}
                  width="60"
                  height="60"
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
              <Text style={itemQuantity}>Qty: {item.quantity}</Text>
            </Column>
            <Column style={itemPriceCol}>
              <Text style={itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}

      <Hr style={dividerLight} />

      {/* Totals */}
      <Section style={totalsSection}>
        <Row>
          <Column>
            <Text style={totalLabel}>Subtotal</Text>
          </Column>
          <Column>
            <Text style={totalValue}>${subtotal.toFixed(2)}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={totalLabel}>Tax (9%)</Text>
          </Column>
          <Column>
            <Text style={totalValue}>${tax.toFixed(2)}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={grandTotalLabel}>Total</Text>
          </Column>
          <Column>
            <Text style={grandTotalValue}>${total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {/* Shipping Address */}
      <Text style={sectionTitle}>Shipping Address</Text>
      <Section style={addressBox}>
        <Text style={addressText}>
          {recipientData.fullName}
          <br />
          {recipientData.address}
          <br />
          {recipientData.city}, {recipientData.state} {recipientData.zipCode}
          <br />
          {recipientData.country}
          <br />
          📞 {recipientData.phone}
        </Text>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <EmailButton href={`${appUrl}/orders/${orderId}`}>
          View Order Details
        </EmailButton>
      </Section>

      <Text style={smallText}>
        Questions about your order? Reply to this email or contact our support team.
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
  color: '#99FF00',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0 0 12px 0',
}

const paymentBadge = {
  color: '#888888',
  fontSize: '13px',
  margin: '0',
}

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const dividerLight = {
  borderColor: '#1f1f1f',
  margin: '16px 0',
}

const sectionTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
}

const itemRow = {
  marginBottom: '16px',
}

const itemImageCol = {
  width: '70px',
}

const itemImage = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
}

const itemPlaceholder = {
  width: '60px',
  height: '60px',
  backgroundColor: '#262626',
  borderRadius: '8px',
  textAlign: 'center' as const,
  lineHeight: '60px',
}

const itemPlaceholderText = {
  fontSize: '24px',
  margin: '0',
  lineHeight: '60px',
}

const itemDetailsCol = {
  paddingLeft: '12px',
  verticalAlign: 'top' as const,
}

const itemTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px 0',
}

const itemQuantity = {
  color: '#666666',
  fontSize: '13px',
  margin: '0',
}

const itemPriceCol = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
}

const itemPrice = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const totalsSection = {
  padding: '0',
}

const totalLabel = {
  color: '#888888',
  fontSize: '14px',
  margin: '8px 0',
}

const totalValue = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '8px 0',
  textAlign: 'right' as const,
}

const grandTotalLabel = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '16px 0 0 0',
}

const grandTotalValue = {
  color: '#99FF00',
  fontSize: '20px',
  fontWeight: '700',
  margin: '16px 0 0 0',
  textAlign: 'right' as const,
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

export default OrderConfirmationEmail
