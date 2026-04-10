// Email Templates for Firebase Functions
// These are HTML templates that match the React Email design

const COLORS = {
  bg: '#0a0a0a',
  container: '#141414',
  border: '#262626',
  lime: '#99FF00',
  limeBg: '#1a2e05',
  white: '#ffffff',
  gray: '#a3a3a3',
  lightGray: '#d4d4d4',
  darkGray: '#666666',
  green: '#00FF88',
  greenBg: '#052e1a',
  blue: '#00AAFF',
  blueBg: '#051a2e',
  orange: '#FF9900',
  orangeBg: '#2e1a05',
}

const baseTemplate = (content: string, preview: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${preview}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 20px; background-color: ${COLORS.bg};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.container}; border-radius: 16px; border: 1px solid ${COLORS.border}; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="background-color: ${COLORS.bg}; padding: 32px 40px; text-align: center; border-bottom: 1px solid ${COLORS.border};">
        <img src="https://saklayyo.com/logo.png" width="150" height="40" alt="Saklayyo" style="display: block; margin: 0 auto;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px;">
        ${content}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: ${COLORS.bg}; padding: 32px 40px; text-align: center; border-top: 1px solid ${COLORS.border};">
        <p style="color: ${COLORS.darkGray}; font-size: 12px; margin: 0 0 8px 0;">© ${new Date().getFullYear()} Saklayyo Store. All rights reserved.</p>
        <p style="color: #888888; font-size: 12px; margin: 0 0 8px 0;">Need help? Contact us at support@saklayyo.com</p>
        <p style="color: #444444; font-size: 11px; margin: 0;">Saklayyo Store • Your Premium Shopping Destination</p>
      </td>
    </tr>
  </table>
</body>
</html>
`

export function welcomeEmailTemplate(name: string, appUrl: string) {
  const content = `
    <!-- Badge -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: ${COLORS.limeBg}; color: ${COLORS.lime}; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">✨ Welcome</span>
    </div>

    <!-- Heading -->
    <h1 style="color: ${COLORS.white}; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 24px 0;">
      Welcome to <span style="color: ${COLORS.lime};">Saklayyo</span>, ${name}!
    </h1>

    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; text-align: center; margin: 0 0 24px 0;">
      We're thrilled to have you join our community of savvy shoppers. Your account has been successfully created and you're ready to explore our curated collection.
    </p>

    <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 32px 0;" />

    <!-- Features -->
    <div style="background-color: #1a1a1a; padding: 24px; border-radius: 12px; border: 1px solid ${COLORS.border};">
      <p style="color: ${COLORS.white}; font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">What you can do now:</p>

      <div style="margin-bottom: 16px;">
        <span style="font-size: 24px; vertical-align: top; margin-right: 12px;">🛍️</span>
        <span style="color: ${COLORS.lightGray}; font-size: 14px;"><strong>Shop Exclusive Products</strong><br/>Browse our premium collection with competitive prices</span>
      </div>

      <div style="margin-bottom: 16px;">
        <span style="font-size: 24px; vertical-align: top; margin-right: 12px;">📦</span>
        <span style="color: ${COLORS.lightGray}; font-size: 14px;"><strong>Track Your Orders</strong><br/>Real-time updates on your purchases</span>
      </div>

      <div>
        <span style="font-size: 24px; vertical-align: top; margin-right: 12px;">💰</span>
        <span style="color: ${COLORS.lightGray}; font-size: 14px;"><strong>Secure Payments</strong><br/>Pay with Stripe or PayPal</span>
      </div>
    </div>

    <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 32px 0;" />

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}/products" style="background-color: ${COLORS.lime}; color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Start Shopping
      </a>
    </div>

    <p style="color: ${COLORS.darkGray}; font-size: 13px; text-align: center; margin: 24px 0 0 0;">
      Questions? Simply reply to this email — we're here to help!
    </p>
  `

  return baseTemplate(content, `Welcome to Saklayyo Store, ${name}!`)
}

export function orderConfirmationTemplate(
  orderId: string,
  customerName: string,
  items: Array<{ title: string; quantity: number; price: number }>,
  subtotal: number,
  tax: number,
  total: number,
  recipientData: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
  },
  paymentMethod: string,
  appUrl: string
) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="color: ${COLORS.white}; font-size: 14px; padding: 8px 0;">${item.title}</td>
        <td style="color: ${COLORS.darkGray}; font-size: 14px; padding: 8px 0; text-align: center;">×${item.quantity}</td>
        <td style="color: ${COLORS.white}; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('')

  const content = `
    <!-- Badge -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: ${COLORS.greenBg}; color: ${COLORS.green}; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">✅ Order Confirmed</span>
    </div>

    <!-- Heading -->
    <h1 style="color: ${COLORS.white}; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 24px 0;">
      Thank you for your order!
    </h1>

    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Hi ${customerName},
    </p>
    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
      We've received your order and are getting it ready. We'll notify you when it ships.
    </p>

    <!-- Order Box -->
    <div style="background-color: #1a1a1a; padding: 24px; border-radius: 12px; border: 1px solid ${COLORS.border}; text-align: center; margin-bottom: 32px;">
      <p style="color: ${COLORS.darkGray}; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 8px 0;">Order Number</p>
      <p style="color: ${COLORS.lime}; font-size: 32px; font-weight: 700; letter-spacing: 2px; margin: 0 0 12px 0;">${orderNumber}</p>
      <p style="color: #888888; font-size: 13px; margin: 0;">Paid with ${paymentMethod === 'stripe' ? 'Card' : 'PayPal'}</p>
    </div>

    <!-- Items -->
    <p style="color: ${COLORS.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Order Summary</p>
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid ${COLORS.border};">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${itemsHtml}
        <tr>
          <td colspan="3" style="border-top: 1px solid ${COLORS.border}; padding-top: 16px;"></td>
        </tr>
        <tr>
          <td style="color: #888888; font-size: 14px; padding: 4px 0;">Subtotal</td>
          <td></td>
          <td style="color: ${COLORS.white}; font-size: 14px; padding: 4px 0; text-align: right;">$${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color: #888888; font-size: 14px; padding: 4px 0;">Tax (9%)</td>
          <td></td>
          <td style="color: ${COLORS.white}; font-size: 14px; padding: 4px 0; text-align: right;">$${tax.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color: ${COLORS.white}; font-size: 16px; font-weight: 600; padding: 16px 0 0 0;">Total</td>
          <td></td>
          <td style="color: ${COLORS.lime}; font-size: 20px; font-weight: 700; padding: 16px 0 0 0; text-align: right;">$${total.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 32px 0;" />

    <!-- Shipping Address -->
    <p style="color: ${COLORS.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Shipping Address</p>
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid ${COLORS.border};">
      <p style="color: ${COLORS.lightGray}; font-size: 14px; line-height: 24px; margin: 0;">
        ${recipientData.fullName}<br/>
        ${recipientData.address}<br/>
        ${recipientData.city}, ${recipientData.state} ${recipientData.zipCode}<br/>
        ${recipientData.country}<br/>
        📞 ${recipientData.phone}
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl}/orders/${orderId}" style="background-color: ${COLORS.lime}; color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        View Order Details
      </a>
    </div>

    <p style="color: ${COLORS.darkGray}; font-size: 13px; text-align: center; margin: 0;">
      Questions about your order? Reply to this email or contact our support team.
    </p>
  `

  return baseTemplate(content, `Order confirmed #${orderNumber} - Thank you for your purchase!`)
}

export function orderShippedTemplate(
  orderId: string,
  customerName: string,
  recipientData: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  },
  trackingNumber?: string,
  carrier?: string,
  estimatedDelivery?: string,
  appUrl?: string
) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  const content = `
    <!-- Badge -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: ${COLORS.blueBg}; color: ${COLORS.blue}; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">📦 Shipped</span>
    </div>

    <!-- Heading -->
    <h1 style="color: ${COLORS.white}; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 24px 0;">
      Your order is on its way!
    </h1>

    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Hi ${customerName},
    </p>
    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
      Great news! Your order #${orderNumber} has been shipped and is on its way to you.
    </p>

    <!-- Tracking Info -->
    <div style="background-color: #1a1a1a; padding: 24px; border-radius: 12px; border: 1px solid ${COLORS.border}; margin-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="50%">
            <p style="color: ${COLORS.darkGray}; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 4px 0;">Order Number</p>
            <p style="color: ${COLORS.white}; font-size: 16px; font-weight: 600; margin: 0;">${orderNumber}</p>
          </td>
          ${carrier ? `
          <td width="50%">
            <p style="color: ${COLORS.darkGray}; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 4px 0;">Carrier</p>
            <p style="color: ${COLORS.white}; font-size: 16px; font-weight: 600; margin: 0;">${carrier}</p>
          </td>
          ` : ''}
        </tr>
      </table>
      ${trackingNumber ? `
      <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 16px 0;" />
      <p style="color: ${COLORS.darkGray}; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 4px 0;">Tracking Number</p>
      <p style="color: ${COLORS.lime}; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin: 0;">${trackingNumber}</p>
      ` : ''}
      ${estimatedDelivery ? `
      <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 16px 0;" />
      <p style="color: ${COLORS.darkGray}; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 4px 0;">Estimated Delivery</p>
      <p style="color: ${COLORS.blue}; font-size: 18px; font-weight: 600; margin: 0;">${estimatedDelivery}</p>
      ` : ''}
    </div>

    <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 32px 0;" />

    <!-- Shipping Address -->
    <p style="color: ${COLORS.white}; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Shipping To</p>
    <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid ${COLORS.border};">
      <p style="color: ${COLORS.lightGray}; font-size: 14px; line-height: 24px; margin: 0;">
        ${recipientData.fullName}<br/>
        ${recipientData.address}<br/>
        ${recipientData.city}, ${recipientData.state} ${recipientData.zipCode}<br/>
        ${recipientData.country}
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${appUrl || 'https://saklayyo.com'}/orders/${orderId}" style="background-color: ${COLORS.lime}; color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Track Your Order
      </a>
    </div>

    <p style="color: ${COLORS.darkGray}; font-size: 13px; text-align: center; margin: 0;">
      You'll receive another email when your order is delivered.
    </p>
  `

  return baseTemplate(content, `Your order #${orderNumber} has shipped!`)
}

export function orderDeliveredTemplate(
  orderId: string,
  customerName: string,
  deliveredAt: string,
  appUrl?: string
) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  const content = `
    <!-- Badge -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: ${COLORS.greenBg}; color: ${COLORS.green}; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">✅ Delivered</span>
    </div>

    <!-- Heading -->
    <h1 style="color: ${COLORS.white}; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 24px 0;">
      Your order has arrived!
    </h1>

    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Hi ${customerName},
    </p>
    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
      Great news! Your order #${orderNumber} has been delivered. We hope you love your purchase!
    </p>

    <!-- Delivery Box -->
    <div style="background-color: ${COLORS.greenBg}; padding: 32px; border-radius: 12px; border: 1px solid ${COLORS.green}; text-align: center; margin-bottom: 32px;">
      <p style="font-size: 48px; margin: 0 0 16px 0;">🎉</p>
      <p style="color: ${COLORS.green}; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">Successfully Delivered</p>
      <p style="color: #88FFBB; font-size: 14px; margin: 0;">Delivered on ${deliveredAt}</p>
    </div>

    <hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 32px 0;" />

    <!-- Review Request -->
    <div style="text-align: center;">
      <p style="color: ${COLORS.white}; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">How was your experience?</p>
      <p style="color: #888888; font-size: 14px; line-height: 22px; margin: 0 0 20px 0;">
        We'd love to hear your feedback! Share your thoughts to help other shoppers and help us improve.
      </p>
      <p style="font-size: 32px; letter-spacing: 8px; margin: 0 0 20px 0;">⭐ ⭐ ⭐ ⭐ ⭐</p>
      <a href="${appUrl || 'https://saklayyo.com'}/orders/${orderId}?review=true" style="background-color: ${COLORS.lime}; color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Leave a Review
      </a>
    </div>

    <p style="color: ${COLORS.darkGray}; font-size: 13px; text-align: center; margin: 24px 0 0 0;">
      Thank you for shopping with Saklayyo!
    </p>
  `

  return baseTemplate(content, `Your order #${orderNumber} has been delivered!`)
}

export function orderCancelledTemplate(
  orderId: string,
  customerName: string,
  total: number,
  reason?: string,
  appUrl?: string
) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  const content = `
    <!-- Badge -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="background-color: #2e0505; color: #FF4444; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 1px;">❌ Order Cancelled</span>
    </div>

    <!-- Heading -->
    <h1 style="color: ${COLORS.white}; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 24px 0;">
      Your order has been cancelled
    </h1>

    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">
      Hi ${customerName},
    </p>
    <p style="color: ${COLORS.gray}; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
      Your order #${orderNumber} has been cancelled.${reason ? ` Reason: ${reason}` : ''}
    </p>

    <!-- Order Box -->
    <div style="background-color: #1a1a1a; padding: 24px; border-radius: 12px; border: 1px solid ${COLORS.border}; text-align: center; margin-bottom: 32px;">
      <p style="color: ${COLORS.darkGray}; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 8px 0;">Cancelled Order</p>
      <p style="color: #FF4444; font-size: 28px; font-weight: 700; letter-spacing: 2px; margin: 0 0 8px 0; text-decoration: line-through;">${orderNumber}</p>
      <p style="color: #888888; font-size: 16px; margin: 0;">Total: $${total.toFixed(2)}</p>
    </div>

    <!-- Refund Info -->
    <div style="background-color: ${COLORS.limeBg}; padding: 24px; border-radius: 12px; border: 1px solid ${COLORS.lime}; text-align: center;">
      <p style="font-size: 32px; margin: 0 0 12px 0;">💰</p>
      <p style="color: ${COLORS.lime}; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">Refund Information</p>
      <p style="color: #BBFF66; font-size: 14px; line-height: 22px; margin: 0;">
        If you made a payment, a refund will be processed automatically within 3-5 business days.
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <p style="color: #888888; font-size: 14px; margin: 0 0 16px 0;">Want to shop again? Browse our latest products:</p>
      <a href="${appUrl || 'https://saklayyo.com'}/products" style="background-color: ${COLORS.lime}; color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
        Continue Shopping
      </a>
    </div>
  `

  return baseTemplate(content, `Order #${orderNumber} has been cancelled`)
}
