import { Resend } from 'resend'
import { render } from '@react-email/render'
import {
  WelcomeEmail,
  VerifyEmail,
  ResetPasswordEmail,
  PasswordChangedEmail,
  OrderConfirmationEmail,
  OrderShippedEmail,
  OrderDeliveredEmail,
  OrderCancelledEmail,
  NewOrderAdminEmail,
  NewsletterWelcomeEmail,
} from '@/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESSES = {
  noreply: 'Saklayyo Store <noreply@saklayyo.com>',
  orders: 'Saklayyo Store <orders@saklayyo.com>',
  welcome: 'Saklayyo Store <welcome@saklayyo.com>',
  support: 'Saklayyo Store <support@saklayyo.com>',
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://saklayyo.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@saklayyo.com'

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

// ============================================
// AUTHENTICATION EMAILS
// ============================================

export async function sendWelcomeEmail(email: string, name: string) {
  const html = await render(WelcomeEmail({ name, appUrl: APP_URL }))

  return resend.emails.send({
    from: FROM_ADDRESSES.welcome,
    to: email,
    subject: 'Welcome to Saklayyo Store! 🎉',
    html,
  })
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationLink: string
) {
  const html = await render(VerifyEmail({ name, verificationLink }))

  return resend.emails.send({
    from: FROM_ADDRESSES.noreply,
    to: email,
    subject: 'Verify Your Email - Saklayyo Store',
    html,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
) {
  const html = await render(ResetPasswordEmail({ name, resetLink }))

  return resend.emails.send({
    from: FROM_ADDRESSES.noreply,
    to: email,
    subject: 'Reset Your Password - Saklayyo Store',
    html,
  })
}

export async function sendPasswordChangedEmail(
  email: string,
  name: string,
  changedAt: string,
  ipAddress?: string
) {
  const html = await render(
    PasswordChangedEmail({ name, changedAt, ipAddress, appUrl: APP_URL })
  )

  return resend.emails.send({
    from: FROM_ADDRESSES.noreply,
    to: email,
    subject: '🔒 Password Changed - Saklayyo Store',
    html,
  })
}

// ============================================
// ORDER EMAILS
// ============================================

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  customerName: string,
  items: OrderItem[],
  subtotal: number,
  tax: number,
  total: number,
  recipientData: RecipientData,
  paymentMethod: string
) {
  const html = await render(
    OrderConfirmationEmail({
      orderId,
      customerName,
      items,
      subtotal,
      tax,
      total,
      recipientData,
      paymentMethod,
      appUrl: APP_URL,
    })
  )

  return resend.emails.send({
    from: FROM_ADDRESSES.orders,
    to: email,
    subject: `Order Confirmed #${orderId.slice(0, 8).toUpperCase()} ✅`,
    html,
  })
}

export async function sendOrderShippedEmail(
  email: string,
  orderId: string,
  customerName: string,
  recipientData: RecipientData,
  trackingNumber?: string,
  carrier?: string,
  estimatedDelivery?: string
) {
  const html = await render(
    OrderShippedEmail({
      orderId,
      customerName,
      recipientData,
      trackingNumber,
      carrier,
      estimatedDelivery,
      appUrl: APP_URL,
    })
  )

  return resend.emails.send({
    from: FROM_ADDRESSES.orders,
    to: email,
    subject: `Your Order #${orderId.slice(0, 8).toUpperCase()} Has Shipped! 📦`,
    html,
  })
}

export async function sendOrderDeliveredEmail(
  email: string,
  orderId: string,
  customerName: string,
  deliveredAt: string
) {
  const html = await render(
    OrderDeliveredEmail({
      orderId,
      customerName,
      deliveredAt,
      appUrl: APP_URL,
    })
  )

  return resend.emails.send({
    from: FROM_ADDRESSES.orders,
    to: email,
    subject: `Your Order #${orderId.slice(0, 8).toUpperCase()} Has Been Delivered! 🎉`,
    html,
  })
}

export async function sendOrderCancelledEmail(
  email: string,
  orderId: string,
  customerName: string,
  items: OrderItem[],
  total: number,
  reason?: string,
  refundStatus?: 'pending' | 'processed' | 'completed'
) {
  const html = await render(
    OrderCancelledEmail({
      orderId,
      customerName,
      items,
      total,
      reason,
      refundStatus,
      appUrl: APP_URL,
    })
  )

  return resend.emails.send({
    from: FROM_ADDRESSES.orders,
    to: email,
    subject: `Order #${orderId.slice(0, 8).toUpperCase()} Has Been Cancelled`,
    html,
  })
}

// ============================================
// ADMIN EMAILS
// ============================================

export async function sendNewOrderAdminNotification(
  orderId: string,
  customerName: string,
  customerEmail: string,
  items: OrderItem[],
  subtotal: number,
  tax: number,
  total: number,
  recipientData: RecipientData,
  paymentMethod: string,
  createdAt: string
) {
  const html = await render(
    NewOrderAdminEmail({
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
      appUrl: APP_URL,
    })
  )

  return resend.emails.send({
    from: FROM_ADDRESSES.orders,
    to: ADMIN_EMAIL,
    subject: `🔔 New Order #${orderId.slice(0, 8).toUpperCase()} - $${total.toFixed(2)}`,
    html,
  })
}

// ============================================
// MARKETING EMAILS
// ============================================

export async function sendNewsletterWelcomeEmail(email: string) {
  const unsubscribeLink = `${APP_URL}/unsubscribe?email=${encodeURIComponent(email)}`

  const html = await render(
    NewsletterWelcomeEmail({
      email,
      unsubscribeLink,
      appUrl: APP_URL,
    })
  )

  return resend.emails.send({
    from: FROM_ADDRESSES.welcome,
    to: email,
    subject: "You're In! Welcome to the Saklayyo VIP List 🎉",
    html,
  })
}

// ============================================
// UTILITY EXPORTS
// ============================================

export const emailService = {
  // Auth
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  // Orders
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  // Admin
  sendNewOrderAdminNotification,
  // Marketing
  sendNewsletterWelcomeEmail,
}

export default emailService
