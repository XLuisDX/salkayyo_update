import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getAdminDb } from '@/firebase/admin'
import { OrderItem } from '@/types'
import { getErrorMessage } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, email } = body

    if (!orderId || !email) {
      return NextResponse.json(
        { error: 'Missing orderId or email' },
        { status: 400 }
      )
    }

    const db = getAdminDb()
    const orderDoc = await db.collection('orders').doc(orderId).get()

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const orderData = orderDoc.data()!

    const itemsHtml = orderData.items
      .map(
        (item: OrderItem) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            ${item.title}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join('')

    const { data, error } = await resend.emails.send({
      from: 'Saklayyo Store <orders@saklayyo.com>',
      to: email,
      subject: `Order Confirmation #${orderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Hi ${orderData.recipientData.fullName},</p>
            <p>Thank you for your order! We're preparing it now and will notify you when it ships.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order #${orderId.slice(0, 8)}</h3>

              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eee;">Item</th>
                    <th style="text-align: center; padding: 10px; border-bottom: 2px solid #eee;">Qty</th>
                    <th style="text-align: right; padding: 10px; border-bottom: 2px solid #eee;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Subtotal:</span>
                  <span>$${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Tax (9%):</span>
                  <span>$${orderData.tax.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                  <span>Total:</span>
                  <span>$${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Shipping Address</h3>
              <p style="margin: 0;">
                ${orderData.recipientData.fullName}<br>
                ${orderData.recipientData.address}<br>
                ${orderData.recipientData.city}, ${orderData.recipientData.state} ${orderData.recipientData.zipCode}<br>
                ${orderData.recipientData.country}<br>
                ${orderData.recipientData.phone}
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/en/orders/${orderId}"
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Order
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you have any questions, reply to this email or contact our support team.
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Saklayyo Store. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error: unknown) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
