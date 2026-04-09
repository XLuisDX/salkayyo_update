import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminDb } from '@/firebase/admin'
import { Resend } from 'resend'
import { getErrorMessage } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    const message = getErrorMessage(error)
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  const db = getAdminDb()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          // Update order status to paid
          await db.collection('orders').doc(orderId).update({
            status: 'paid',
            paymentId: session.payment_intent as string,
            paidAt: new Date(),
            updatedAt: new Date(),
          })

          // Get order details for email
          const orderDoc = await db.collection('orders').doc(orderId).get()
          const orderData = orderDoc.data()

          if (orderData) {
            // Get user email
            const userDoc = await db.collection('users').doc(orderData.userId).get()
            const userData = userDoc.data()

            if (userData?.email) {
              // Send confirmation email
              await resend.emails.send({
                from: 'Saklayyo Store <orders@saklayyo.com>',
                to: userData.email,
                subject: `Order Confirmation #${orderId.slice(0, 8)}`,
                html: `
                  <h1>Thank you for your order!</h1>
                  <p>Your order #${orderId.slice(0, 8)} has been confirmed.</p>
                  <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
                  <p>We'll notify you when your order ships.</p>
                  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/en/orders/${orderId}">View Order</a></p>
                `,
              })
            }

            // Send admin notification
            if (process.env.ADMIN_EMAIL) {
              await resend.emails.send({
                from: 'Saklayyo Store <orders@saklayyo.com>',
                to: process.env.ADMIN_EMAIL,
                subject: `New Order #${orderId.slice(0, 8)}`,
                html: `
                  <h1>New Order Received</h1>
                  <p>Order ID: ${orderId}</p>
                  <p>Total: $${orderData.total.toFixed(2)}</p>
                  <p>Items: ${orderData.items.length}</p>
                  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/en/orders/${orderId}">View Order</a></p>
                `,
              })
            }

            // Update product stock
            for (const item of orderData.items) {
              const productRef = db.collection('products').doc(item.productId)
              const productDoc = await productRef.get()
              const productData = productDoc.data()

              if (productData) {
                await productRef.update({
                  stock: Math.max(0, productData.stock - item.quantity),
                  updatedAt: new Date(),
                })
              }
            }
          }
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await db.collection('orders').doc(orderId).update({
            status: 'cancelled',
            updatedAt: new Date(),
          })
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
