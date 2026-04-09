import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import { Resend } from 'resend'

admin.initializeApp()

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

const db = admin.firestore()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})
const resend = new Resend(process.env.RESEND_API_KEY)

// Stripe Webhook Handler
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'] as string

  if (!signature) {
    res.status(400).send('Missing stripe-signature header')
    return
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: unknown) {
    const message = getErrorMessage(err)
    console.error('Webhook signature verification failed:', message)
    res.status(400).send(`Webhook Error: ${message}`)
    return
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await db.collection('orders').doc(orderId).update({
            status: 'paid',
            paymentId: session.payment_intent as string,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })

          console.log(`Order ${orderId} marked as paid`)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await db.collection('orders').doc(orderId).update({
            status: 'cancelled',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })

          console.log(`Order ${orderId} cancelled (session expired)`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error: unknown) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: getErrorMessage(error) })
  }
})

// Send order confirmation email when order status changes to 'paid'
export const onOrderPaid = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    // Only proceed if status changed to 'paid'
    if (beforeData.status !== 'paid' && afterData.status === 'paid') {
      try {
        // Get user email
        const userDoc = await db.collection('users').doc(afterData.userId).get()
        const userData = userDoc.data()

        if (userData?.email) {
          await resend.emails.send({
            from: 'Saklayyo Store <orders@saklayyo.com>',
            to: userData.email,
            subject: `Order Confirmation #${orderId.slice(0, 8)}`,
            html: `
              <h1>Thank you for your order!</h1>
              <p>Your order #${orderId.slice(0, 8)} has been confirmed.</p>
              <p><strong>Total:</strong> $${afterData.total.toFixed(2)}</p>
              <p>We'll notify you when your order ships.</p>
            `,
          })

          console.log(`Confirmation email sent for order ${orderId}`)
        }

        // Update product stock
        for (const item of afterData.items) {
          const productRef = db.collection('products').doc(item.productId)
          await productRef.update({
            stock: admin.firestore.FieldValue.increment(-item.quantity),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        }
      } catch (error) {
        console.error('Error processing paid order:', error)
      }
    }
  })

// Send shipping notification when order status changes to 'shipped'
export const onOrderShipped = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    if (beforeData.status !== 'shipped' && afterData.status === 'shipped') {
      try {
        const userDoc = await db.collection('users').doc(afterData.userId).get()
        const userData = userDoc.data()

        if (userData?.email) {
          await resend.emails.send({
            from: 'Saklayyo Store <orders@saklayyo.com>',
            to: userData.email,
            subject: `Your Order #${orderId.slice(0, 8)} Has Shipped!`,
            html: `
              <h1>Your order is on its way!</h1>
              <p>Order #${orderId.slice(0, 8)} has been shipped.</p>
              <p>Shipping to:</p>
              <p>
                ${afterData.recipientData.fullName}<br>
                ${afterData.recipientData.address}<br>
                ${afterData.recipientData.city}, ${afterData.recipientData.state} ${afterData.recipientData.zipCode}
              </p>
            `,
          })

          console.log(`Shipping notification sent for order ${orderId}`)
        }
      } catch (error) {
        console.error('Error sending shipping notification:', error)
      }
    }
  })

// Clean up old pending orders (older than 24 hours)
export const cleanupPendingOrders = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async () => {
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - 24)

    const pendingOrders = await db
      .collection('orders')
      .where('status', '==', 'pending')
      .where('createdAt', '<', cutoffTime)
      .get()

    const batch = db.batch()

    pendingOrders.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    await batch.commit()

    console.log(`Cleaned up ${pendingOrders.size} pending orders`)
  })

// Welcome email on new user creation
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snapshot) => {
    const userData = snapshot.data()

    if (userData?.email) {
      try {
        await resend.emails.send({
          from: 'Saklayyo Store <welcome@saklayyo.com>',
          to: userData.email,
          subject: 'Welcome to Saklayyo Store!',
          html: `
            <h1>Welcome to Saklayyo Store!</h1>
            <p>Hi ${userData.name || 'there'},</p>
            <p>Thank you for creating an account with us. We're excited to have you!</p>
            <p>Start shopping now and discover amazing products at great prices.</p>
            <p>
              <a href="${process.env.APP_URL}/products" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Start Shopping
              </a>
            </p>
          `,
        })

        console.log(`Welcome email sent to ${userData.email}`)
      } catch (error) {
        console.error('Error sending welcome email:', error)
      }
    }
  })
