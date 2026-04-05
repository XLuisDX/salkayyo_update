import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/firebase/admin'
import { Resend } from 'resend'
import { CartItem, RecipientData } from '@/types'

const PAYPAL_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const resend = new Resend(process.env.RESEND_API_KEY)

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, items, recipientData, userId, total } = body as {
      orderId: string
      items: CartItem[]
      recipientData: RecipientData
      userId: string
      total: number
    }

    if (!orderId || !items || !recipientData || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Capture the PayPal order
    const accessToken = await getPayPalAccessToken()

    const captureResponse = await fetch(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const captureData = await captureResponse.json()

    if (!captureResponse.ok) {
      console.error('PayPal capture error:', captureData)
      return NextResponse.json(
        { error: captureData.message || 'Failed to capture PayPal order' },
        { status: captureResponse.status }
      )
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const tax = subtotal * 0.09

    // Create order in Firestore
    const db = getAdminDb()
    const orderRef = await db.collection('orders').add({
      userId,
      items: items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || '',
      })),
      subtotal,
      tax,
      total,
      status: 'paid',
      paymentMethod: 'paypal',
      paymentId: captureData.id,
      recipientData,
      createdAt: new Date(),
      paidAt: new Date(),
    })

    // Get user email
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (userData?.email) {
      // Send confirmation email
      await resend.emails.send({
        from: 'Saklayyo Store <orders@saklayyo.com>',
        to: userData.email,
        subject: `Order Confirmation #${orderRef.id.slice(0, 8)}`,
        html: `
          <h1>Thank you for your order!</h1>
          <p>Your order #${orderRef.id.slice(0, 8)} has been confirmed.</p>
          <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          <p>We'll notify you when your order ships.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/en/orders/${orderRef.id}">View Order</a></p>
        `,
      })
    }

    // Send admin notification
    if (process.env.ADMIN_EMAIL) {
      await resend.emails.send({
        from: 'Saklayyo Store <orders@saklayyo.com>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Order #${orderRef.id.slice(0, 8)}`,
        html: `
          <h1>New Order Received (PayPal)</h1>
          <p>Order ID: ${orderRef.id}</p>
          <p>Total: $${total.toFixed(2)}</p>
          <p>Items: ${items.length}</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/en/orders/${orderRef.id}">View Order</a></p>
        `,
      })
    }

    // Update product stock
    for (const item of items) {
      const productRef = db.collection('products').doc(item.product.id)
      const productDoc = await productRef.get()
      const productData = productDoc.data()

      if (productData) {
        await productRef.update({
          stock: Math.max(0, productData.stock - item.quantity),
          updatedAt: new Date(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      captureId: captureData.id,
    })
  } catch (error: any) {
    console.error('PayPal capture error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    )
  }
}
