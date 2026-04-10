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

interface OrderItem {
  title: string
  quantity: number
  price: number
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

interface NewOrderAdminEmailProps {
  orderId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  recipientData: RecipientData
  paymentMethod: string
  createdAt: string
  appUrl?: string
}

export const NewOrderAdminEmail = ({
  orderId,
  customerName,
  customerEmail,
  items,
  subtotal,
  tax,
  total,
  recipientData,
  paymentMethod,
  createdAt,
  appUrl = 'https://saklayyo.com',
}: NewOrderAdminEmailProps) => {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  return (
    <EmailBase preview={`🔔 New Order #${orderNumber} - $${total.toFixed(2)}`}>
      {/* Badge */}
      <Section style={badgeContainer}>
        <Text style={badge}>🔔 New Order</Text>
      </Section>

      {/* Main Heading */}
      <Heading style={heading}>
        New order received!
      </Heading>

      {/* Quick Stats */}
      <Section style={statsBox}>
        <Row>
          <Column style={statCol}>
            <Text style={statLabel}>Order #</Text>
            <Text style={statValue}>{orderNumber}</Text>
          </Column>
          <Column style={statCol}>
            <Text style={statLabel}>Total</Text>
            <Text style={statValueHighlight}>${total.toFixed(2)}</Text>
          </Column>
          <Column style={statCol}>
            <Text style={statLabel}>Items</Text>
            <Text style={statValue}>{items.length}</Text>
          </Column>
        </Row>
      </Section>

      {/* Customer Info */}
      <Section style={infoSection}>
        <Text style={sectionTitle}>Customer Information</Text>
        <Section style={infoBox}>
          <Row>
            <Column>
              <Text style={infoLabel}>Name</Text>
              <Text style={infoValue}>{customerName}</Text>
            </Column>
            <Column>
              <Text style={infoLabel}>Email</Text>
              <Text style={infoValue}>{customerEmail}</Text>
            </Column>
          </Row>
          <Hr style={infoDivider} />
          <Row>
            <Column>
              <Text style={infoLabel}>Payment</Text>
              <Text style={infoValue}>
                {paymentMethod === 'stripe' ? '💳 Card (Stripe)' : '💰 PayPal'}
              </Text>
            </Column>
            <Column>
              <Text style={infoLabel}>Ordered At</Text>
              <Text style={infoValue}>{createdAt}</Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Hr style={divider} />

      {/* Order Items */}
      <Text style={sectionTitle}>Order Items</Text>
      <Section style={itemsBox}>
        {items.map((item, index) => (
          <Row key={index} style={itemRow}>
            <Column style={itemNameCol}>
              <Text style={itemName}>{item.title}</Text>
            </Column>
            <Column style={itemQtyCol}>
              <Text style={itemQty}>×{item.quantity}</Text>
            </Column>
            <Column style={itemPriceCol}>
              <Text style={itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </Column>
          </Row>
        ))}
        <Hr style={itemsDivider} />
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
          📍 {recipientData.fullName}
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
        <EmailButton href={`${appUrl}/admin/orders/${orderId}`}>
          View in Admin Panel
        </EmailButton>
      </Section>

      <Text style={smallText}>
        This is an automated notification from Saklayyo Store.
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

const statsBox = {
  backgroundColor: '#0a0a0a',
  padding: '24px',
  borderRadius: '12px',
  border: '2px solid #99FF00',
}

const statCol = {
  textAlign: 'center' as const,
}

const statLabel = {
  color: '#666666',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
}

const statValue = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
}

const statValueHighlight = {
  color: '#99FF00',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
}

const infoSection = {
  marginTop: '24px',
}

const sectionTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0',
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

const divider = {
  borderColor: '#262626',
  margin: '32px 0',
}

const itemsBox = {
  backgroundColor: '#1a1a1a',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #262626',
}

const itemRow = {
  marginBottom: '12px',
}

const itemNameCol = {
  width: '60%',
}

const itemName = {
  color: '#d4d4d4',
  fontSize: '14px',
  margin: '0',
}

const itemQtyCol = {
  width: '15%',
  textAlign: 'center' as const,
}

const itemQty = {
  color: '#888888',
  fontSize: '14px',
  margin: '0',
}

const itemPriceCol = {
  width: '25%',
  textAlign: 'right' as const,
}

const itemPrice = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const itemsDivider = {
  borderColor: '#262626',
  margin: '16px 0',
}

const totalLabel = {
  color: '#888888',
  fontSize: '14px',
  margin: '4px 0',
}

const totalValue = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '4px 0',
  textAlign: 'right' as const,
}

const grandTotalLabel = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '12px 0 0 0',
}

const grandTotalValue = {
  color: '#99FF00',
  fontSize: '20px',
  fontWeight: '700',
  margin: '12px 0 0 0',
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
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
}

export default NewOrderAdminEmail
